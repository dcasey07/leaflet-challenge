// Initialize the map
let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5
  });

// Tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Function to determine marker size based on earthquake magnitude
function markerSize(magnitude) {
    return magnitude * 15000;
}

// Function to determine marker color based on earthquake depth, lighter to darker
function markerColor(depth) {
    if (depth <= 10) {
        return '#7CFC00';
    } else if (depth <= 30) {
        return '#ADFF2F';
    } else if (depth <= 50) {
        return '#FFFF00';
    } else if (depth <= 70) {
        return '#FFA500';
    } else if (depth <= 90) {
        return '#FF0000';
    } else {
        return '#800000';
    }
}

// Fetch the GeoJSON data for all earthquakes in the last 7 days
fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
                return L.circle(latlng, {
                    radius: markerSize(feature.properties.mag),
                    color: 'black',
                    fillColor: markerColor(feature.geometry.coordinates[2]),
                    weight: 0.5,
                    fillOpacity: 0.75
                });
            },
            onEachFeature: function(feature, layer) {
                if (feature.properties && feature.properties.place) {
                    layer.bindPopup("Location: " + feature.properties.place +
                        "<br>Magnitude: " + feature.properties.mag +
                        "<br>Depth: " + feature.geometry.coordinates[2] + " km");
                }
            }
        }).addTo(myMap);
    });

// Legend denoting the color profile for the depth ranges
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 30, 50, 70, 90],
        labels = [],
        from, to;

    // White background overlay
    div.style.backgroundColor = 'white';
    div.style.padding = '10px';
    div.style.border = '1px solid #ccc';

    // Loop through the depth intervals and creation of associated label
    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' + markerColor(from + 1) + '; width:18px; height:18px; float:left; margin-right:5px; opacity:0.7;"></i> ' +
            from + (to ? '&ndash;' + to : '+') + ' km');
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(myMap);
