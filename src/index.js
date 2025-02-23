/* eslint-disable */ 
import "./style.css";
import * as THREE from "three";
import * as d3 from "d3";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function main(){


    d3.json("/geo.json").then(data => {
        data.features.forEach((feature) => {
            const { coordinates, type } = feature.geometry; 
            drawCountryBorders(coordinates, type);
            console.log(feature.properties.sovereignt);
        });
    });
    
    function latLngToXYZ(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
    
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
    
        return new THREE.Vector3(x, y, z);
    }

    function drawCountryBorders(coordinates, type) {
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
    }

    const canvas = document.querySelector("#canvas");
    const renderer = new THREE.WebGLRenderer({canvas});
    


    const loader = new THREE.TextureLoader();
    const texture = loader.load("/nightEarth.jpg");
    texture.colorSpace = THREE.SRGBColorSpace;
    
    // the canvas default:
    const fov = 75;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 5;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = .5;

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

main();