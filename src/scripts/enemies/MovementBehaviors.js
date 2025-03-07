/**
 * Collection of movement behaviors that can be assigned to enemies
 */

/**
 * Base movement behavior class
 */
class MovementBehavior {
  /**
   * Update the enemy's movement
   * @param {Enemy} enemy - The enemy to update
   * @param {Object} target - The target (usually player)
   */
  update(enemy, target) {
    // Override in subclasses
  }
}

/**
 * Direct movement toward target (basic following)
 */
export class DirectMovement extends MovementBehavior {
  update(enemy, target) {
    if (!enemy.active || !target.active) return;
    
    // Calculate direction to target
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const angle = Math.atan2(dy, dx);
    
    // Set rotation to face target
    enemy.rotation = angle;
    
    // Set velocity based on angle and speed
    enemy.setVelocity(
      Math.cos(angle) * enemy.speed,
      Math.sin(angle) * enemy.speed
    );
  }
}

/**
 * Zigzag movement toward target
 */
export class ZigzagMovement extends MovementBehavior {
  constructor(amplitude = 50, frequency = 0.02) {
    super();
    this.amplitude = amplitude;
    this.frequency = frequency;
    this.time = 0;
  }
  
  update(enemy, target) {
    if (!enemy.active || !target.active) return;
    
    // Increment time
    this.time += 0.1;
    
    // Calculate direction to target
    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const angle = Math.atan2(dy, dx);
    
    // Calculate perpendicular direction for zigzag
    const perpAngle = angle + Math.PI/2;
    
    // Calculate zigzag offset
    const zigzagOffset = Math.sin(this.time * this.frequency) * this.amplitude;
    
    // Set rotation to face target with slight wobble
    enemy.rotation = angle + Math.sin(this.time * this.frequency) * 0.2;
    
    // Set velocity with zigzag pattern
    enemy.setVelocity(
      Math.cos(angle) * enemy.speed + Math.cos(perpAngle) * zigzagOffset,
      Math.sin(angle) * enemy.speed + Math.sin(perpAngle) * zigzagOffset
    );
  }
}

/**
 * Circular movement around target
 */
export class CircularMovement extends MovementBehavior {
  constructor(orbitDistance = 150, orbitSpeed = 0.02) {
    super();
    this.orbitDistance = orbitDistance;
    this.orbitSpeed = orbitSpeed;
    this.angle = 0;
  }
  
  update(enemy, target) {
    if (!enemy.active || !target.active) return;
    
    // Increment orbit angle
    this.angle += this.orbitSpeed;
    
    // Calculate current position in orbit
    const targetX = target.x + Math.cos(this.angle) * this.orbitDistance;
    const targetY = target.y + Math.sin(this.angle) * this.orbitDistance;
    
    // Calculate direction to orbit position
    const dx = targetX - enemy.x;
    const dy = targetY - enemy.y;
    const moveAngle = Math.atan2(dy, dx);
    
    // Set rotation to face orbit direction
    enemy.rotation = moveAngle;
    
    // Set velocity
    enemy.setVelocity(
      Math.cos(moveAngle) * enemy.speed,
      Math.sin(moveAngle) * enemy.speed
    );
  }
}

/**
 * Teleport movement (blink) behavior
 */
export class BlinkMovement extends MovementBehavior {
  constructor(blinkInterval = 3000, blinkDistance = 100) {
    super();
    this.blinkInterval = blinkInterval;
    this.blinkDistance = blinkDistance;
    this.lastBlinkTime = Date.now();
    this.isBlinking = false;
    this.blinkDuration = 500;
    this.directMovement = new DirectMovement();
  }
  
  update(enemy, target) {
    if (!enemy.active || !target.active) return;
    
    const currentTime = enemy.scene.time.now;
    
    // Check if it's time to blink
    if (!this.isBlinking && currentTime - this.lastBlinkTime > this.blinkInterval) {
      this.startBlink(enemy, target, currentTime);
    }
    
    // Check if blinking is complete
    if (this.isBlinking && currentTime - this.lastBlinkTime > this.blinkDuration) {
      this.completeBlink(enemy);
    }
    
    // Use direct movement when not blinking
    if (!this.isBlinking) {
      this.directMovement.update(enemy, target);
    }
  }
  
  startBlink(enemy, target, currentTime) {
    // Start blinking
    this.isBlinking = true;
    this.lastBlinkTime = currentTime;
    
    // Disable physics and fade out
    enemy.body.enable = false;
    enemy.scene.tweens.add({
      targets: enemy,
      alpha: 0.3,
      duration: this.blinkDuration / 2,
      ease: 'Linear'
    });
    
    // Calculate blink destination (closer to target)
    const angle = Math.atan2(target.y - enemy.y, target.x - enemy.x);
    const distance = Math.min(
      this.blinkDistance,
      Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y) * 0.7
    );
    
    // Store destination
    this.blinkDestX = enemy.x + Math.cos(angle) * distance;
    this.blinkDestY = enemy.y + Math.sin(angle) * distance;
  }
  
  completeBlink(enemy) {
    // Complete blink
    this.isBlinking = false;
    
    // Move to destination
    enemy.x = this.blinkDestX;
    enemy.y = this.blinkDestY;
    
    // Re-enable physics and fade in
    enemy.body.enable = true;
    enemy.scene.tweens.add({
      targets: enemy,
      alpha: 1,
      duration: this.blinkDuration / 2,
      ease: 'Linear'
    });
  }
}

/**
 * Factory to create movement behaviors
 */
export class MovementBehaviorFactory {
  static create(type, config = {}) {
    switch (type) {
      case 'direct':
        return new DirectMovement();
      case 'zigzag':
        return new ZigzagMovement(
          config.amplitude || 50,
          config.frequency || 0.02
        );
      case 'circular':
        return new CircularMovement(
          config.orbitDistance || 150,
          config.orbitSpeed || 0.02
        );
      case 'blink':
        return new BlinkMovement(
          config.blinkInterval || 3000,
          config.blinkDistance || 100
        );
      default:
        return new DirectMovement();
    }
  }
} 