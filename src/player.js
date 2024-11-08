import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Player {
  constructor(scene, physicsWorld, camera) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.camera = camera;

    // Player stats
    this.stats = {
      health: 100,
      mana: 100,
      level: 1,
      experience: 0
    };

    // Create detailed player model
    this.createPlayerModel();

    // Create physics body
    const shape = new CANNON.Box(new CANNON.Vec3(0.3, 0.9, 0.3));
    this.body = new CANNON.Body({
      mass: 5,
      position: new CANNON.Vec3(0, 5, 0),
      shape: shape,
      material: new CANNON.Material({ friction: 0.1 })
    });
    this.physicsWorld.addBody(this.body);

    // Setup controls
    this.setupControls();

    // Add player light
    this.addPlayerLight();
  }

  createPlayerModel() {
    // Create a more detailed character model
    const group = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.7,
      metalness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    group.add(body);

    // Cloak
    const cloakGeometry = new THREE.ConeGeometry(0.6, 2, 8, 1, true);
    const cloakMaterial = new THREE.MeshStandardMaterial({
      color: 0x660000,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const cloak = new THREE.Mesh(cloakGeometry, cloakMaterial);
    cloak.position.y = -0.2;
    cloak.castShadow = true;
    group.add(cloak);

    // Hood
    const hoodGeometry = new THREE.SphereGeometry(0.3, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const hood = new THREE.Mesh(hoodGeometry, cloakMaterial);
    hood.position.y = 0.8;
    hood.castShadow = true;
    group.add(hood);

    this.mesh = group;
    this.scene.add(this.mesh);
  }

  addPlayerLight() {
    // Add a subtle point light to the player
    this.light = new THREE.PointLight(0x660000, 1, 5);
    this.light.castShadow = true;
    this.mesh.add(this.light);

    // Add lens flare effect
    const textureLoader = new THREE.TextureLoader();
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: textureLoader.load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QUY4RUQ5MDM5NzE3MTFFQjhDOTQ5NUY1NjQ4RjFFMTYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QUY4RUQ5MDQ5NzE3MTFFQjhDOTQ5NUY1NjQ4RjFFMTYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBRjhFRDkwMTk3MTcxMUVCOEM5NDk1RjU2NDhGMUUxNiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBRjhFRDkwMjk3MTcxMUVCOEM5NDk1RjU2NDhGMUUxNiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAEAAAAALAAAAAAIAAgAAAIRhI+py+0Po5y02ouz3rz7VgAAOw=='),
        color: 0xff0000,
        transparent: true,
        blending: THREE.AdditiveBlending
      })
    );
    sprite.scale.set(0.5, 0.5, 1);
    this.light.add(sprite);
  }

  setupControls() {
    document.addEventListener('keydown', (event) => {
      const speed = 5;
      switch(event.key) {
        case 'w':
          this.body.velocity.z = -speed;
          break;
        case 's':
          this.body.velocity.z = speed;
          break;
        case 'a':
          this.body.velocity.x = -speed;
          this.mesh.rotation.y = Math.PI / 2;
          break;
        case 'd':
          this.body.velocity.x = speed;
          this.mesh.rotation.y = -Math.PI / 2;
          break;
        case ' ':
          if (this.canJump) {
            this.body.velocity.y = 10;
            this.canJump = false;
          }
          break;
      }
    });

    document.addEventListener('keyup', (event) => {
      switch(event.key) {
        case 'w':
        case 's':
          this.body.velocity.z = 0;
          break;
        case 'a':
        case 'd':
          this.body.velocity.x = 0;
          this.mesh.rotation.y = 0;
          break;
      }
    });
  }

  update() {
    // Update mesh position to match physics body
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);

    // Smooth camera follow
    const targetCameraPos = new THREE.Vector3(
      this.mesh.position.x,
      this.mesh.position.y + 5,
      this.mesh.position.z + 10
    );
    this.camera.position.lerp(targetCameraPos, 0.1);
    this.camera.lookAt(this.mesh.position);

    // Update UI
    document.getElementById('health').textContent = this.stats.health;
    document.getElementById('mana').textContent = this.stats.mana;
    document.getElementById('level').textContent = this.stats.level;

    // Add floating effect to cloak
    const time = Date.now() * 0.001;
    this.mesh.children[1].position.y = -0.2 + Math.sin(time * 2) * 0.05;
  }
}