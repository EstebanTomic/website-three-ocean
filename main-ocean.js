import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from "three/addons/objects/Sky.js";


const scene = new THREE.Scene();


const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.ACESFilmicToneMapping;

// Camera
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1,20000);
camera.position.set( 0, 20, 100 );

// Sun
const sun = new THREE.Vector3();


// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5,5,5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers
//const lightHelper = new THREE.PointLightHelper(pointLight);
//const gridHelper = new THREE.GridHelper(200, 50);
//scene.add(lightHelper, gridHelper);

// Controls
 const controls = new OrbitControls( camera, renderer.domElement );
 // controls.maxPolarAngle = Math.PI * 0.495;
// controls.target.set( 0, 10, 0 );
 controls.minDistance = 20.0;
 controls.maxDistance = 200.0;
controls.update();

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

// Smoke
let loader = new THREE.TextureLoader();
loader.load("smoke-1.png", function(texture){
  const cloudGeo = new THREE.PlaneBufferGeometry(500,500);
  const cloudMaterial = new THREE.MeshLambertMaterial({
    map: texture,
    transparent: true
  });

  for(let p=0; p<25; p++) {
    let cloud = new THREE.Mesh(cloudGeo,cloudMaterial);
    cloud.rotateX(90);
    cloud.position.set(
      Math.random()*800 -400,
      500,
      Math.random()*500 - 450
    );
    cloud.rotation.x = 1.16;
    cloud.rotation.y = -0.12;
    cloud.rotation.z = Math.random()*360;
    cloud.material.opacity = 0.6;
    scene.add(cloud);
  }
});



water.rotation.x = - Math.PI / 2;
scene.add( water );

// Skybox
const sky = new THREE.Sky();
scene.add(sky.mesh);

const uniforms = sky.uniforms;
uniforms.turbidity.value = 10;
uniforms.rayleigh.value = 2;
uniforms.luminance.value = 1;
uniforms.mieCoefficient.value = 0.005;
uniforms.mieDirectionalG.value = 0.8;

const theta = Math.PI * (0.49 - 0.5);
const phi = 2 * Math.PI * (0.25 - 0.5);

const sunPosition = new THREE.Vector3();
sunPosition.x = Math.cos(phi);
sunPosition.y = Math.sin(phi) * Math.sin(theta);
sunPosition.z = Math.sin(phi) * Math.cos(theta);

uniforms.sunPosition.value.copy(sunPosition);


function moveCamera() {
  const t = document.body.getBoundingClientRect().top;

  camera.position.z = t * +0.1;
  camera.rotation.y = t * -0.00002;
  console.log(camera.position.z);


}

document.body.onscroll = moveCamera;
moveCamera();

function animate() {
  requestAnimationFrame( animate );
  //camera.position.z -= 0.8;

  if(camera.position.z > -400){
    camera.position.z -= 0.8;
  } else {
    camera.position.z -= 0.2;
    camera.rotation.x += 0.005;
    if(camera.rotation.x > 1) {
      camera.position.y += 0.8;
    }
  }

  render();
}

function render() {
  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
  renderer.render( scene, camera );
}

animate();
