import React, { useRef, useEffect, useState } from "react";

// eslint-disable-next-line import/no-webpack-loader-syntax
import mapboxgl from "mapbox-gl";
import styled from "styled-components";

mapboxgl.accessToken = "pk.eyJ1IjoicGhpbGlwaSIsImEiOiJja21pbGpwaHUwaWpnMm9xbWlmbnU4enF3In0.WvrEXDS3uzd6OHta5_aG8g";
const mapHeight = `${window.innerHeight}px`;
const mapWidth = `${window.innerWidth}px`;

export default function MapaMaxBox() {
  // The following is required to stop "npm build" from transpiling mapbox code.
  // notice the exclamation point in the import.
  // @ts-ignore
  // eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
  mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;
  const mapContainer = useRef<any>();
  const map = useRef<mapboxgl.Map>();
  const [lng, setLng] = useState(-43.95319);
  const [lat, setLat] = useState(-19.90823);
  const [zoom, setZoom] = useState(14);
  const [pitch, setPitch] = useState(75.5);
  const [bearing, setBearing] = useState(57.3835);

  // const [pinRouteGeojson] = Promise.all([
  //   fetch(
  //     'https://docs.mapbox.com/mapbox-gl-js/assets/route-pin.geojson'
  //   ).then((response) => response.json()),
  //   map.current!.once('load')
  // ]);

  const popup = new mapboxgl.Popup({ closeButton: false });
  const marker = new mapboxgl.Marker({
    color: 'red',
    scale: 0.8,
    draggable: false,
    pitchAlignment: 'auto',
    rotationAlignment: 'auto'
  })
    .setLngLat([-43.95319, -19.90823])
    .setPopup(popup)
  // .addTo(map.current)
  // .togglePopup();

  const InicializeMapOnlyOnce = () => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      center: [lng, lat],
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
      style: 'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y',
      // style: 'mapbox://styles/mapbox/streets-v11',
    });
    map.current.on('move', onMapMove);
    map.current.on('load', onMapLoad);
  }
  useEffect(InicializeMapOnlyOnce);

  const onMapLoad = (event: mapboxgl.MapboxEvent<undefined> & mapboxgl.EventData) => {
    if (!map.current) return;
    map.current.addSource('mapbox-dem', {
      'type': 'raster-dem',
      'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
      'tileSize': 300,
      'maxzoom': 14
    });
    // add the DEM source as a terrain layer with exaggerated height
    // map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

    map.current.setTerrain({
      "source": "mapbox-dem",
      'exaggeration': [
        'interpolate', ['exponential', 0.5], ['zoom'], 0, 0.2, 7, 1
      ]
    });

    // add a sky layer that will show when the map is highly pitched
    map.current.addLayer({
      'id': 'sky',
      'type': 'sky',
      'paint': {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun': [0.0, 0.0],
        'sky-atmosphere-sun-intensity': 15
      }
    });

    marker.addTo(map.current)
      .togglePopup();
  };

  const onMapMove = (event: mapboxgl.MapboxEvent<MouseEvent | TouchEvent | WheelEvent | undefined> & mapboxgl.EventData) => {
    if (!map.current) return;
    setLat(+map.current.getCenter().lat.toFixed(5));
    setLng(+map.current.getCenter().lng.toFixed(5));
    setPitch(+map.current.getPitch().toFixed(5));
    setBearing(+map.current.getBearing().toFixed(5));
    setZoom(+map.current.getZoom().toFixed(1));
  };

  return (
    <WrapperMapa>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom} | Pitch: {pitch} | Bearing: {bearing}
      </div>
      <div ref={mapContainer} className="map-container-ref" />
    </WrapperMapa>
  );
}

const WrapperMapa = styled.div`
  .sidebar {
    background-color: rgba(35, 55, 75, 0.9);
    color: #fff;
    padding: 6px 12px;
    font-family: monospace;
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
    margin: 12px;
    border-radius: 4px;
  }
  .map-container-ref{
    width: ${mapWidth};
    height: ${mapHeight};
  }
`;
