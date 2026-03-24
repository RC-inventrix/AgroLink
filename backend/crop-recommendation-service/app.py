import pickle
import numpy as np
from flask import Flask, request, jsonify
import requests
import warnings

# Suppress scikit-learn version warnings
warnings.filterwarnings("ignore", category=UserWarning)

app = Flask(__name__)

# --- 1. LOAD THE MODEL AND SCALER ---
try:
    model = pickle.load(open('model.pkl', 'rb'))
    scaler = pickle.load(open('scaler.pkl', 'rb'))
    ml_ready = True
    print("✅ ML Model and Scaler loaded successfully.")
except Exception as e:
    print(f"⚠️ Error loading models: {e}")
    ml_ready = False


def get_weather_data(lat, lon):
    """
    Fetches real-time temperature, humidity, and rainfall using the free Open-Meteo API.
    This replaces the complex NASA API logic to ensure fast, reliable weather retrieval.
    """
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation"
        response = requests.get(url, timeout=5)

        if response.status_code == 200:
            data = response.json()
            current = data.get('current', {})

            temp = current.get('temperature_2m', 28.0)
            humidity = current.get('relative_humidity_2m', 70.0)
            # Precipitation from current is hourly, multiply for a baseline daily estimate
            rainfall = current.get('precipitation', 2.0) * 24

            return temp, humidity, rainfall
    except Exception as e:
        print(f"Weather API failed: {e}")

    # Safe fallback values if the API fails
    return 28.0, 75.0, 100.0


@app.route('/predict', methods=['POST'])
def predict():
    # The Java backend sends a JSON with latitude and longitude
    data = request.json
    lat = data.get('latitude')
    lon = data.get('longitude')

    # FIX FOR 400 ERROR: Validate lat/lon instead of looking for N, P, K
    if lat is None or lon is None:
        return jsonify({'error': 'Latitude and Longitude are required'}), 400

    try:
        # 1. Fetch weather based on the user's coordinates
        temp, humidity, rainfall = get_weather_data(lat, lon)

        if ml_ready:
            # FIX FOR "VEGETABLE"/WRONG CROP ERROR:
            # The scaler expects exactly 3 features: temperature, humidity, rainfall
            input_features = np.array([[temp, humidity, rainfall]])
            input_features_scaled = scaler.transform(input_features)

            # Make the prediction
            prediction = model.predict(input_features_scaled)

            # The model.pkl classes are ALREADY exact crop names (e.g., 'rice', 'apple').
            # We bypass the dictionary mapping entirely and use the prediction directly.
            recommended_crop = str(prediction[0]).capitalize()
        else:
            recommended_crop = "System Unavailable"

        # 2. Return using the exact JSON keys expected by the page.tsx frontend
        return jsonify({
            'recommended_crop': recommended_crop,
            'weather_metrics': {
                'temperature': round(temp, 2),
                'humidity': round(humidity, 2),
                'rainfall': round(rainfall, 2)
            }
        })

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': 'Internal server error during prediction'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)