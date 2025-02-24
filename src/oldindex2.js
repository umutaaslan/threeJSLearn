/* eslint-disable */ 
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function main(){


    async function getGeoData() {
        const dataRaw = await fetch("/geo.json");
        const data = await dataRaw.json();
        return data;
    };
    
    
    function latLngToXYZ(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
    
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
    
        return new THREE.Vector3(x, y, z);
    }

    async function drawCountryBorders() {
        const data = await getGeoData();

        data.features.forEach((feature) => {
            let { coordinates, type } = feature.geometry;
            
            if (type === "Polygon") {
                coordinates = [coordinates]; // Convert single Polygon to an array (for consistency)
            }
        
            coordinates.forEach((polygon) => { // Loop through each polygon (MultiPolygon)
                polygon.forEach((ring) => { // Each ring defines the outer or inner boundary
                    const points = ring.map(([lon, lat]) => latLngToXYZ(lat, lon, 5.42)); // Convert lat/lon
        
                    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });  // White border
                    const borderLine = new THREE.Line(lineGeometry, lineMaterial);
    
                    globeGroup.add(borderLine);
                });
            });
        });
       
    }
    
    drawCountryBorders();

    const canvas = document.querySelector("#canvas");
    const renderer = new THREE.WebGLRenderer({canvas});
    


    const loader = new THREE.TextureLoader();
    const texture = loader.load("/nightEarth.jpg");
    texture.colorSpace = THREE.SRGBColorSpace;
    
    // the canvas default:
    const fov = 75;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 10000;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    // controls.autoRotate = true;
    // controls.autoRotateSpeed = .5;

    camera.position.set(0, 0, 9);
    controls.update();

    const scene = new THREE.Scene();

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    
    const radius =  5.4;
    const widthSegments = 256;
    const heightSegments = 256;

    const geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments );
    const material = new THREE.MeshBasicMaterial({map: texture});

    const earth = new THREE.Mesh(geometry, material);
    globeGroup.add(earth)

    earth.position.x = 0;

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    
    const onClick = e => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(e.clientY / window.innerHeight) * 2 + 1; 

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(earth);


        if (intersects.length > 0) {
            // const { lat, lon } = getLatLngFromIntersect(intersects[0]);
            // showCountryName(lat, lon);
            const { lat, lon } = getLatLngFromIntersect(intersects);
            getCountryFromGeoJSON(lon, lat);
            console.log("onClick called")
        }
    }

    function getLatLngFromIntersect(intersects) {
            // intersects.sort((a, b) => {
            //     return a-b;
            // });
            const intersect = intersects[0];

            const { x, y, z } = intersect.point;
            console.log(intersects)
            // console.log(intersect.distance)
            // Compute latitude (correct formula)
            const lat = Math.asin(y / 5.4) * (180 / Math.PI);  // 5.4 is the sphere's radius
        
            // Compute longitude (remains the same)
            const lon = -(Math.atan2(z, x) * (180 / Math.PI));
        
    
        return { lat, lon };
    }
    
   
    // showCountryName(lat, lon){

    // }

    function pointInsidePolygon(point, polygons) {
        for (let polygon of polygons) { // Loop through each polygon
            let inside = false;
            polygon.forEach((ring) => { // Loop through each ring in the polygon
                let j = ring.length - 1;
                for (let i = 0; i < ring.length; i++) {
                    const xi = ring[i][0], yi = ring[i][1];
                    const xj = ring[j][0], yj = ring[j][1];
    
                    const intersect = ((yi > point[1]) !== (yj > point[1])) &&
                        (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
                    if (intersect) inside = !inside;
                    j = i;
                }
            });

            if (inside) return true; // ✅ Return true if any polygon contains the point
        }
        return false;
    }
    
    function getCountryFromGeoJSON(lat, lon) {
        console.log(`Clicked Coordinates: Lat ${lat}, Lon ${lon}`);

        const dataP = getGeoData();

        dataP.then(data => {
            data.features.forEach(feature => {
                if (pointInsidePolygon([lon, lat], feature.geometry.coordinates)) {
                    console.log("Clicked Country: ", feature.properties.sovereignt);
                }
            });
        })      
    }

    window.addEventListener("click", onClick);



    const color = 0xFFFFFF;
    const intensity = 50;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 0, 1);

    scene.add(light)

    function resizeRendererToDisplaySize(renderer){
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if(needResize){
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render(time){
        time /= 1000;

        if(resizeRendererToDisplaySize(renderer)){
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
        
        requestAnimationFrame(render);

        controls.update();
    }

    requestAnimationFrame(render);

}

