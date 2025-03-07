export default class Weapon {
  constructor(scene, config = {}) {
    this.scene = scene;
    this.name = config.name || 'unknown';
    this.damage = config.damage || 10;
    this.fireRate = config.fireRate || 1000; // ms between shots
    this.lastFired = 0;
    this.projectileGroup = null;
    this.texture = config.texture || 'rock';
    this.projectileSpeed = config.projectileSpeed || 300;
    this.projectileLifetime = config.projectileLifetime || 2000;
    this.projectileScale = config.projectileScale || 1;
    
    this.initialize();
  }
  
  initialize() {
    // Create the projectile group if it doesn't exist
    if (!this.projectileGroup) {
      this.projectileGroup = this.scene.physics.add.group();
    }
    
    // Set up collision with enemies
    this.scene.physics.add.overlap(
      this.projectileGroup,
      this.scene.enemies,
      this.onHitEnemy,
      null,
      this
    );
  }
  
  canFire(time) {
    return time > this.lastFired + this.fireRate;
  }
  
  fire(time, target) {
    if (!this.canFire(time)) return false;
    
    this.createProjectile(target);
    this.lastFired = time;
    return true;
  }
  
  createProjectile(target) {
    // This method should be overridden by subclasses
    console.warn('createProjectile method should be implemented by subclasses');
  }
  
  onHitEnemy(projectile, enemy) {
    // Use the enemy's takeDamage method if it exists
    if (enemy.takeDamage) {
      const isDead = enemy.takeDamage(projectile.damage || this.damage);
      
      // Destroy projectile
      projectile.destroy();
    } else {
      // Fallback for enemies without takeDamage method
      enemy.destroy();
      projectile.destroy();
    }
  }
  
  getTextureName() {
    return this.texture;
  }
  
  getName() {
    return this.name;
  }
  
  // Method to update weapon properties (for upgrades)
  upgrade(properties) {
    Object.assign(this, properties);
  }
} 