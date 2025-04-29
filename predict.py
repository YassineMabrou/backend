import sys
import joblib
import json
import numpy as np
import warnings

# Load only the model
try:
    model = joblib.load("model.joblib")
except Exception as e:
    print(json.dumps({"error": f"Model loading error: {str(e)}"}))
    sys.exit(1)

# Label mapping based on how LabelEncoder likely encoded 'outcome'
label_mapping = {
    0: "died",
    1: "euthanized",
    2: "lived"
}

# Read and parse input
try:
    input_data = json.loads(sys.stdin.read().strip())
    raw_features = input_data['features']

    if len(raw_features) != 27:
        raise ValueError(f"Expected 27 features, got {len(raw_features)}")

    features = np.array(raw_features, dtype=np.float64).reshape(1, -1)
except Exception as e:
    print(json.dumps({"error": f"Input error: {str(e)}"}))
    sys.exit(1)

# Predict (with warnings suppressed)
try:
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        prediction = model.predict(features)

    label = label_mapping.get(int(prediction[0]), "Unknown")
    print(json.dumps({"prediction": label}))
except Exception as e:
    print(json.dumps({"error": f"Prediction error: {str(e)}"}))
    sys.exit(1)
