import Enemy from './Enemy';
import { DirectMovement } from './MovementBehaviors';

/**
 * Basic enemy that follows the player directly
 */
export default class BasicEnemy extends Enemy {
  /**
   * @param {Phaser.Scene} scene - The scene this enemy belongs to
   * @param {number} x - The x position to spawn at
   * @param {number} y - The y position to spawn at
   * @param {Object} config - Configuration object for this enemy
   */
  constructor(scene, x, y, config = {}) {
    // Set default config values for this enemy type
    const basicConfig = {
      ...config,
      texture: config.texture || 'enemy',
      health: config.health || 50,
      damage: config.damage || 10,
      speed: config.speed || 75,
      type: 'basic',
      bodyCircle: config.bodyCircle || 8,
      movementBehavior: config.movementBehavior || new DirectMovement()
    };
    
    super(scene, x, y, basicConfig.texture, basicConfig);
  }
  
  // The onDeath method is now handled by the base Enemy class
} 