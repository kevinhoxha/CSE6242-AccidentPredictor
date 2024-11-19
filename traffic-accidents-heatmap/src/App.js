import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import './App.css';
import './MapIcons';
import HeatmapLayer from './HeatmapLayer';

// Define options for select inputs
const stateOptions = [
  { value: 1, label: 'Alabama' },
  { value: 2, label: 'Alaska' },
  { value: 4, label: 'Arizona' },
  { value: 5, label: 'Arkansas' },
  { value: 6, label: 'California' },
  { value: 8, label: 'Colorado' },
  { value: 9, label: 'Connecticut' },
  { value: 10, label: 'Delaware' },
  { value: 11, label: 'District of Columbia' },
  { value: 12, label: 'Florida' },
  { value: 13, label: 'Georgia' },
  { value: 15, label: 'Hawaii' },
  { value: 16, label: 'Idaho' },
  { value: 17, label: 'Illinois' },
  { value: 18, label: 'Indiana' },
  { value: 19, label: 'Iowa' },
  { value: 20, label: 'Kansas' },
  { value: 21, label: 'Kentucky' },
  { value: 22, label: 'Louisiana' },
  { value: 23, label: 'Maine' },
  { value: 24, label: 'Maryland' },
  { value: 25, label: 'Massachusetts' },
  { value: 26, label: 'Michigan' },
  { value: 27, label: 'Minnesota' },
  { value: 28, label: 'Mississippi' },
  { value: 29, label: 'Missouri' },
  { value: 30, label: 'Montana' },
  { value: 31, label: 'Nebraska' },
  { value: 32, label: 'Nevada' },
  { value: 33, label: 'New Hampshire' },
  { value: 34, label: 'New Jersey' },
  { value: 35, label: 'New Mexico' },
  { value: 36, label: 'New York' },
  { value: 37, label: 'North Carolina' },
  { value: 38, label: 'North Dakota' },
  { value: 39, label: 'Ohio' },
  { value: 40, label: 'Oklahoma' },
  { value: 41, label: 'Oregon' },
  { value: 42, label: 'Pennsylvania' },
  { value: 44, label: 'Rhode Island' },
  { value: 45, label: 'South Carolina' },
  { value: 46, label: 'South Dakota' },
  { value: 47, label: 'Tennessee' },
  { value: 48, label: 'Texas' },
  { value: 49, label: 'Utah' },
  { value: 50, label: 'Vermont' },
  { value: 51, label: 'Virginia' },
  { value: 53, label: 'Washington' },
  { value: 54, label: 'West Virginia' },
  { value: 55, label: 'Wisconsin' },
  { value: 56, label: 'Wyoming' },
  // Add any missing states and ensure the 'value' matches the 'state' code in your data
];

// County options mapped by state code
const countyOptionsByState = {
  '1': [
    { value: '1', label: 'Autauga County' },
    { value: '3', label: 'Baldwin County' },
    // ... other counties in Alabama
  ],
  '6': [
    { value: '1', label: 'Alameda County' },
    { value: '13', label: 'Contra Costa County' },
    // ... other counties in California
  ],
  '12': [
    { value: '1', label: 'Alachua County' },
    { value: '11', label: 'Broward County' },
    // ... other counties in Florida
  ],
  // ... other states and their counties
};

const weatherOptions = [
  { value: 1, label: 'Clear' },
  { value: 2, label: 'Rain' },
  { value: 3, label: 'Sleet/Hail' },
  { value: 4, label: 'Snow' },
  { value: 5, label: 'Fog' },
  { value: 6, label: 'Crosswinds' },
  { value: 7, label: 'Blowing Sand/Dirt' },
  { value: 8, label: 'Severe Crosswinds' },
  { value: 9, label: 'Cloudy' },
  // Add other weather conditions as per your data
];

