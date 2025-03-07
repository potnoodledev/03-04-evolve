import Phaser from 'phaser';
import { EnemyFactory } from '../scripts/enemies';
import { WeaponManager } from '../scripts/weapons';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    
    // Game state
    this.player = null;
    this.enemies = null;
    this.crystals = null;
    this.rocks = null;
    this.arrows = null;
    this.joystick = null;
    this.joystickPointer = null;
    this.joystickKeys = null;
    
    // Player stats
    this.playerLevel = 1;
    this.playerXP = 0;
    this.playerMaxXP = 100;
    this.playerSpeed = 150;
    this.playerHealth = 100;
    this.playerMaxHealth = 100;
    
    // Weapon system
    this.weaponManager = null;
    this.lastFired = 0;
    
    // Game settings
    this.gameTime = 0;
    this.gameMaxTime = 600000; // 10 minutes in ms
    this.waveNumber = 1;
    this.enemiesPerWave = 5;
    this.enemySpawnRate = 3000; // ms between enemy spawns
    this.lastEnemySpawn = 0;
    
    // Enemy settings
    this.enemySettings = {
      basic: {
        health: 50,
        damage: 10,
        speed: 75
      },
      blinker: {
        health: 70,
        damage: 15,
        speed: 100,
        blinkTime: 2000,
        blinkInterval: 5000
      },
      zigzag: {
        health: 40,
        damage: 8,
        speed: 90,
        amplitude: 50,
        frequency: 0.02
      },
      circular: {
        health: 60,
        damage: 12,
        speed: 85,
        orbitDistance: 150,
        orbitSpeed: 0.02
      }
    };
    
    // Enemy spawn settings
    this.lastBlinkerSpawn = 0;
    this.blinkerSpawnRate = 5000; // 5 seconds between blinker spawns
    this.lastZigzagSpawn = 0;
    this.zigzagSpawnRate = 7000; // 7 seconds between zigzag spawns
    this.lastCircularSpawn = 0;
    this.circularSpawnRate = 10000; // 10 seconds between circular spawns
    
    // Map settings
    this.mapWidth = 1600;
    this.mapHeight = 1200;
  }

  create() {
    // Create world bounds
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
    
    // Create background
    this.createBackground();
    
    // Create player
    this.createPlayer();
    
    // Create groups
    this.enemies = this.physics.add.group();
    this.crystals = this.physics.add.group();
    
    // Initialize weapon manager
    this.weaponManager = new WeaponManager(this);
    
    // Set up collisions
    this.setupCollisions();
    
    // Set up camera
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    // Set up controls
    this.setupControls();
    
    // Setup enemy events
    this.setupEnemyEvents();
    
    // Start game timer
    this.time.addEvent({
      delay: 1000,
      callback: this.updateGameTime,
      callbackScope: this,
      loop: true
    });
    
    // Start wave timer
    this.time.addEvent({
      delay: 8000, // 8 seconds between waves
      callback: this.increaseWave,
      callbackScope: this,
      loop: true
    });
    
    // Register events
    this.events.on('player-level-up', this.onPlayerLevelUp, this);
    
    // Emit initial events to UI
    this.events.emit('update-player-health', this.playerHealth, this.playerMaxHealth);
    this.events.emit('update-player-xp', this.playerXP, this.playerMaxXP);
    this.events.emit('update-player-level', this.playerLevel);
    this.events.emit('update-game-time', this.gameTime, this.gameMaxTime);
    this.events.emit('update-wave', this.waveNumber);
    this.events.emit('update-weapon', this.weaponManager.getCurrentWeapon().name);
  }

  update(time, delta) {
    // Handle player movement
    this.handlePlayerMovement();
    
    // Handle weapon firing
    this.handleWeaponFiring(time);
    
    // Spawn enemies
    this.handleEnemySpawning(time);
    
    // Update enemy movement
    this.updateEnemies();
  }

  createBackground() {
    // Create a simple grid background
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.8);
    
    // Draw vertical lines
    for (let x = 0; x <= this.mapWidth; x += 64) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, this.mapHeight);
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= this.mapHeight; y += 64) {
      graphics.moveTo(0, y);
      graphics.lineTo(this.mapWidth, y);
    }
    
    graphics.strokePath();
  }

  createPlayer() {
    // Create player at center of map
    this.player = this.physics.add.sprite(
      this.mapWidth / 2,
      this.mapHeight / 2,
      'player'
    );
    
    // Set player properties
    this.player.setCollideWorldBounds(true);
    this.player.setSize(48, 48);
    this.player.setDepth(10);
    this.player.body.setCircle(24);
    
    // Add player data
    this.player.health = this.playerHealth;
  }

  setupControls() {
    // Set up keyboard controls
    this.joystickKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // Set up touch/mouse controls
    this.input.on('pointerdown', (pointer) => {
      this.joystickPointer = pointer;
      this.joystick = this.add.image(pointer.x, pointer.y, 'joystick');
      this.joystick.setScrollFactor(0);
      this.joystick.setDepth(100);
      this.joystick.setAlpha(0.7);
    });
    
    this.input.on('pointermove', (pointer) => {
      if (this.joystickPointer && this.joystickPointer.id === pointer.id) {
        // Update joystick position
      }
    });
    
    this.input.on('pointerup', (pointer) => {
      if (this.joystickPointer && this.joystickPointer.id === pointer.id) {
        this.joystickPointer = null;
        if (this.joystick) {
          this.joystick.destroy();
          this.joystick = null;
        }
      }
    });
  }

  setupCollisions() {
    // Player collisions
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.enemyHitPlayer,
      null,
      this
    );
    
    this.physics.add.overlap(
      this.player,
      this.crystals,
      this.collectCrystal,
      null,
      this
    );
    
    // Weapon collisions are now handled by the weapon classes
  }

  handlePlayerMovement() {
    // Reset velocity
    this.player.setVelocity(0);
    
    let dirX = 0;
    let dirY = 0;
    
    // Handle keyboard input
    if (this.joystickKeys.left.isDown) {
      dirX = -1;
    } else if (this.joystickKeys.right.isDown) {
      dirX = 1;
    }
    
    if (this.joystickKeys.up.isDown) {
      dirY = -1;
    } else if (this.joystickKeys.down.isDown) {
      dirY = 1;
    }
    
    // Handle touch/mouse input
    if (this.joystickPointer && this.joystick) {
      const dx = this.joystickPointer.x - this.joystick.x;
      const dy = this.joystickPointer.y - this.joystick.y;
      
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        dirX = dx / distance;
        dirY = dy / distance;
      }
    }
    
    // Normalize and apply velocity
    if (dirX !== 0 || dirY !== 0) {
      const length = Math.sqrt(dirX * dirX + dirY * dirY);
      dirX = dirX / length;
      dirY = dirY / length;
      
      this.player.setVelocity(
        dirX * this.playerSpeed,
        dirY * this.playerSpeed
      );
    }
  }

  handleWeaponFiring(time) {
    const nearestEnemy = this.findNearestEnemy();
    
    if (nearestEnemy) {
      this.weaponManager.fire(time, nearestEnemy);
    }
  }

  findNearestEnemy() {
    let nearestEnemy = null;
    let nearestDistance = Infinity;
    
    this.enemies.getChildren().forEach((enemy) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    });
    
    return nearestEnemy;
  }

  handleEnemySpawning(time) {
    // Spawn basic enemies
    if (time > this.lastEnemySpawn + this.enemySpawnRate) {
      this.spawnBasicEnemy();
      this.lastEnemySpawn = time;
    }
    
    // Spawn blinker enemies in wave 2 and beyond
    if (this.waveNumber >= 2 && time > this.lastBlinkerSpawn + this.blinkerSpawnRate) {
      this.spawnBlinkerEnemy();
      this.lastBlinkerSpawn = time;
    }
    
    // Spawn zigzag enemies in wave 3 and beyond
    if (this.waveNumber >= 3 && time > this.lastZigzagSpawn + this.zigzagSpawnRate) {
      this.spawnZigzagEnemy();
      this.lastZigzagSpawn = time;
    }
    
    // Spawn circular enemies in wave 4 and beyond
    if (this.waveNumber >= 4 && time > this.lastCircularSpawn + this.circularSpawnRate) {
      this.spawnCircularEnemy();
      this.lastCircularSpawn = time;
    }
  }

  spawnBasicEnemy() {
    // Get spawn position outside camera view
    const spawnPos = EnemyFactory.getSpawnPositionOutsideCamera(
      this, 
      this.player, 
      { width: this.mapWidth, height: this.mapHeight }
    );
    
    // Create enemy using factory
    EnemyFactory.createEnemy(
      this, 
      spawnPos.x, 
      spawnPos.y, 
      'basic', 
      this.enemySettings.basic
    );
  }

  spawnBlinkerEnemy() {
    // Get spawn position near player
    const spawnPos = EnemyFactory.getSpawnPositionNearPlayer(
      this.player,
      200,
      300,
      { width: this.mapWidth, height: this.mapHeight }
    );
    
    // Create blinker enemy using factory
    EnemyFactory.createEnemy(
      this, 
      spawnPos.x, 
      spawnPos.y, 
      'blinker', 
      this.enemySettings.blinker
    );
  }

  spawnZigzagEnemy() {
    // Get spawn position outside camera view
    const spawnPos = EnemyFactory.getSpawnPositionOutsideCamera(
      this, 
      this.player, 
      { width: this.mapWidth, height: this.mapHeight }
    );
    
    // Create zigzag enemy using factory
    EnemyFactory.createEnemy(
      this, 
      spawnPos.x, 
      spawnPos.y, 
      'zigzag', 
      this.enemySettings.zigzag
    );
  }

  spawnCircularEnemy() {
    // Get spawn position outside camera view
    const spawnPos = EnemyFactory.getSpawnPositionOutsideCamera(
      this, 
      this.player, 
      { width: this.mapWidth, height: this.mapHeight }
    );
    
    // Create circular enemy using factory
    EnemyFactory.createEnemy(
      this, 
      spawnPos.x, 
      spawnPos.y, 
      'circular', 
      this.enemySettings.circular
    );
  }

  updateEnemies() {
    this.enemies.getChildren().forEach((enemy) => {
      // Use the enemy's update method if it exists (for our custom Enemy classes)
      if (enemy.update) {
        enemy.update(this.player);
      } else {
        // Fallback for any enemies that might not be using our new system
        // Move towards player
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const angle = Math.atan2(dy, dx);
        
        enemy.rotation = angle;
        
        enemy.setVelocity(
          Math.cos(angle) * (enemy.speed || this.enemySpeed),
          Math.sin(angle) * (enemy.speed || this.enemySpeed)
        );
      }
    });
  }

  collectCrystal(player, crystal) {
    crystal.destroy();
    
    // Add XP
    this.playerXP += 40;
    
    // Check for level up
    if (this.playerXP >= this.playerMaxXP) {
      this.playerXP -= this.playerMaxXP;
      this.events.emit('player-level-up');
    }
    
    // Update UI
    this.events.emit('update-player-xp', this.playerXP, this.playerMaxXP);
  }

  enemyHitPlayer(player, enemy) {
    // Prevent damage from blinking enemies
    if (enemy.isBlinker && enemy.isBlinking) {
      return;
    }
    
    // Apply damage to player (only once per second)
    if (this.time.now - (this.player.lastDamageTime || 0) > 1000) {
      this.playerHealth -= enemy.damage;
      this.player.lastDamageTime = this.time.now;
      
      // Update UI
      this.events.emit('update-player-health', this.playerHealth, this.playerMaxHealth);
      
      // Flash player to indicate damage
      this.tweens.add({
        targets: player,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        repeat: 3
      });
      
      // Check for game over
      if (this.playerHealth <= 0) {
        this.gameOver();
      }
    }
  }

  onPlayerLevelUp() {
    // Increase player level
    this.playerLevel++;
    
    // Increase player stats
    this.playerMaxHealth += 20;
    this.playerHealth = this.playerMaxHealth;
    this.playerSpeed += 10;
    
    // Upgrade weapons based on level
    if (this.playerLevel === 2) {
      this.weaponManager.setCurrentWeapon('stink_bomb');
    }
    else if (this.playerLevel === 3) {
      this.weaponManager.setCurrentWeapon('bow');
    }
    else if (this.playerLevel === 4) {
      this.weaponManager.setCurrentWeapon('fireball');
    }
    
    // Upgrade all weapons
    this.weaponManager.upgradeAllWeapons({
      damage: this.weaponManager.getCurrentWeapon().damage + 5,
      fireRate: Math.max(200, this.weaponManager.getCurrentWeapon().fireRate - 100)
    });
    
    // Increase XP required for next level
    this.playerMaxXP += 50;
    
    // Update UI
    this.events.emit('update-player-level', this.playerLevel);
    this.events.emit('update-player-health', this.playerHealth, this.playerMaxHealth);
    this.events.emit('update-player-xp', this.playerXP, this.playerMaxXP);
  }

  increaseWave() {
    // Increase wave number
    this.waveNumber++;
    
    // Increase enemy stats for all enemy types
    Object.keys(this.enemySettings).forEach(type => {
      this.enemySettings[type].health += 10;
      this.enemySettings[type].damage += 2;
      this.enemySettings[type].speed += 5;
    });
    
    // Increase spawn rates
    this.enemiesPerWave += 2;
    this.enemySpawnRate = Math.max(500, this.enemySpawnRate - 300);
    
    // Increase blinker spawn rate if wave 3 or higher
    if (this.waveNumber >= 3) {
      this.blinkerSpawnRate = Math.max(2000, this.blinkerSpawnRate - 500);
    }
    
    // Increase zigzag spawn rate if wave 4 or higher
    if (this.waveNumber >= 4) {
      this.zigzagSpawnRate = Math.max(3000, this.zigzagSpawnRate - 500);
    }
    
    // Increase circular spawn rate if wave 5 or higher
    if (this.waveNumber >= 5) {
      this.circularSpawnRate = Math.max(5000, this.circularSpawnRate - 1000);
    }
    
    // Update UI
    this.events.emit('update-wave', this.waveNumber);
  }

  updateGameTime() {
    // Increase game time
    this.gameTime += 1000;
    
    // Update UI
    this.events.emit('update-game-time', this.gameTime, this.gameMaxTime);
    
    // Check for victory
    if (this.gameTime >= this.gameMaxTime) {
      this.victory();
    }
  }

  gameOver() {
    // Stop physics
    this.physics.pause();
    
    // Switch to game over scene
    this.scene.start('GameOverScene', { 
      victory: false, 
      level: this.playerLevel,
      time: this.gameTime
    });
  }

  victory() {
    // Stop physics
    this.physics.pause();
    
    // Switch to game over scene
    this.scene.start('GameOverScene', { 
      victory: true, 
      level: this.playerLevel,
      time: this.gameTime
    });
  }

  // Listen for enemy death events
  setupEnemyEvents() {
    this.events.on('enemy-died', (data) => {
      // Spawn crystal at the enemy's death position
      this.spawnCrystal(data.x, data.y);
      
      // Add XP
      this.playerXP += 10;
      if (this.playerXP >= this.playerMaxXP) {
        this.events.emit('player-level-up');
      }
      
      // Update UI
      this.events.emit('update-player-xp', this.playerXP, this.playerMaxXP);
      
      // You can add special effects or logic based on enemy type
      console.log(`Enemy of type ${data.type} died at position ${data.x}, ${data.y}`);
    });
  }

  spawnCrystal(x, y) {
    const crystal = this.crystals.create(x, y, 'crystal');
    crystal.setDepth(3);
  }
} 