import pandas as pd
from tqdm import tqdm

def get_crash_data(year, format="csv"):
    url = f"https://crashviewer.nhtsa.dot.gov/CrashAPI/FARSData/GetFARSData?dataset=Accident&FromYear={year}&ToYear={year}&format={format}"
    file_name = f"data/crash_data_{year}.{format}"
    df = pd.read_csv(url)
    df = df[['caseyear','state','st_case','statename','persons','county', 'countyname','city','cityname','day','month','year','day_week','day_weekname','hour','minute','rur_urb','rur_urbname','route', 'routename','latitude','longitud','lgt_cond','lgt_condname','weather','weathername','fatals','drunk_dr']]
    df.to_csv(file_name)
    return df

for year in tqdm(range(2010, 2023)):
    get_crash_data(year)