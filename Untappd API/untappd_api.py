import requests
from geojson import Point, Feature, FeatureCollection, dump
import config

client_id = config.credentials.get("client_id")
client_secret = config.credentials.get("client_secret")

headers = {

    'User-Agent': 'franchyze923_beer_viewer',
    'From': 'franchyze923@gmail.com'

}


response = requests.get(f"https://api.untappd.com/v4/user/checkins/franchyze923?client_id={client_id}&client_secret={client_secret}&limit=50", headers=headers).json()

checkins = response['response']['checkins']['items']

features = []

for checkin in checkins:
    #print(checkin)
    checkin_comment = checkin.get("checkin_comment")
    beer_name = checkin.get("beer").get("beer_name")
    venue_name = checkin.get("venue").get("venue_name")
    lat = checkin.get("brewery").get("location").get("lat")
    long = checkin.get("brewery").get("location").get("lng")

    print(f"Check in comment: {checkin_comment}")
    print(f"Beer name: {beer_name}")
    print(f"Venue name: {venue_name}")
    print(f"lat: {lat}")
    print(f"long: {long}")
    print("\n")

    features.append(Feature(geometry=Point((long, lat)), properties={"beer_name": beer_name, "venue_name": venue_name, "checkin_comment": checkin_comment} ))

feature_collection = FeatureCollection(features)

with open("/Users/fpolig01/Desktop/untappd_project/untappd_api.geojson", "w") as geojson_file:
    dump(feature_collection, geojson_file)