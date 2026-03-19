from flask import Flask, request, jsonify
import requests
from datetime import datetime, timedelta
import pickle
import numpy as np
import warnings

# Suppress scikit-learn version warnings if any
warnings.filterwarnings("ignore", category=UserWarning)

app = Flask(__name__)

# --- 1. LOAD ML MODELS ---
try:
    model = pickle.load(open('model.pkl', 'rb'))
    # If your model requires scaling, uncomment these:
    # minmax_scaler = pickle.load(open('minmaxscaler.pkl', 'rb'))
    # std_scaler = pickle.load(open('standscaler.pkl', 'rb'))
    ml_ready = True
    print("✅ ML Models loaded successfully.")
except Exception as e:
    print(f"⚠️ Warning: Could not load ML models. Using rule-based fallback. Error: {e}")
    ml_ready = False

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    lat = data.get('latitude')
    lon = data.get('longitude')

    if not lat or not lon:
        return jsonify({'error': 'Latitude and Longitude are required'}), 400

    # --- 2. FETCH WEATHER DATA (NASA POWER API) ---
    # Calculates the 20-day range
    end_date = datetime.now() - timedelta(days=1)
    start_date = end_date - timedelta(days=20)
    start_str = start_date.strftime("%Y%m%d")
    end_str = end_date.strftime("%Y%m%d")

    url = (
        f"https://power.larc.nasa.gov/api/temporal/daily/point"
        f"?parameters=T2M,PRECTOTCORR,RH2M"
        f"&community=AG"
        f"&longitude={lon}"
        f"&latitude={lat}"
        f"&start={start_str}"
        f"&end={end_str}"
        f"&format=JSON"
    )

    try:
        res = requests.get(url).json()

        if "properties" not in res or "parameter" not in res["properties"]:
            return jsonify({'error': 'No weather data found for these coordinates'}), 404

        t2m_data = res["properties"]["parameter"].get("T2M", {})
        rh2m_data = res["properties"]["parameter"].get("RH2M", {})
        rain_data = res["properties"]["parameter"].get("PRECTOTCORR", {})

        # Filter valid values
        temps = [v for v in t2m_data.values() if -10 <= v <= 50]
        hums  = [v for v in rh2m_data.values() if 0 <= v <= 100]
        rains = [v for v in rain_data.values() if v >= 0]

        # Calculate averages/totals
        avg_temp = sum(temps) / len(temps) if temps else 0
        avg_hum  = sum(hums) / len(hums) if hums else 0
        total_rain = sum(rains) if rains else 0

    except Exception as e:
        return jsonify({'error': f'Failed to fetch weather data from NASA: {str(e)}'}), 500

    # --- 3. PREDICT THE CROP ---
    recommended_crop = "Unknown"

    # The standard 22-Crop ML Dataset Mapping (Alphabetical)
    crop_dictionary = {
        '1': 'Apple',
        '2': 'Banana',
        '3': 'Blackgram',
        '4': 'Chickpea',
        '5': 'Coconut',
        '6': 'Coffee',
        '7': 'Cotton',
        '8': 'Grapes',
        '9': 'Jute',
        '10': 'Kidneybeans',
        '11': 'Lentil',
        '12': 'Maize',
        '13': 'Mango',
        '14': 'Mothbeans',
        '15': 'Mungbean',
        '16': 'Muskmelon',
        '17': 'Orange',
        '18': 'Papaya',
        '19': 'Pigeonpeas',
        '20': 'Pomegranate',
        '21': 'Rice',
        '22': 'Watermelon'
    }

    if ml_ready:
        try:
            # Assuming your model expects [Temperature, Humidity, Rainfall]
            features = np.array([[avg_temp, avg_hum, total_rain]])

            # Apply scalers if required by your specific pipeline:
            # features = std_scaler.transform(features)
            # features = minmax_scaler.transform(features)

            prediction = model.predict(features)

            # The model outputs a string like '21', so we capture it directly
            predicted_id = str(prediction[0])

            # Look up the crop name using the dictionary
            recommended_crop = crop_dictionary.get(predicted_id, "Unknown Crop")
        except Exception as e:
            print(f"ML Prediction failed: {e}. Falling back to rules.")
            recommended_crop = rule_based_predict(avg_temp, avg_hum, total_rain)
    else:
        # Uses your friend's original logic if the .pkl files don't work
        recommended_crop = rule_based_predict(avg_temp, avg_hum, total_rain)

    return jsonify({
        'recommended_crop': recommended_crop,
        'weather_metrics': {
            'temperature': round(avg_temp, 2),
            'humidity': round(avg_hum, 2),
            'rainfall': round(total_rain, 2)
        }
    })

# Fallback Logic from CropPredictor.java
def rule_based_predict(avgTemp, avgHum, totalRain):
    crops = []
    if avgTemp >= 28 and totalRain >= 50: crops.append("Rice")
    if 26 <= avgTemp < 28 and avgHum < 70 and totalRain >= 20: crops.append("Maize")
    if avgTemp < 26 and totalRain < 20: crops.extend(["Chickpea", "Lentils"])
    if avgHum >= 75 and 24 <= avgTemp <= 32: crops.extend(["Banana", "Papaya"])
    if 20 <= avgTemp <= 30 and 50 <= avgHum <= 80 and totalRain < 50:
        crops.extend(["Tomato", "Cabbage", "Carrot", "Brinjal", "Okra"])
    if avgTemp > 30 and totalRain < 30: crops.extend(["Mango", "Pineapple"])

    if not crops: crops.append("Vegetables")
    return ", ".join(crops)

if __name__ == '__main__':
    # Runs on port 5000, accessible to Docker
    app.run(host='0.0.0.0', port=5000)