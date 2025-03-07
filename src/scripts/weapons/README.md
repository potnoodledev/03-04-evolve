# Weapon System

This directory contains the weapon system for the game. The system is designed to be modular and extensible, making it easy to add new weapon types.

## Structure

- `Weapon.js`: Base class for all weapons
- `RockWeapon.js`: Implementation of the rock weapon
- `BowWeapon.js`: Implementation of the bow weapon
- `StinkBombWeapon.js`: Implementation of the stink bomb weapon
- `WeaponManager.js`: Class to manage weapons and handle switching
- `index.js`: Exports all weapon-related classes

## How to Add a New Weapon

1. Create a new file for your weapon (e.g., `LaserWeapon.js`)
2. Extend the base `Weapon` class
3. Implement the required methods
4. Register the weapon in the `WeaponManager`

### Example: Creating a Laser Weapon

```javascript
import Weapon from './Weapon';

export default class LaserWeapon extends Weapon {
  constructor(scene, config = {}) {
    super(scene, {
      name: 'Laser',
      texture: 'laser',
      damage: config.damage || 50,
      fireRate: config.fireRate || 2000,
      projectileSpeed: config.projectileSpeed || 600,
      projectileLifetime: config.projectileLifetime || 1500,
      ...config
    });
    
    // Additional properties specific to the laser weapon
    this.width = config.width || 10;
    this.penetration = config.penetration || true; // Can hit multiple enemies
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
    projectile.penetration = this.penetration;
    
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
  
  // Override onHitEnemy to handle penetration
  onHitEnemy(projectile, enemy) {
    // Use the enemy's takeDamage method if it exists
    if (enemy.takeDamage) {
      const isDead = enemy.takeDamage(projectile.damage || this.damage);
      
      // Only destroy the projectile if it doesn't have penetration
      if (!projectile.penetration) {
        projectile.destroy();
      }
    } else {
      // Fallback for enemies without takeDamage method
      enemy.destroy();
      
      // Only destroy the projectile if it doesn't have penetration
      if (!projectile.penetration) {
        projectile.destroy();
      }
    }
  }
}
```

### Registering the New Weapon

1. Import your new weapon in `index.js`:

```javascript
import LaserWeapon from './LaserWeapon';

export {
  // ... existing exports
  LaserWeapon
};
```

2. Register the weapon in `WeaponManager.js`:

```javascript
// In the initialize method
this.registerWeapon('laser', new LaserWeapon(this.scene));
```

3. Update the UI to handle the new weapon:

```javascript
// In UIScene.js, updateWeaponDisplay method
if (weaponKey === 'laser') {
  this.weaponIcon.setTexture('laser');
  this.weaponText.setText('Laser');
} else if (weaponKey === 'bow') {
  // ... existing code
}
```

## Weapon Properties

The base `Weapon` class supports the following properties:

- `name`: Display name of the weapon
- `texture`: Texture key for the weapon projectile
- `damage`: Base damage of the weapon
- `fireRate`: Time in milliseconds between shots
- `projectileSpeed`: Speed of the projectile
- `projectileLifetime`: Time in milliseconds before the projectile is destroyed
- `projectileScale`: Scale of the projectile sprite

You can add additional properties specific to your weapon type in the subclass. 