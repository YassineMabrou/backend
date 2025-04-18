import sys
import joblib
import json
import numpy as np

# Load the model
MODEL_PATH = "C:\\Users\\MSI\\Desktop\\pfe\\backend\\model.joblib"

try:
    model = joblib.load(MODEL_PATH)
except FileNotFoundError:
    print(json.dumps({"error": f"Model file not found at {MODEL_PATH}"}))
    sys.exit(1)
except Exception as e:
    print(json.dumps({"error": f"Error loading model: {str(e)}"}))
    sys.exit(1)

# Read the input JSON data passed from Node.js
try:
    input_data = sys.stdin.read().strip()
    if not input_data:
        raise ValueError("No input data received")

    data = json.loads(input_data)
    features = np.array(data['features']).reshape(1, -1)
except Exception as e:
    print(json.dumps({"error": f"Invalid input data: {str(e)}"}))
    sys.exit(1)

# Make predictions
try:
    prediction = model.predict(features)
    output = {'prediction': int(prediction[0])}
    print(json.dumps(output))
except Exception as e:
    print(json.dumps({"error": f"Prediction error: {str(e)}"}))
    sys.exit(1)
