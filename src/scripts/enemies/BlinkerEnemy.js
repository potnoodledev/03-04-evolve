import Enemy from './Enemy';
import { BlinkMovement } from './MovementBehaviors';

/**
 * Blinker enemy that teleports closer to the player
 */
export default class BlinkerEnemy extends Enemy {
  /**
   * @param {Phaser.Scene} scene - The scene this enemy belongs to
   * @param {number} x - The x position to spawn at
   * @param {number} y - The y position to spawn at
   * @param {Object} config - Configuration object for this enemy
   */
  constructor(scene, x, y, config = {}) {
    // Set default config values for this enemy type
    const blinkerConfig = {
      ...config,
      texture: config.texture || 'blinker_enemy',
      health: config.health || 70,
      damage: config.damage || 15,
      speed: config.speed || 100,
      type: 'blinker',
      bodyCircle: config.bodyCircle || 20,
      movementBehavior: config.movementBehavior || new BlinkMovement(
        config.blinkInterval || 3000,
        config.blinkDistance || 100
      )
    };
    
    super(scene, x, y, blinkerConfig.texture, blinkerConfig);
    
    // Set initial alpha
    this.setAlpha(0.3);
    
    // Disable collision initially
    this.body.enable = false;
    
    // Disable movement initially
    this.isSpawning = true;
    
    // Create initial blinking animation
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: config.blinkTime || 2000,
      ease: 'Linear',
      onComplete: () => {
        // Enable collision and movement after blinking is complete
        this.body.enable = true;
        this.isSpawning = false;
      }
    });
  }
  
  /**
   * Override the update method to prevent movement during spawning
   */
  update(target) {
    if (this.isSpawning) {
      // Don't move while spawning
      this.setVelocity(0, 0);
      return;
    }
    
    // Call the parent update method for normal movement
    super.update(target);
  }
  
  /**
   * Called when the enemy dies
   */
  onDeath() {
    // Emit an event that can be caught by the game scene
    this.scene.events.emit('enemy-died', { x: this.x, y: this.y, type: this.type });
    
    // Call parent method to destroy the sprite
    super.onDeath();
  }
} 