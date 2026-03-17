import os
try:
    import pickle
    import numpy as np
    from flask import Flask, request, jsonify
except ModuleNotFoundError as e:
    missing = getattr(e, "name", str(e))
    raise SystemExit(
        f"Missing dependency: {missing}.\nInstall dependencies with: python -m pip install -r requirements.txt"
    ) from e

app = Flask(__name__)

# Load trained model and scaler from files relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "standscaler.pkl")

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
except FileNotFoundError as e:
    raise SystemExit(f"Model file not found at {MODEL_PATH}. Make sure model.pkl exists.") from e
except Exception as e:
    raise SystemExit(f"Failed to load model from {MODEL_PATH}: {e}") from e

try:
    with open(SCALER_PATH, "rb") as f:
        scaler = pickle.load(f)
except FileNotFoundError as e:
    raise SystemExit(f"Scaler file not found at {SCALER_PATH}. Make sure standscaler.pkl exists.") from e
except Exception as e:
    raise SystemExit(f"Failed to load scaler from {SCALER_PATH}: {e}") from e

# Label to crop mapping
crop_map = {
    1: "Rice",
    2: "Maize",
    3: "Chickpea",
    4: "Kidney Beans",
    5: "Pigeon Peas",
    6: "Moth Beans",
    7: "Mung Bean",
    8: "Black Gram",
    9: "Lentil",
    10: "Pomegranate",
    11: "Banana",
    12: "Mango",
    13: "Grapes",
    14: "Watermelon",
    15: "Muskmelon",
    16: "Apple",
    17: "Orange",
    18: "Papaya",
    19: "Coconut",
    20: "Cotton",
    21: "Jute",
    22: "Coffee"
}

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "UP"})

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    try:
        temperature = float(data["temperature"])
        humidity = float(data["humidity"])
        rainfall = float(data["rainfall"])
    except KeyError as e:
        return jsonify({"error": f"Missing field: {e.args[0]}"}), 400
    except (TypeError, ValueError):
        return jsonify({"error": "temperature, humidity and rainfall must be numbers"}), 400

    input_data = np.array([[temperature, humidity, rainfall]])
    try:
        scaled_data = scaler.transform(input_data)
    except Exception as e:
        return jsonify({"error": f"Failed to scale input: {e}"}), 500

    try:
        prediction = model.predict(scaled_data)[0]
    except Exception as e:
        return jsonify({"error": f"Model prediction failed: {e}"}), 500

    try:
        crop_name = crop_map[int(prediction)]
    except Exception:
        crop_name = "Unknown"

    return jsonify({"crop": crop_name})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