const lightConditionOptions = [
  { value: 1, label: 'Daylight' },
  { value: 2, label: 'Dark - Not Lighted' },
  { value: 3, label: 'Dark - Lighted' },
  { value: 4, label: 'Dawn' },
  { value: 5, label: 'Dusk' },
  // Add other light conditions as per your data
];

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function App() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [predictedLocation, setPredictedLocation] = useState(null);

  // Map center and zoom level
  const [center, setCenter] = useState([37.0902, -95.7129]); // Center of the USA
  const [zoom, setZoom] = useState(5);

  // Fetch data when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Prepare filters by parsing values to integers where necessary
        const preparedFilters = {};
        if (filters.state) preparedFilters.state = parseInt(filters.state);
        if (filters.county) preparedFilters.county = parseInt(filters.county);
        if (filters.weather) preparedFilters.weather = parseInt(filters.weather);
        if (filters.lgt_cond) preparedFilters.lgt_cond = parseInt(filters.lgt_cond);

        if (filters.date) {
          const dateParts = filters.date.split('-');
          preparedFilters.year = parseInt(dateParts[0]);
          preparedFilters.month = parseInt(dateParts[1]);
          preparedFilters.day = parseInt(dateParts[2]);
        }
        if (filters.time) {
          const timeParts = filters.time.split(':');
          const hours = parseInt(timeParts[0]);
          const minutes = parseInt(timeParts[1]);
          preparedFilters.time_in_minutes = hours * 60 + minutes;
        }

        const response = await axios.get('http://localhost:5000/api/data', {
          params: preparedFilters,
        });
        setData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === 'state') {
      setFilters({
        ...filters,
        state: value,
        county: '', // Reset county when state changes
      });
    } else {
      setFilters({
        ...filters,
        [name]: value,
      });
    }
  };

  // Handle prediction request
  const handlePredict = async () => {
    try {
      // Extract day, month, year from filters.date
      let day = 1,
        month = 1,
        year = 2020;
      if (filters.date) {
        const dateParts = filters.date.split('-');
        year = parseInt(dateParts[0]);
        month = parseInt(dateParts[1]);
        day = parseInt(dateParts[2]);
      }

      // Extract time_in_minutes from filters.time
      let time_in_minutes = 720; // default to 12:00 PM
      if (filters.time) {
        const timeParts = filters.time.split(':');
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        time_in_minutes = hours * 60 + minutes;
      }

      const response = await axios.post('http://localhost:5000/api/predict', {
        state: parseInt(filters.state) || 1,
        county: parseInt(filters.county) || 1,
        weather: parseInt(filters.weather) || 1,
        lgt_cond: parseInt(filters.lgt_cond) || 1,
        time_in_minutes: time_in_minutes,
        day: day,
        month: month,
        year: year,
      });
      const { latitude, longitud } = response.data;

      setPredictedLocation([latitude, longitud]);

      // Center the map on the predicted location
      setCenter([latitude, longitud]);
      setZoom(9);
    } catch (error) {
      console.error(error);
    }
  };

  // Prepare data for heatmap
  const heatmapPoints = data.map((point) => [
    point.latitude,
    point.longitud,
    0.5, // Adjust intensity as needed
  ]);

  return (
    <div>
      <div className="sidebar">
        <h3>Filter Options</h3>
        {/* State Dropdown */}
        <div className="filter-group">
          <label>State:</label>
          <select
            name="state"
            value={filters.state || ''}
            onChange={handleFilterChange}
          >
            <option value="">Select State</option>
            {stateOptions.map((state) => (
              <option value={state.value} key={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>
        {/* County Dropdown */}
        <div className="filter-group">
          <label>County:</label>
          <select
            name="county"
            value={filters.county || ''}
            onChange={handleFilterChange}
            disabled={!filters.state}
          >
            <option value="">Select County</option>
            {filters.state &&
              countyOptionsByState[filters.state]?.map((county) => (
                <option value={county.value} key={county.value}>
                  {county.label}
                </option>
              ))}
          </select>
        </div>
        {/* Weather Dropdown */}
        <div className="filter-group">
          <label>Weather:</label>
          <select
            name="weather"
            value={filters.weather || ''}
            onChange={handleFilterChange}
          >
            <option value="">Select Weather</option>
            {weatherOptions.map((weather) => (
              <option value={weather.value} key={weather.value}>
                {weather.label}
              </option>
            ))}
          </select>
        </div>
        {/* Light Condition Dropdown */}
        <div className="filter-group">
          <label>Light Condition:</label>
          <select
            name="lgt_cond"
            value={filters.lgt_cond || ''}
            onChange={handleFilterChange}
          >
            <option value="">Select Light Condition</option>
            {lightConditionOptions.map((light) => (
              <option value={light.value} key={light.value}>
                {light.label}
              </option>
            ))}
          </select>
        </div>
        {/* Date Picker */}
        <div className="filter-group">
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={filters.date || ''}
            onChange={handleFilterChange}
          />
        </div>
        {/* Time Picker */}
        <div className="filter-group">
          <label>Time:</label>
          <input
            type="time"
            name="time"
            value={filters.time || ''}
            onChange={handleFilterChange}
          />
        </div>
        <button onClick={handlePredict}>Predict Accident Location</button>
      </div>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100vh', width: '100%' }}
      >
        <ChangeMapView center={center} zoom={zoom} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap.Mapnik">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <HeatmapLayer points={heatmapPoints} />
        {predictedLocation && (
          <Marker position={predictedLocation}>
            <Popup>Predicted Accident Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default App;