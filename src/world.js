import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class World {
  constructor(scene, physicsWorld) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.interactables = [];

    // Create ground
    this.createGround();

    // Add environment
    this.createEnvironment();

    // Add fog for dark atmosphere
    scene.fog = new THREE.FogExp2(0x000000, 0.015);
    scene.background = new THREE.Color(0x0a0a0a);
  }

  createGround() {
    // Visual ground with darker texture
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0.1,
      // Add some variation to the ground
      bumpScale: 0.2
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    this.scene.add(groundMesh);

    // Physics ground
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: groundShape
    });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    this.physicsWorld.addBody(groundBody);
  }

  createEnvironment() {
    // Add dead trees
    for (let i = 0; i < 30; i++) {
      const tree = this.createDeadTree();
      tree.position.set(
        Math.random() * 80 - 40,
        0,
        Math.random() * 80 - 40
      );
      this.scene.add(tree);
    }

    // Add gravestones
    for (let i = 0; i < 20; i++) {
      const grave = this.createGravestone();
      grave.position.set(
        Math.random() * 60 - 30,
        0,
        Math.random() * 60 - 30
      );
      this.scene.add(grave);
    }

    // Add ritual altar
    this.createAltar();
  }

  createDeadTree() {
    const group = new THREE.Group();

    // Twisted trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 5, 6);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      roughness: 1
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    // Add some random rotation for twisted look
    trunk.rotation.x = Math.random() * 0.2;
    trunk.rotation.z = Math.random() * 0.2;
    group.add(trunk);

    // Dead branches
    for (let i = 0; i < 5; i++) {
      const branchGeo = new THREE.CylinderGeometry(0.1, 0.15, 2);
      const branch = new THREE.Mesh(branchGeo, trunkMaterial);
      branch.position.y = Math.random() * 2 + 1;
      branch.rotation.x = Math.random() * Math.PI;
      branch.rotation.z = Math.random() * Math.PI;
      group.add(branch);
    }

    return group;
  }

  createGravestone() {
    const group = new THREE.Group();

    // Stone
    const stoneGeo = new THREE.BoxGeometry(1, 2, 0.2);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.9
    });
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.position.y = 1;
    
    // Top part
    const topGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 5);
    const top = new THREE.Mesh(topGeo, stoneMat);
    top.position.y = 2;
    
    group.add(stone);
    group.add(top);

    // Add to interactables
    this.interactables.push({
      mesh: group,
      type: 'gravestone',
      interact: () => {
        console.log('Searching gravestone...');
        // 10% chance to find something
        if (Math.random() < 0.1) {
          return {
            type: 'item',
            item: {
              name: 'Lost Soul',
              type: 'consumable',
              effect: 'Restores 20 Dark Energy'
            }
          };
        }
        return null;
      }
    });

    return group;
  }

  createAltar() {
    const group = new THREE.Group();

    // Base
    const baseGeo = new THREE.BoxGeometry(3, 1, 3);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1a0000,
      roughness: 0.7,
      metalness: 0.3
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    
    // Top
    const topGeo = new THREE.BoxGeometry(2, 0.5, 2);
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x2a0000,
      roughness: 0.6,
      metalness: 0.4
    });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 0.75;

    // Candles
    for (let i = 0; i < 4; i++) {
      const candleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.3);
      const candleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
      const candle = new THREE.Mesh(candleGeo, candleMat);
      candle.position.set(
        Math.cos(i * Math.PI/2) * 0.8,
        1,
        Math.sin(i * Math.PI/2) * 0.8
      );
      
      // Add flame light
      const light = new THREE.PointLight(0xff6600, 0.5, 3);
      light.position.copy(candle.position).add(new THREE.Vector3(0, 0.2, 0));
      group.add(light);
      group.add(candle);
    }

    group.add(base);
    group.add(top);
    
    // Position altar in world
    group.position.set(-20, 0, -20);
    this.scene.add(group);

    // Add to interactables
    this.interactables.push({
      mesh: group,
      type: 'altar',
      interact: () => {
        return {
          type: 'ritual',
          action: 'start_ritual'
        };
      }
    });
  }

  checkInteractions(position, radius = 2) {
    return this.interactables.find(item => {
      const distance = position.distanceTo(item.mesh.position);
      return distance < radius;
    });
  }
}