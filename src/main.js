import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Player } from './player.js';
import { World } from './world.js';
import { GameState } from './gameState.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Enhanced renderer settings
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1.5;
    document.body.appendChild(this.renderer.domElement);

    // Post-processing
    this.setupPostProcessing();

    // Physics world
    this.physicsWorld = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0)
    });

    // Enhanced lighting
    this.setupLighting();

    // Initialize game state
    this.gameState = new GameState();

    // Create world with enhanced graphics
    this.world = new World(this.scene, this.physicsWorld);

    // Create player with enhanced model
    this.player = new Player(this.scene, this.physicsWorld, this.camera);

    // Set camera position
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.composer.setSize(window.innerWidth, window.innerHeight);
      const pixelRatio = this.renderer.getPixelRatio();
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
    });

    this.animate();
  }

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    
    // Regular scene render
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Bloom effect for magical elements
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,  // bloom strength
      0.4,  // radius
      0.85  // threshold
    );
    this.composer.addPass(bloomPass);

    // FXAA antialiasing
    this.fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = this.renderer.getPixelRatio();
    this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
    this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
    this.composer.addPass(this.fxaaPass);
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x202020);
    this.scene.add(ambientLight);

    // Moonlight (main directional light)
    const moonLight = new THREE.DirectionalLight(0x6666ff, 1);
    moonLight.position.set(50, 50, 50);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 500;
    moonLight.shadow.camera.left = -100;
    moonLight.shadow.camera.right = 100;
    moonLight.shadow.camera.top = 100;
    moonLight.shadow.camera.bottom = -100;
    this.scene.add(moonLight);

    // Add volumetric fog
    const fog = new THREE.FogExp2(0x000000, 0.015);
    this.scene.fog = fog;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Update physics
    this.physicsWorld.step(1 / 60);

    // Update player
    this.player.update();

    // Update game state
    this.gameState.update();

    // Render with post-processing
    this.composer.render();
  }
}

// Start the game
new Game();