function getMiles(i) {
  return i * 0.000621371192;
}

const auth_user = 'https://www.strava.com/oauth/authorize?client_id=xxx&redirect_uri=http://localhost&response_type=code&scope=activity:read';
// the above link is how end user authroizes. This will be done once manually then we will use token/refresh token
const auth_link = 'https://www.strava.com/oauth/token';
// above link used for getting token and refreshing token
//const activites_link = 'https://www.strava.com/api/v3/athlete/activities?access_token=xxxx'
// above link used for getting activites 

function getActivites(code) {
  const activites_link = `https://www.strava.com/api/v3/athlete/activities?access_token=${code.access_token}`
  console.log(code)
  fetch(activites_link)
    .then((res) => res.json())
    //.then(res => console.log(res));
    .then(function (data) {

      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1; //January is 0!
      var yyyy = today.getFullYear();
      if (dd < 10) {
        dd = '0' + dd;
      }

      if (mm < 10) {
        mm = '0' + mm;
      }

      today = yyyy + '-' + mm + '-' + dd;
      console.log(today);
      console.log(data[0].start_date.slice(0, 10));

      if (today === data[0].start_date.slice(0, 10)) {
      
        document.getElementById('run').innerHTML = `user ran ${getMiles(data[0].distance)} miles today !`
      } else {
        document.getElementById('run').innerHTML = `user has not run today!!`;
      }

      var mymap = L.map('mapid').setView([38.895417, -77.033616], 11);
      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: 'mapbox/streets-v11',
        accessToken: 'xxxxx'
        }).addTo(mymap);

      
      var run_color = "red";
      var weight = 5;

      for (var x = 0; x < data.length; x++) {

        var act_id = data[x].id;
        console.log(act_id);
        console.log(data[x])

        var coordinates = L.Polyline.fromEncoded(data[x].map.summary_polyline).getLatLngs();

        if (x === 0) {
          weight = 7;
          run_color = "green";
        } else if (x === 1) {
          weight = 6;
          run_color = "blue"
        } else if (x === 2) {
          weight = 5;
          run_color = "pink";
        } else {
          weight = 2;
          run_color = "red"
        }

        L.polyline(
          coordinates,
          {
            color: run_color,
            weight: weight,
            opacity: .7,
            lineJoin: 'round'

          }
        ).addTo(mymap);
      }
    })
    .catch(function (error) {
      console.log(error);
    });

}

function reAuthorize() {
  fetch(auth_link, {
    method: 'post',

    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({

      client_id: 'xxx',
      client_secret: 'xxx',
      refresh_token: 'xxx',
      grant_type: 'refresh_token'

    })

  }).then(res => res.json())
    .then(res => getActivites(res))
}

reAuthorize()