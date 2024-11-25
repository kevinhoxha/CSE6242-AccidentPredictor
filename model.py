import pandas as pd
import pickle
import time
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import root_mean_squared_error, mean_absolute_error
from haversine import haversine
# import matplotlib.pyplot as plt
# import plotly.express as px

# df = pd.read_csv('data/crash_data_2022.csv')

start_time = time.time()

df = pd.concat((pd.read_csv(f'data/crash_data_{i}.csv') for i in range(2010, 2023)))

# Drop rows with missing target values (latitude and longitude)
df.dropna(subset=['latitude', 'longitud'], inplace=True)

# Filter out rows where latitude and longitude are not in the appropriate range
df = df[(df['latitude'] >= -90) & (df['latitude'] <= 90) & (df['longitud'] >= -180) & (df['longitud'] <= 180)]

# Optionally, fill or drop other missing values
df.fillna(method='ffill', inplace=True)

# Combine hour and minute into total minutes
df['time_in_minutes'] = df['hour'] * 60 + df['minute']

X = df[['state', 'county', 'weather', 'lgt_cond', 'time_in_minutes', 'day', 'month', 'year']]
y = df[['latitude', 'longitud']]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2
)

# Initialize the base regressor
base_regressor = RandomForestRegressor(n_estimators=100)

# Wrap it in MultiOutputRegressor
multi_output_regressor = MultiOutputRegressor(base_regressor)

# Train the model
multi_output_regressor.fit(X_train, y_train)

end_time = time.time()
train_time = end_time - start_time

print(f"Train Time: {train_time} seconds")

start_time = time.time()

y_pred = multi_output_regressor.predict(X_test)

rmse_lat = root_mean_squared_error(y_test['latitude'], y_pred[:, 0])
rmse_long = root_mean_squared_error(y_test['longitud'], y_pred[:, 1])

mae_lat = mean_absolute_error(y_test['latitude'], y_pred[:, 0])
mae_long = mean_absolute_error(y_test['longitud'], y_pred[:, 1])

# Calculate haversine distance between each y_pred and y_test point
haversine_distances = [
    haversine((y_test.iloc[i]['latitude'], y_test.iloc[i]['longitud']), (y_pred[i, 0], y_pred[i, 1]), unit='mi')
    for i in range(len(y_test))
]

# Calculate the Mean Absolute Error (MAE) of the haversine distances
mae_haversine = sum(haversine_distances) / len(haversine_distances)

print(f"MAE Haversine Distance: {mae_haversine} miles")

print(f"RMSE Latitude: {rmse_lat}")
print(f"RMSE Longitude: {rmse_long}")

print(f"MAE Latitude: {mae_lat}")
print(f"MAE Longitude: {mae_long}")
end_time = time.time()
test_time = end_time - start_time

print(f"Test Time: {test_time} seconds")

pickle.dump(multi_output_regressor, open('model.pkl', 'wb'))

# # Calculate errors
# latitude_error = y_test['latitude'] - y_pred[:, 0]
# longitude_error = y_test['longitud'] - y_pred[:, 1]

# # Filter out very far outliers
# latitude_error = latitude_error[latitude_error.between(latitude_error.quantile(0.02), latitude_error.quantile(0.98))]
# longitude_error = longitude_error[longitude_error.between(longitude_error.quantile(0.02), longitude_error.quantile(0.98))]

# # Plot 2D histogram
# plt.figure(figsize=(10, 6))
# plt.hist2d(latitude_error, longitude_error, bins=50, cmap='viridis')
# plt.colorbar(label='Frequency')
# plt.title('2D Histogram of Latitude and Longitude Errors')
# plt.xlabel('Latitude Error')
# plt.ylabel('Longitude Error')
# plt.show()

# # Plot using plotly

# pred_df = pd.DataFrame({
#     'latitude': y_pred[:, 0],
#     'longitud': y_pred[:, 1],
#     'type': 'Predicted'
# })

# actual_df = y_test.copy()
# actual_df['type'] = 'Actual'

# combined_df = pd.concat([pred_df, actual_df])

# fig = px.scatter_mapbox(
#     combined_df,
#     lat='latitude',
#     lon='longitud',
#     color='type',
#     zoom=3.5,
#     height=750,
#     width=1400,
#     color_discrete_map={'Predicted': 'red', 'Actual': 'blue'}
# )

# fig.update_layout(mapbox_style="open-street-map")
# fig.update_layout(margin={"r":0,"t":0,"l":0,"b":0})
# fig.show()