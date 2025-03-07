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
    
    // Damage flash effect properties
    this.isFlashing = false;
    this.flashDuration = 150; // milliseconds
    
    // Create a glow sprite that will be used for the damage effect
    this.glowSprite = scene.add.sprite(x, y, texture)
      .setVisible(false)
      .setAlpha(0.7)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(4) // Just below the enemy
      .setScale(1.3); // Slightly larger than the enemy
  }
  
  /**
   * Update method called each frame
   * @param {Object} target - The target to move towards (usually the player)
   */
  update(target) {
    if (this.active && this.movementBehavior) {
      this.movementBehavior.update(this, target);
    }
    
    // Update glow sprite position if it exists
    if (this.glowSprite && this.glowSprite.active) {
      this.glowSprite.setPosition(this.x, this.y);
      this.glowSprite.setRotation(this.rotation);
    }
  }
  
  /**
   * Take damage and check if dead
   * @param {number} amount - Amount of damage to take
   * @returns {boolean} - Whether the enemy died from this damage
   */
  takeDamage(amount) {
    this.health -= amount;
    
    // Flash white when damaged
    this.flashWhite();
    
    // Check if dead
    if (this.health <= 0) {
      this.onDeath();
      return true;
    }
    
    return false;
  }
  
  /**
   * Flash the enemy white to indicate damage
   */
  flashWhite() {
    if (!this.isFlashing) {
      this.isFlashing = true;
      
      // Set the tint to white (0xFFFFFF)
      this.setTint(0xFFFFFF);
      
      // Add a glow effect by creating a temporary light source
      const glowIntensity = 2;
      this.scaleX *= 1.1;
      this.scaleY *= 1.1;
      
      // Show the glow sprite
      if (this.glowSprite && this.glowSprite.active) {
        this.glowSprite.setVisible(true);
        this.glowSprite.setTint(0xFFFFFF);
        
        // Create a pulsing effect for the glow
        this.scene.tweens.add({
          targets: this.glowSprite,
          scale: { from: 1.4, to: 1.2 },
          alpha: { from: 0.8, to: 0.4 },
          duration: this.flashDuration,
          ease: 'Sine.easeOut',
          onComplete: () => {
            this.glowSprite.setVisible(false);
          }
        });
      }
      
      // Add a particle burst effect
      this.createDamageParticles();
      
      // Create a pulsing effect
      this.scene.tweens.add({
        targets: this,
        alpha: 0.8,
        yoyo: true,
        repeat: 1,
        duration: this.flashDuration / 2,
        ease: 'Sine.easeInOut'
      });
      
      // Reset the tint and scale after the flash duration
      this.scene.time.delayedCall(this.flashDuration, () => {
        this.clearTint();
        this.scaleX /= 1.1;
        this.scaleY /= 1.1;
        this.alpha = 1;
        this.isFlashing = false;
      });
    }
  }
  
  /**
   * Create particles for damage effect
   */
  createDamageParticles() {
    // Create a one-time particle emitter for the damage effect
    const particles = this.scene.add.particles(this.x, this.y, 'particle', {
      lifespan: 300,
      angle: { min: 0, max: 360 },
      speed: { min: 50, max: 100 },
      scale: { start: 0.6, end: 0 },
      quantity: 10,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false
    });
    
    // Emit particles once
    particles.explode();
    
    // Destroy the emitter after particles are done
    this.scene.time.delayedCall(500, () => {
      particles.destroy();
    });
  }
  
  /**
   * Called when the enemy dies
   */
  onDeath() {
    // Hide the glow sprite when enemy dies
    if (this.glowSprite && this.glowSprite.active) {
      this.glowSprite.destroy();
    }
    
    // Play shrinking animation before destroying
    this.playShrinkAnimation();
  }
  
  /**
   * Play shrinking animation when enemy dies
   */
  playShrinkAnimation() {
    // Disable physics body to prevent further collisions
    this.body.enable = false;
    
    // Store a reference to the scene and position before the animation starts
    const scene = this.scene;
    const enemyData = { x: this.x, y: this.y, type: this.type };
    
    // Make sure the glow sprite is hidden
    if (this.glowSprite && this.glowSprite.active) {
      this.glowSprite.setVisible(false);
    }
    
    // Create a shrinking tween
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        // Destroy the glow sprite if it exists
        if (this.glowSprite && this.glowSprite.active) {
          this.glowSprite.destroy();
        }
        
        // Emit an event that can be caught by the game scene
        // Use the stored scene reference instead of this.scene
        if (scene && scene.events) {
          scene.events.emit('enemy-died', enemyData);
        }
        // Destroy the sprite after animation completes
        this.destroy();
      }
    });
  }
  
  /**
   * Set a new movement behavior
   * @param {Object} behavior - The movement behavior to use
   */
  setMovementBehavior(behavior) {
    this.movementBehavior = behavior;
  }
} 