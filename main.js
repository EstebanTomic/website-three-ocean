import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import TWEEN from 'tween.js';
import {gsap} from "gsap";
import Stats from 'three/examples/jsm/libs/stats.module'



const scene = new THREE.Scene();




let cloudParticles = [], cloudParticles2 = [], cloudParticles3 = [], flash, cloud, cloud2, cloud3;
let rain, rainGeo, rainCount = 25000;
const vertex = new THREE.Vector3();


const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
});
scene.fog = new THREE.FogExp2(0x11111f, 0.0002);
renderer.setClearColor(scene.fog.color);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.ACESFilmicToneMapping;

document.body.appendChild(renderer.domElement);

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

function lerp(x, y, a) {
    return (1 - a) * x + a * y
}

function scalePercent(start, end) {
    return (scrollPercent - start) / (end - start)
}
const animationScripts = [];

// Animaciones por porcentaje de la barra
animationScripts.push({
    start: 0,
    end: 20,
    func: () => {
        storm();
       // camera.position.z = lerp(0, -500, scalePercent(0, 20));
        camera.rotation.x = lerp(0, 1.5, scalePercent(0, 20));
        //console.log(camera.position.x + " " + camera.position.y)
        console.log(camera.position);
    },
});

animationScripts.push({
    start: 20,
    end: 50,
    func: () => {
        camera.position.y = lerp(20, 1500, scalePercent(20, 50));
        setRain();
        //camera.position.y = lerp(1, 300, scalePercent(0, 40))
        //console.log(camera.position.x + " " + camera.position.y)
        console.log(camera.position);
    },
})

animationScripts.push({
    start: 50,
    end: 101,
    func: () => {
        camera.rotation.x = lerp(1.5, -1.5, scalePercent(50, 101));
        console.log(camera.position);
        //console.log(camera.position.x + " " + camera.position.y)
    },
})

let scrollPercent = 0

document.body.onscroll = () => {
    //calculate the current scroll progress as a percentage
    scrollPercent =
        ((document.documentElement.scrollTop || document.body.scrollTop) /
            ((document.documentElement.scrollHeight ||
                    document.body.scrollHeight) -
                document.documentElement.clientHeight)) *
        100
    ;
}

const stats = Stats()
document.body.appendChild(stats.dom);

function playScrollAnimations() {
    animationScripts.forEach((a) => {
        if (scrollPercent >= a.start && scrollPercent < a.end) {
            a.func()
        }
    })
}


// Lights
const ambientLight = new THREE.AmbientLight(0x555555);
scene.add( ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffeedd);
directionalLight.position.set(0,0,1);
scene.add(directionalLight);

flash = new THREE.PointLight(0x062d89, 30, 500 ,1.7);
flash.position.set(200,300,100);
const lightHelper = new THREE.PointLightHelper(flash);
scene.add(flash);
scene.add(lightHelper);

// Helpers
//const lightHelper = new THREE.PointLightHelper(pointLight);
//const gridHelper = new THREE.GridHelper(200, 50);
//scene.add(lightHelper, gridHelper);


// Water
const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );
let water = new Water(
    waterGeometry,
    {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load( 'waternormals.jpg', function ( texture ) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        } ),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
    }
);

water.rotation.x = - Math.PI / 2;
scene.add( water );

// Skybox
const sky = new Sky();
sky.scale.setScalar( 450000 );
scene.add(sky);

const uniforms = sky.material.uniforms;
uniforms[ 'turbidity' ].value = 10;
uniforms[ 'rayleigh' ].value = 2;
uniforms[ 'mieCoefficient' ].value = 0.005;
uniforms[ 'mieDirectionalG' ].value = 0.8;

const phi = THREE.MathUtils.degToRad( 89);
const theta = THREE.MathUtils.degToRad( 180 );

const sunPosition = new THREE.Vector3();
sunPosition.setFromSphericalCoords( 1, phi, theta );

uniforms[ 'sunPosition' ].value.copy(sunPosition);


// Seteamos la posición inicial
let initPos  = { x: 1, y: 20, z: 1 };
let targetPos = { x: 1, y: 20, z: -500 };
let quadPos =   { x: 1, y: 200, z: -800 };


// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1,1000);
camera.position.copy(initPos);



