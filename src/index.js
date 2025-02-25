/* eslint-disable */
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Globe from "globe.gl";

fetch("/geo.json", { mode: "cors" })
  .then((res) => res.json())
  .then((geoJson) => {
    fetch("/geoq.json", { mode: "cors" })
      .then((res) => res.json())
      .then((geoPJson) => {
        const geoJsonData = geoJson.features.filter((d) => d.geometry != null);
        const countriesArr = geoJsonData.filter(
          (d) => d.properties.ISO_A2 !== "AQ",
        );

        const globe = new Globe(document.querySelector("#showGlobe"))
          .globeImageUrl("dayEarth.jpg")
          .showAtmosphere(true)
          .atmosphereColor("lightskyblue")
          .polygonsData(countriesArr)
          .polygonAltitude(0.04)
          .polygonStrokeColor("red")
          .polygonSideColor(() => "rgba(0, 100, 0, 0.15)")
          .polygonStrokeColor(() => "#111")
          .onPolygonHover((hoverD, lastHoverD) => {
            if (hoverD !== lastHoverD) {
              globe
                // .polygonAltitude((d) => (d === hoverD ? 0.08 : 0.04))
                .polygonCapColor((d) =>
                  d === hoverD ? "steelblue" : "#ffaa00",
                );
            }
          })
          .polygonsTransitionDuration(250)
          .onPolygonClick((polygon) => {
            console.log(polygon);
          });

        function drawProvincesBorders() {
          const newArr = [];
          console.log(geoPJson.features)
          for (let feature of geoPJson.features) {
            if (feature.properties.iso_a2 == "TR") {
              newArr.push(feature);
              console.log(feature)
            }
          }
          const result = [...countriesArr, ...newArr];
          globe.polygonsData([]);
          globe.polygonsData(result);
          //try geometryPolygonsData
          //as last remedy, code a function by yourself that draws province borders
        }
        drawProvincesBorders();





        // globe.onGlobeClick(({lat, lng}, e) => {
        //     console.log(lat, lng)
        // })

        function triggerCountry(countryISO){
            //handle camera focus (make it static unless focus is being losed)
            //make altitude 0 in order to let provinces to be seen



            //show provinces
            // drawProvincesBorders(countryISO);

        }
      });
  });
