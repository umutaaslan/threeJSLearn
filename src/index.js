/* eslint-disable */ 
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Globe from "globe.gl";

 

fetch("/geo.json", {mode: "cors"}).then(res => res.json()).then(geoJson => {
    console.log(geoJson)
    const geoJsonData = geoJson.features.filter(d => d.geometry != null);
    console.log(geoJsonData.features)

    let lastHoverD = null;


    const globe = new Globe(document.querySelector("#showGlobe"))
        .globeImageUrl("dayEarth.jpg")
        .showAtmosphere(true)
        .atmosphereColor("lightskyblue")
        .polygonsData(geoJsonData.filter(d => d.properties.ISO_A2 !== 'AQ'))
        .polygonAltitude(0.04)
        .polygonStrokeColor("red")
        .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
        .polygonStrokeColor(() => '#111')
        .onPolygonHover((hoverD, lastHoverD) => { 
            if(hoverD !== lastHoverD){
                globe
                .polygonAltitude(d => d === hoverD ? 0.08 : 0.04)
                .polygonCapColor(d => d === hoverD ? 'steelblue' : "#ffaa00")    
            }

        })
        .polygonsTransitionDuration(250)
    
    
    globe.onGlobeClick(({lat, lng}, e) => {
        console.log(lat, lng)
    })

   
    
});
