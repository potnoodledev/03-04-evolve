import BasicEnemy from './BasicEnemy';
import BlinkerEnemy from './BlinkerEnemy';
import { MovementBehaviorFactory } from './MovementBehaviors';

/**
 * Factory for creating different types of enemies
 */
export default class EnemyFactory {
  /**
   * Create an enemy of the specified type
   * @param {Phaser.Scene} scene - The scene to add the enemy to
   * @param {number} x - The x position to spawn at
   * @param {number} y - The y position to spawn at
   * @param {string} type - The type of enemy to create
   * @param {Object} config - Configuration object for the enemy
   * @returns {Enemy} The created enemy
   */
  static createEnemy(scene, x, y, type, config = {}) {
    let enemy;
    
    switch (type) {
      case 'basic':
        enemy = new BasicEnemy(scene, x, y, config);
        break;
      case 'blinker':
        enemy = new BlinkerEnemy(scene, x, y, config);
        break;
      case 'zigzag':
        // Create a basic enemy with zigzag movement
        enemy = new BasicEnemy(scene, x, y, {
          ...config,
          movementBehavior: MovementBehaviorFactory.create('zigzag', config)
        });
        break;
      case 'circular':
        // Create a basic enemy with circular movement
        enemy = new BasicEnemy(scene, x, y, {
          ...config,
          movementBehavior: MovementBehaviorFactory.create('circular', config)
        });
        break;
      default:
        enemy = new BasicEnemy(scene, x, y, config);
        break;
    }
    
    // Add the enemy to the enemies group in the scene
    if (scene.enemies) {
      scene.enemies.add(enemy);
    }
    
    return enemy;
  }
  
  /**
   * Determine spawn position outside camera view
   * @param {Phaser.Scene} scene - The scene
   * @param {Object} player - The player object
   * @param {Object} mapBounds - The map boundaries { width, height }
   * @returns {Object} The spawn position { x, y }
   */
  static getSpawnPositionOutsideCamera(scene, player, mapBounds) {
    const side = Phaser.Math.Between(0, 3); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;
    
    const cameraX = scene.cameras.main.scrollX;
    const cameraY = scene.cameras.main.scrollY;
    const cameraWidth = scene.cameras.main.width;
    const cameraHeight = scene.cameras.main.height;
    
    const buffer = 100; // Spawn outside camera view
    
    switch (side) {
      case 0: // Top
        x = Phaser.Math.Between(cameraX - buffer, cameraX + cameraWidth + buffer);
        y = cameraY - buffer;
        break;
      case 1: // Right
        x = cameraX + cameraWidth + buffer;
        y = Phaser.Math.Between(cameraY - buffer, cameraY + cameraHeight + buffer);
        break;
      case 2: // Bottom
        x = Phaser.Math.Between(cameraX - buffer, cameraX + cameraWidth + buffer);
        y = cameraY + cameraHeight + buffer;
        break;
      case 3: // Left
        x = cameraX - buffer;
        y = Phaser.Math.Between(cameraY - buffer, cameraY + cameraHeight + buffer);
        break;
    }
    
    // Ensure spawn is within world bounds
    x = Phaser.Math.Clamp(x, 0, mapBounds.width);
    y = Phaser.Math.Clamp(y, 0, mapBounds.height);
    
    return { x, y };
  }
  
  /**
   * Determine spawn position near player
   * @param {Object} player - The player object
   * @param {number} minDistance - Minimum distance from player
   * @param {number} maxDistance - Maximum distance from player
   * @param {Object} mapBounds - The map boundaries { width, height }
   * @returns {Object} The spawn position { x, y }
   */
  static getSpawnPositionNearPlayer(player, minDistance, maxDistance, mapBounds) {
    const angle = Phaser.Math.Between(0, 360) * (Math.PI / 180);
    const distance = Phaser.Math.Between(minDistance, maxDistance);
    
    const x = player.x + Math.cos(angle) * distance;
    const y = player.y + Math.sin(angle) * distance;
    
    // Ensure spawn is within world bounds
    const clampedX = Phaser.Math.Clamp(x, 0, mapBounds.width);
    const clampedY = Phaser.Math.Clamp(y, 0, mapBounds.height);
    
    return { x: clampedX, y: clampedY };
  }
} 