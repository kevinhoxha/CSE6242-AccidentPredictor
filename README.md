# Traffic Accidents Heatmap and Prediction Application
An interactive web application that visualizes traffic accident data on a heatmap and predicts accident locations based on user-inputted conditions. The project consists of a backend built with Flask and a frontend built with React and Leaflet.

## Features
Heatmap Visualization: Displays a heatmap of traffic accidents across the United States.
Interactive Filtering: Users can filter accidents by state, county, weather conditions, light conditions, date, and time.
Accident Prediction: Predicts potential accident locations based on user-inputted conditions using a trained machine learning model.
Dynamic Map Interaction: Utilizes React Leaflet for an interactive map experience.

## Running the Application
### 1. Backend Setup
a. Install Python Dependencies
It's recommended to use a virtual environment:
```
python -m venv venv
source venv/bin/activate  # On Windows use 'venv\Scripts\activate'
```

Install the required packages:
```
pip install -r requirements.txt
```

If there's no requirements.txt, install the necessary packages:
```
pip install flask flask-cors pandas scikit-learn joblib numpy
```

b. Prepare the Data
Ensure that all your crash data CSV files (from 2010 to 2022) are placed inside the data/ directory.

c. Train the Model
If model.pkl is not provided, run model.py to train the model:
```
python model.py
```

This script will:
- Load and preprocess the data.
- Train the machine learning model.
- Save the trained model as model.pkl.

e. Run the Flask App
Start the backend server:
```
python app.py
```

The server will start and listen on http://localhost:5000.

### 2. Frontend Setup
a. Navigate to the Frontend Directory
Open a new terminal window and navigate to the frontend directory:
```
cd traffic-accidents-heatmap
```

b. Install Node.js Dependencies
```
npm install
```
This will install all necessary packages specified in package.json.

c. Start the React App
```
npm start
```
This will run the frontend at http://localhost:3000.

