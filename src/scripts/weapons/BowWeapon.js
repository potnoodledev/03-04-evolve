import Weapon from './Weapon';

export default class BowWeapon extends Weapon {
  constructor(scene, config = {}) {
    super(scene, {
      name: 'Bow',
      texture: 'bow',
      damage: config.damage || 35,
      fireRate: config.fireRate || 1500,
      projectileSpeed: config.projectileSpeed || 450,
      projectileLifetime: config.projectileLifetime || 2000,
      ...config
    });
  }
  
  createProjectile(target) {
    if (!target) return;
    
    const projectile = this.projectileGroup.create(
      this.scene.player.x, 
      this.scene.player.y, 
      this.texture
    );
    
    projectile.setDepth(5);
    
    // Calculate direction to target
    const dx = target.x - this.scene.player.x;
    const dy = target.y - this.scene.player.y;
    const angle = Math.atan2(dy, dx);
    
    // Set projectile properties
    projectile.rotation = angle;
    projectile.damage = this.damage;
    
    // Set velocity
    projectile.setVelocity(
      Math.cos(angle) * this.projectileSpeed,
      Math.sin(angle) * this.projectileSpeed
    );
    
    // Destroy projectile after lifetime
    this.scene.time.delayedCall(this.projectileLifetime, () => {
      if (projectile.active) {
        projectile.destroy();
      }
    });
    
    return projectile;
  }
} 