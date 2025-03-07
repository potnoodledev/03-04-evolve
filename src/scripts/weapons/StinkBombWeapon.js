import Weapon from './Weapon';

export default class StinkBombWeapon extends Weapon {
  constructor(scene, config = {}) {
    super(scene, {
      name: 'Stink Bomb',
      texture: 'stink_bomb',
      damage: config.damage || 15,
      fireRate: config.fireRate || 3000,
      ...config
    });
    
    this.radius = config.radius || 150;
    this.duration = config.duration || 3000;
    this.tickRate = config.tickRate || 500;
  }
  
  fire(time) {
    if (!this.canFire(time)) return false;
    
    this.createProjectile();
    this.lastFired = time;
    return true;
  }
  
  createProjectile() {
    // Create stink bomb at player position
    const stinkBomb = this.projectileGroup.create(
      this.scene.player.x, 
      this.scene.player.y, 
      this.texture
    );
    
    stinkBomb.setDepth(5);
    stinkBomb.setScale(1.5);
    
    // Set stink bomb properties
    stinkBomb.damage = this.damage;
    stinkBomb.radius = this.radius;
    
    // Create visual effect for the radius
    const radiusCircle = this.scene.add.circle(
      stinkBomb.x, 
      stinkBomb.y, 
      this.radius, 
      0x7ab317, 
      0.3
    );
    radiusCircle.setDepth(4);
    
    // Apply damage to enemies in radius every tickRate ms
    const damageInterval = this.scene.time.addEvent({
      delay: this.tickRate,
      callback: () => {
        this.applyAreaDamage(stinkBomb);
      },
      callbackScope: this,
      loop: true
    });
    
    // Destroy stink bomb and effects after duration
    this.scene.time.delayedCall(this.duration, () => {
      if (stinkBomb.active) {
        stinkBomb.destroy();
        radiusCircle.destroy();
        damageInterval.remove();
      }
    });
    
    return stinkBomb;
  }
  
  applyAreaDamage(stinkBomb) {
    // Get all enemies within radius
    this.scene.enemies.getChildren().forEach((enemy) => {
      const distance = Phaser.Math.Distance.Between(
        stinkBomb.x, stinkBomb.y,
        enemy.x, enemy.y
      );
      
      // If enemy is within radius, apply damage
      if (distance <= stinkBomb.radius) {
        if (enemy.takeDamage) {
          enemy.takeDamage(stinkBomb.damage);
        }
      }
    });
  }
  
  // Override the onHitEnemy method since stink bombs don't use direct collision
  onHitEnemy() {
    // Do nothing, damage is applied through applyAreaDamage
  }
} 