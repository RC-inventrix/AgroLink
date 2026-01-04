import pickle
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load trained model and scaler
model = pickle.load(open("model.pkl", "rb"))
scaler = pickle.load(open("standscaler.pkl", "rb"))

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

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    temperature = data["temperature"]
    humidity = data["humidity"]
    rainfall = data["rainfall"]

    input_data = np.array([[temperature, humidity, rainfall]])
    scaled_data = scaler.transform(input_data)

    prediction = model.predict(scaled_data)[0]

    return jsonify({
        "crop": crop_map[int(prediction)]
    })

if __name__ == "__main__":
    app.run(port=5000)
