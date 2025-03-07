import Phaser from 'phaser';

/**
 * Base Enemy class that all enemy types will extend
 */
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene - The scene this enemy belongs to
   * @param {number} x - The x position to spawn at
   * @param {number} y - The y position to spawn at
   * @param {string} texture - The texture key to use
   * @param {Object} config - Configuration object for this enemy
   */
  constructor(scene, x, y, texture, config = {}) {
    super(scene, x, y, texture);
    
    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Default properties
    this.health = config.health || 50;
    this.damage = config.damage || 10;
    this.speed = config.speed || 75;
    this.type = config.type || 'basic';
    
    // Set up physics body
    this.setSize(config.width || 40, config.height || 40);
    if (config.bodyCircle) {
      this.body.setCircle(config.bodyCircle);
    }
    
    // Set depth for rendering order
    this.setDepth(5);
    
    // Store reference to movement behavior
    this.movementBehavior = config.movementBehavior || null;
  }
  
  /**
   * Update method called each frame
   * @param {Object} target - The target to move towards (usually the player)
   */
  update(target) {
    if (this.active && this.movementBehavior) {
      this.movementBehavior.update(this, target);
    }
  }
  
  /**
   * Take damage and check if dead
   * @param {number} amount - Amount of damage to take
   * @returns {boolean} - Whether the enemy died from this damage
   */
  takeDamage(amount) {
    this.health -= amount;
    
    // Check if dead
    if (this.health <= 0) {
      this.onDeath();
      return true;
    }
    
    return false;
  }
  
  /**
   * Called when the enemy dies
   */
  onDeath() {
    // Override in subclasses if needed
    this.destroy();
  }
  
  /**
   * Set a new movement behavior
   * @param {Object} behavior - The movement behavior to use
   */
  setMovementBehavior(behavior) {
    this.movementBehavior = behavior;
  }
} 