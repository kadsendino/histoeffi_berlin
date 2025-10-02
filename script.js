// magnification with which the map will start
const zoom = 13;
// co-ordinates
const lat = 52.5051;
const lng = 13.3855;


// Used to load and display tile layers on the map
// Most tile servers require attribution, which you can set under `Layer`
// L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   attribution:
//     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// }).addTo(map);
//
const htmlTemplate =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M32 18.451L16 6.031 0 18.451v-5.064L16 .967l16 12.42zM28 18v12h-8v-8h-8v8H4V18l12-9z" /></svg>';

//base_layers
const osmLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
const cartoDB = '<a href="http://cartodb.com/attributions">CartoDB</a>';
const osmUrl = "http://tile.openstreetmap.org/{z}/{x}/{y}.png";
const osmAttrib = `&copy; ${osmLink} Contributors`;
const landUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png";
const cartoAttrib = `&copy; ${osmLink} Contributors & ${cartoDB}`;
const degreyUrl = "https://sgx.geodatenzentrum.de/wmts_basemapde/tile/1.0.0/de_basemapde_web_raster_grau/default/GLOBAL_WEBMERCATOR/{z}/{y}/{x}.png"
const degreyAttrib = `&copy;${osmLink} Contributors & ${cartoDB} & <a href="http://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>`

const osmMap = L.tileLayer(osmUrl, { attribution: osmAttrib });
const landMap = L.tileLayer(landUrl, { attribution: cartoAttrib });
const degreyMap = L.tileLayer(degreyUrl, { attribution: degreyAttrib });

let config = {
  minZoom: 7,
  maxZoom: 18,
  layers: [degreyMap],
};

var baseLayers = {
  //"OSM Mapnik": osmMap,
  //CartoDB: landMap,
  Berlin: degreyMap,
};

//calling map
const map = L.map("map", config).setView([lat, lng], zoom);
var layerControl = L.control.layers(baseLayers).addTo(map);
//-----------------------------------------------------------


const marker = L.marker([52.52983, 13.3855]).addTo(map).bindPopup("Text");
const marker2 = L.marker([52.50983, 13.3955]).addTo(map).bindPopup("Text");

const markersLayer = L.layerGroup([marker,marker2]);

//--------------------------------------------------------------------------------

// Add both base and overlays to the control
layerControl.addOverlay(markersLayer, "MarkerTest");
markersLayer.addTo(map); // ensures it's visible on start

//-----------------------------------------------------------------

fetch("u6.geojson")
  .then((response) => response.json())
  .then((data) => {
    // Create GeoJSON layer
    const u6Layer = L.geoJSON(data, {
      style: {
        color: "#FF0000",       // line / polygon color
        weight: 2,           // line thickness
        fillOpacity: 0.3,    // fill opacity for polygons
      },
      onEachFeature: function (feature, layer) {
        // Optional: bind popup for each feature
        if (feature.properties && feature.properties.name) {
          layer.bindPopup(feature.properties.name);
        }
      },
    });

    // Add it to layer control and show it by default
    layerControl.addOverlay(u6Layer, "U6 GeoJSON");
    u6Layer.addTo(map);
  })
  .catch((err) => console.error("Failed to load GeoJSON:", err));


//-------------------------------------------------------------------


// create custom button
const customControl = L.Control.extend({
  // button position
  options: {
    position: "topleft",
  },

  // method
  onAdd: function (map) {
    console.log(map.getCenter());
    // create button
    const btn = L.DomUtil.create("button");
    btn.title = "back to home";
    btn.innerHTML = htmlTemplate;
    btn.className += "leaflet-bar back-to-home hidden";

    return btn;
  },
});

// adding new button to map controll
map.addControl(new customControl());

// on drag end
map.on("moveend", getCenterOfMap);

const buttonBackToHome = document.querySelector(".back-to-home");

function getCenterOfMap() {
  buttonBackToHome.classList.remove("hidden");

  buttonBackToHome.addEventListener("click", () => {
    map.flyTo([lat, lng], zoom);
  });

  map.on("moveend", () => {
    const { lat: latCenter, lng: lngCenter } = map.getCenter();

    const latC = latCenter.toFixed(3) * 1;
    const lngC = lngCenter.toFixed(3) * 1;

    const defaultCoordinate = [+lat.toFixed(3), +lng.toFixed(3)];

    const centerCoordinate = [latC, lngC];

    if (compareToArrays(centerCoordinate, defaultCoordinate)) {
      buttonBackToHome.classList.add("hidden");
    }
  });
}

const compareToArrays = (a, b) => JSON.stringify(a) === JSON.stringify(b);
