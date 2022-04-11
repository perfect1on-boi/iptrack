function getMiles(i) {
  return i * 0.000621371192;
}

const auth_user = 'https://www.strava.com/oauth/authorize?client_id=xxxx&redirect_uri=http://localhost&response_type=code&scope=activity:read';
// the above link is how end user authroizes. This will be done once manually then we will use token/refresh token
const auth_link = 'https://www.strava.com/oauth/token';
// above link used for getting token and refreshing token
//const activites_link = 'https://www.strava.com/api/v3/athlete/activities?access_token=xxxxxx'
// above link used for getting activites 

function getActivites(code) {
  const activites_link = `https://www.strava.com/api/v3/athlete/activities?access_token=${code.access_token}`
  console.log(code)
  fetch(activites_link)
    .then((res) => res.json())
    //.then(res => console.log(res));
    .then(function (data) {

      require([
        "esri/Map",
        "esri/views/MapView",
        "esri/Graphic",
        "esri/layers/FeatureLayer",
      ], function (Map, MapView, Graphic, FeatureLayer) {

        var map = new Map({
          basemap: "dark-gray"
        });
        // explore this later...this is how to add layers hosted on AGOL
        // var featureLayer = new FeatureLayer({
        //     url: "https://services9.arcgis.com/X6ugfq6o3XVY10xo/arcgis/rest/services/pa_counties_clipshp/FeatureServer"
        //   });

        // map.add(featureLayer);
        var view = new MapView({
          center: [-77.033616, 38.895417],
          container: "viewDiv",
          map: map,
          zoom: 11
        });

        for (var x = 0; x < data.length; x++) {

          console.log(data[x])
          var coordinates = L.Polyline.fromEncoded(data[x].map.summary_polyline).getLatLngs();
          console.log(coordinates);
          var coord_array = [];

          for (var y = 0; y < coordinates.length; y++) {
            var new_arr = [];

            new_arr.push(coordinates[y].lng);
            new_arr.push(coordinates[y].lat);
            coord_array.push(new_arr);
            // console.log(coordinates[x].lng);
            // console.log(coordinates[x].lat); 
          }
          //console.log(coord_array);

          if (x === 0) {
            weight = 4;
            run_color = "yellow";
          } else if (x === 1) {
            weight = 3;
            run_color = "blue"
          } else if (x === 2) {
            weight = 2;
            run_color = "pink";
          } else {
            weight = 1;
            run_color = "red"
          }

          var polyline = {
            type: "polyline", // autocasts as new Polyline()
            paths: [
              coord_array
            ]
          };

          // Create a symbol for drawing the line
          var lineSymbol = {
            type: "simple-line", // autocasts as SimpleLineSymbol()
            color: run_color,
            width: weight
          };

          var lineAtt = {
            Name: data[x].name,
            Owner: data[x].athlete.id,
            Length: getMiles(data[x].distance)
          };

          var polylineGraphic = new Graphic({
            geometry: polyline,
            symbol: lineSymbol,
            attributes: lineAtt,
            popupTemplate: { // autocasts as new PopupTemplate()
              title: "{Name}",
              content: [{
                type: "fields",
                fieldInfos: [{
                  fieldName: "Name"
                }, {
                  fieldName: "Owner"
                }, {
                  fieldName: "Length"
                }]
              }]
            }
          });

          // Add the graphics to the view's graphics layer
          view.graphics.addMany([polylineGraphic]);
        }
      });
    })
    .catch(function (error) {
      console.log(error);
    })
};

function reAuthorize() {
  fetch(auth_link, {
    method: 'post',

    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({

      client_id: 'xxxx',
      client_secret: 'xxxxx',
      refresh_token: 'xxxxx',
      grant_type: 'refresh_token'

    })

  }).then(res => res.json())
    .then(res => getActivites(res))
}

reAuthorize()