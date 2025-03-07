import Weapon from './Weapon';

export default class FireballWeapon extends Weapon {
  constructor(scene, config = {}) {
    super(scene, {
      name: 'Fireball',
      texture: 'rock', // Reusing rock texture for now, would use 'fireball' in a real implementation
      damage: config.damage || 40,
      fireRate: config.fireRate || 2000,
      projectileSpeed: config.projectileSpeed || 350,
      projectileLifetime: config.projectileLifetime || 2000,
      ...config
    });
    
    // Additional properties specific to the fireball
    this.explosionRadius = config.explosionRadius || 100;
    this.explosionDamage = config.explosionDamage || 20;
  }
  
  createProjectile(target) {
    if (!target) return;
    
    const projectile = this.projectileGroup.create(
      this.scene.player.x, 
      this.scene.player.y, 
      this.texture
    );
    
    projectile.setDepth(5);
    projectile.setTint(0xff5500); // Give it an orange tint to look like fire
    
    // Calculate direction to target
    const dx = target.x - this.scene.player.x;
    const dy = target.y - this.scene.player.y;
    const angle = Math.atan2(dy, dx);
    
    // Set projectile properties
    projectile.rotation = angle;
    projectile.damage = this.damage;
    projectile.explosionRadius = this.explosionRadius;
    projectile.explosionDamage = this.explosionDamage;
    
    // Set velocity
    projectile.setVelocity(
      Math.cos(angle) * this.projectileSpeed,
      Math.sin(angle) * this.projectileSpeed
    );
    
    // Destroy projectile after lifetime
    this.scene.time.delayedCall(this.projectileLifetime, () => {
      if (projectile.active) {
        this.explode(projectile);
      }
    });
    
    return projectile;
  }
  
  onHitEnemy(projectile, enemy) {
    // Use the enemy's takeDamage method if it exists
    if (enemy.takeDamage) {
      enemy.takeDamage(projectile.damage || this.damage);
    } else {
      // Fallback for enemies without takeDamage method
      enemy.destroy();
    }
    
    // Create explosion effect
    this.explode(projectile);
  }
  
  explode(projectile) {
    // Create explosion visual effect
    const explosion = this.scene.add.circle(
      projectile.x, 
      projectile.y, 
      projectile.explosionRadius, 
      0xff5500, 
      0.5
    );
    explosion.setDepth(4);
    
    // Apply damage to all enemies in explosion radius
    this.scene.enemies.getChildren().forEach((enemy) => {
      const distance = Phaser.Math.Distance.Between(
        projectile.x, projectile.y,
        enemy.x, enemy.y
      );
      
      if (distance <= projectile.explosionRadius) {
        if (enemy.takeDamage) {
          enemy.takeDamage(projectile.explosionDamage);
        }
      }
    });
    
    // Destroy explosion effect after a short time
    this.scene.time.delayedCall(300, () => {
      explosion.destroy();
    });
    
    // Destroy the projectile
    projectile.destroy();
  }
} 