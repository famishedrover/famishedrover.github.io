var plantMap = null;
var stateGeoJson;
var plantGeoJson;
var plantInfo;



/*******************************
 *** State Related Functions ***
 *******************************/

function getStateColor(d) {
    return "#B6D9EE";
}

function stateStyle(feature) {
    return {
        fillColor: getStateColor(feature.properties.density),
        weight: 1,
        opacity: 0,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.3
    };
}

function zoomToState(e) {
    plantMap.fitBounds(e.target.getBounds());
}

function highlightState(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        opacity:0.3,
        fillOpacity: 0.3
    });
}

function resetHighlightState(e) {
    stateGeoJson.resetStyle(e.target);
}

function onEachStateFeature(feature, layer) {
    layer.on({
        mouseover: highlightState,
        mouseout: resetHighlightState,
        // click: zoomToState
    });
}

/*************************
 *** Plants Info Panel ***
 *************************/

function setupInfoPanel(map) {
    var infoPanel = L.control();

    infoPanel.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'plant-info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    infoPanel.update = function (props) {
        this._div.innerHTML = (props ?
            '<b>' + props.name + '</b><br />' + props.description
            : '<h4>Plant Information</h4>' + 'Hover over a plant');
    };

    return infoPanel;
}


/********************
 *** Plants Marks ***
 ********************/

function highlightPlantMarkerFeature(e) {
    let layer = e.layer;

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    plantInfo.update(layer.options.feature.properties);
}

function resetPlantMarkerFeature(e) {
    // reset info panel
    plantInfo.update();
}

function getPlantMarkerPopup(feature) {
    // set popup
    return'<h4>' + feature.properties.name + '</h4>';
}

function getClusterIcon(cluster) {
    // fillColor: feature.properties.color,
    //color: feature.properties.color,


    let markers = cluster.getAllChildMarkers();
    let hexColors = [];
    let n = 0;
    for (let i = 0; i < markers.length; i++) {
        hexColors.push(markers[i].options.feature.properties.color);
        n += 1;
    }

    let dominantColor = findDominantColor(hexColors);
    let clusterMarkerStyle = "\"height: 35px;" +
        "width: 35px;" +
        "background-color: " + dominantColor + ";" +
        "text-align: center;" +
        "font-size: 8px;" +
        "border-radius: 50%;" +
        "line-height: 35px;" +
        "opacity: 0.8;" +
        "fillOpacity: 0.8;" +
        "display: inline-block;\"";

    return L.divIcon({ html: "<span style=" + clusterMarkerStyle + ">" + n.toString() + "</span>",
        className: "cluster-icon",
        iconSize: L.point(40, 40)});
}

function getPlantMarkers() {
    function getPlantMarkerSetting(feature) {
        return {
            radius: 12,
            fillColor: feature.properties.color,
            color: feature.properties.color,
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.8,
            feature: feature
        };
    }

    let clusterMarkers = new L.MarkerClusterGroup({
        iconCreateFunction: getClusterIcon
    });

    clusterMarkers.addLayer(L.geoJSON(plantInfoData, {
        pointToLayer: function (feature, latlng) {
            let circleMarker =  L.circleMarker(latlng, getPlantMarkerSetting(feature));
            circleMarker.bindPopup(getPlantMarkerPopup(feature));
            return circleMarker;
        }
    }));

    // listen to maker events
    clusterMarkers.on('mouseover', function (e) {
        highlightPlantMarkerFeature(e);
    });
    clusterMarkers.on('mouseout', function (e) {
        resetPlantMarkerFeature(e);
    });

    return clusterMarkers;
}

function mapZoomTo(lat, lng) {
    let latlng = [lat, lng];
    plantMap.flyTo(latlng, 10);
}


/*****************
 *** Map Setup ***
 *****************/

function getTileLayer(provider="mapbox", maxZoom=16) {
    if(provider === "mapbox") {
        return L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: maxZoom,
            id: 'mapbox/light-v9',
            tileSize: 512,
            zoomOffset: -1,
            accessToken: 'pk.eyJ1IjoiZGF0YXZpemFzdSIsImEiOiJjazk3cWphM2QxOTY1M2hvbXg2b3Y0N2Q4In0.EjLCHp-Oa5wlwSk-Mzt9Jg'
        })
    } else if(provider === "stamen") {
        return L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {maxZoom: maxZoom});

    } else {
        return null;
    }
}

function setupMap(defaultLat=33.471808,
                  defaultLng=-112.08209,
                  defaultZoom=8,
                  addStateLayer=true) {
    plantMap = L.map('mapid').setView([defaultLat, defaultLng], defaultZoom);
    // add tile layer
    let tileLayer = getTileLayer();
    tileLayer.addTo(plantMap);

    // add states
    if(addStateLayer) {
        stateGeoJson = L.geoJson(plantStatesData, {
            style: stateStyle,
            onEachFeature: onEachStateFeature
        }).addTo(plantMap);
    }

    // add info panel
    plantInfo = setupInfoPanel(plantMap).addTo(plantMap);

    // add plant markers
    plantGeoJson = getPlantMarkers().addTo(plantMap);
}


