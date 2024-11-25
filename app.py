# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app)

# Load the trained model
model = joblib.load('model.pkl')

# Load the dataset for initial display and filtering
# Adjust the file paths as necessary
df = pd.concat((pd.read_csv(f'data/crash_data_{i}.csv') for i in range(2010, 2023)), ignore_index=True)
df.dropna(subset=['latitude', 'longitud'], inplace=True)

# Ensure that the 'state' and 'county' columns are of integer type
df['state'] = df['state'].astype(int)
df['county'] = df['county'].astype(int)
df['weather'] = df['weather'].astype(int)
df['lgt_cond'] = df['lgt_cond'].astype(int)
df['year'] = df['year'].astype(int)
df['month'] = df['month'].astype(int)
df['day'] = df['day'].astype(int)
df['hour'] = df['hour'].astype(int)
df['minute'] = df['minute'].astype(int)

# Combine hour and minute into total minutes
df['time_in_minutes'] = df['hour'] * 60 + df['minute']

@app.route('/api/data', methods=['GET'])
def get_data():
    # Get query parameters for filtering
    filters = request.args
    filtered_df = df.copy()

    # Apply filters if provided
    for key, value in filters.items():
        if key in ['state', 'county', 'weather', 'lgt_cond', 'year', 'month', 'day', 'time_in_minutes']:
            try:
                value = int(value)
                filtered_df = filtered_df[filtered_df[key] == value]
            except ValueError:
                pass  # Ignore invalid filter values

    # Limit the number of records to prevent overloading the frontend
    filtered_df = filtered_df.head(40000)

    # Convert to JSON
    data = filtered_df[['latitude', 'longitud']].to_dict(orient='records')
    return jsonify(data)

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json

    # Ensure all required features are present
    required_features = ['state', 'county', 'weather', 'lgt_cond', 'time_in_minutes', 'day', 'month', 'year']
    for feature in required_features:
        if feature not in data:
            return jsonify({'error': f'Missing feature: {feature}'}), 400

    # Prepare the input features
    input_features = pd.DataFrame([{
        'state': int(data['state']),
        'county': int(data['county']),
        'weather': int(data['weather']),
        'lgt_cond': int(data['lgt_cond']),
        'time_in_minutes': int(data['time_in_minutes']),
        'day': int(data['day']),
        'month': int(data['month']),
        'year': int(data['year']),
    }])

    # Predict
    prediction = model.predict(input_features)
    latitude, longitud = prediction[0]

    return jsonify({'latitude': latitude, 'longitud': longitud})

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
