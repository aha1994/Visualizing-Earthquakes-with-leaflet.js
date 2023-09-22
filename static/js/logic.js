// Api key and url for the json data
const API_KEY = "pk.eyJ1IjoiYWhhMTk5NCIsImEiOiJjazQ5N2gzdm4wMmR0M21vN256OWJmcmc3In0.e4kUXML8_OLi4xX1ATdpXA";
let data_url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'

// Making Map
var map = L.map("map", {
    center: [40, -104],
    zoom: 4
});

// Adding tile layer
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: 'mapbox/streets-v11',
        accessToken: API_KEY,
        }).addTo(map);

// Our style object
var mapStyle = {
    color: "white",
    fillColor: "black",
    fillOpacity: 0.7,
    weight: 1.5
};

// functions to get dynamic marker information

function markerColor(magnitude) {
    switch (true) {
    case magnitude > 5:
      return "#581845";
    case magnitude > 4:
      return "#900C3F";
    case magnitude > 3:
      return "#C70039";
    case magnitude > 2:
      return "#FF5733";
    case magnitude > 1:
      return "#FFC300";
    default:
      return "#DAF7A6";
    }
  }

function markerOption(quake) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: markerColor(quake['Mag']),
      color: "#000000",
      radius: quake['Mag'] * 10,
      stroke: true,
      weight: 0.5
    };
  }





// Getting data for each Earthquake in the last week
d3.json(data_url, function(dataset){
   // console.log(dataset);
    let quake_data = dataset.features;
    console.log(quake_data);
    let quakes = [];

    quake_data.forEach(function(quake) {
        quakes.push({
            'Mag':quake.properties.mag,
            'Coordinates': [quake.geometry.coordinates[1], quake.geometry.coordinates[0]],
            'Depth': quake.geometry.coordinates[2],
            'Place': quake.properties.place,
            'Time': new Date(quake.properties.time),
        })
    });
    
    console.log(quakes)

    // Adding markers at coordinates of quake
    for (var i = 0; i < quakes.length; i++) {
        let earthquake = quakes[i];
        var m = L.circleMarker(earthquake['Coordinates'], markerOption(earthquake)).addTo(map)

        // Popups to describe magnitude/location/depth
        p = new L.popup()
            .setContent("<h1>" + `Magnitude: ${earthquake['Mag']}` + "</h1> <hr> <h2>"+ `Time: ${earthquake['Time']} <br> Place: ${earthquake['Place']} <br> Depth: ${earthquake['Depth']} km` + "</h2>")
            .setLatLng(earthquake['Coordinates']);
        m.bindPopup(p);
    }


    // Adding a legend to the map
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];
        div.innerHTML += '<h5> Earthquake Magnitude</h5>';
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
    
        return div;
    };
    
    legend.addTo(map);

    // Adding a Title block to the map
    var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = '<h4>Weekly USGS Earthquake Report</h4>' +  (props ?
            '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
            : 'Click on a Colored Marker to see information about each event');
    };

    info.addTo(map);

});