//Controls
//const controls = new OrbitControls( camera, renderer.domElement );
//// controls.maxPolarAngle = Math.PI * 0.495;
//// controls.target.set( 0, 10, 0 );
//controls.minDistance = 20.0;
//controls.maxDistance = 2000.0;
//controls.update();


let isRain = false;

function setRain() {
    if(!isRain) {
        flash = new THREE.PointLight(0x062d89, 30, 500 ,1.7);
        flash.position.set(0,400,0);
        scene.add(flash);
        rainGeo = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < rainCount; i++) {
            vertices.push(
                Math.random() * 520 - 160,
                Math.random() * 1600 - 150,
                Math.random() * 230 - 160
            );
        }
        rainGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        //rainGeo.setAttribute( 'position', camera.position );

        const rainMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true
        });
        rain = new THREE.Points(rainGeo, rainMaterial);
        //const box = new THREE.BoxHelper( rain, 0xffff00 );
        //scene.add( box );
        scene.add(rain);
        isRain = true;
    }
}

function rainVariation() {
    // Animacion LLuvia
    let positionAttribute = rain.geometry.getAttribute( 'position' );
    for ( let i = 0; i < positionAttribute.count; i ++ ) {
        vertex.fromBufferAttribute( positionAttribute, i );
        vertex.y -= 1;
        if (vertex.y < - 60) {
            vertex.y = 90;
        }
        positionAttribute.setXYZ( i, vertex.x, vertex.y, vertex.z );
    }
    positionAttribute.needsUpdate = true;
    if(Math.random() > 0.93 || flash.power > 100) {
        if(flash.power < 100)
            flash.position.set(
                Math.random()*400,
                300 + Math.random() *200,
                100
            );
        flash.power = 50 + Math.random() * 500;
    }
}

let isStorm = false;
function storm(){
    if (!isStorm){
        // Nube
        let loader = new THREE.TextureLoader();
        loader.load("smoke.png", function(texture){
            const cloudGeo = new THREE.PlaneGeometry(500,500);
            const cloudMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true
            });

            for(let p=0; p<25; p++) {
                cloud = new THREE.Mesh(cloudGeo,cloudMaterial);
                cloud.position.set(
                    Math.random()*800 - 400,
                    500,
                    Math.random()*500 - 250
                );

                console.log('cameraXXX:::', camera.rotation.x);
                console.log('cameraYYY:::', camera.rotation.y);

                cloud.rotation.x = camera.rotation.x + 1.5;
                cloud.rotation.y = camera.rotation.y;
                cloud.rotation.z = Math.random()*360;
                cloud.material.opacity = 0.6;
                cloudParticles.push(cloud);
                console.log('cloud:::', cloud);
                scene.add(cloud);

                cloud2 = new THREE.Mesh(cloudGeo,cloudMaterial);
                cloud2.position.set(
                    Math.random()*800 - 400,
                    800,
                    Math.random()*500 - 250
                );

                cloud2.rotation.x = camera.rotation.x + 1.5;
                cloud2.rotation.y = camera.rotation.y;
                cloud2.rotation.z = Math.random()*360;
                cloud2.material.opacity = 0.6;
                cloudParticles2.push(cloud);
                console.log('cloud2:::', cloud2);
                scene.add(cloud2);

                cloud3 = new THREE.Mesh(cloudGeo,cloudMaterial);
                cloud3.position.set(
                    Math.random()*800 - 400,
                    1200,
                    Math.random()*500 - 250
                );

                cloud3.rotation.x = camera.rotation.x + 1.5;
                cloud3.rotation.y = camera.rotation.y;
                cloud3.rotation.z = Math.random()*360;
                cloud3.material.opacity = 0.6;
                cloudParticles3.push(cloud);
                console.log('cloud3:::', cloud3);
                scene.add(cloud3);

            }
        });
        isStorm = true;
    }
}

function stormVariation() {
    cloudParticles.forEach(p => {
        p.rotation.z -=0.002;
    });

    cloudParticles2.forEach(p => {
        p.rotation.z -=0.002;
    });

    cloudParticles3.forEach(p => {
        p.rotation.z -=0.002;
    });
}

function animate() {
    requestAnimationFrame( animate );
    playScrollAnimations();
    render();
    if(isRain) rainVariation();
    if(isStorm) stormVariation();
    stats.update();
}
function render() {
    water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
    renderer.render( scene, camera );
}
window.scrollTo({ top: 0, behavior: 'smooth' });
animate();

