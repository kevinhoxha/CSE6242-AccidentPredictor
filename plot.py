import plotly.express as px
import pandas as pd

df = pd.read_csv("data/crash_data_2022.csv")

color_scale = [(0, 'orange'), (1,'red')]


fig = px.scatter_map(df, 
                        lat="latitude", 
                        lon="longitud", 
                        hover_name="countyname", 
                        hover_data=["countyname", "cityname"],
                        zoom=3.5, 
                        height=750,
                        width=1400)

fig.update_layout(mapbox_style="open-street-map")
fig.update_layout(margin={"r":0,"t":0,"l":0,"b":0})
fig.show()
