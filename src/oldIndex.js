/* eslint-disable */ 

import "./style.css";
import * as THREE from "three";
import * as d3 from "d3";


function main(){



    d3.json("/geo.json").then(data => {
        data.features.forEach(feature => {
            console.log(feature.geometry.coordinates );
        });
    });





    const canvas = document.querySelector("#canvas");
    const renderer = new THREE.WebGLRenderer({canvas});

    // the canvas default:
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 5;

    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    const scene = new THREE.Scene();

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);


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
        time = time / 1000;

        if(resizeRendererToDisplaySize(renderer)){
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }


        cubes.forEach(cube => {
            cube.rotation.x = time;
            cube.rotation.y = time;
        })
    
        renderer.render(scene, camera);
        
        requestAnimationFrame(render);
    }


    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);

    scene.add(light);

    function makeInstance(geometry, color, x){
        const material = new THREE.MeshPhongMaterial({color});
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        cube.position.x = x;

        return cube;
    }

    const cubes = [
        makeInstance(geometry, 0x0011ff, 0),
        makeInstance(geometry, 0xff000d, -2),
        makeInstance(geometry, 0x26ff00, 2),
    ]


    requestAnimationFrame(render);















}




