import RockWeapon from './RockWeapon';
import BowWeapon from './BowWeapon';
import StinkBombWeapon from './StinkBombWeapon';
import FireballWeapon from './FireballWeapon';

export default class WeaponManager {
  constructor(scene) {
    this.scene = scene;
    this.weapons = {};
    this.currentWeapon = null;
    
    this.initialize();
  }
  
  initialize() {
    // Create default weapons
    this.registerWeapon('rock', new RockWeapon(this.scene));
    this.registerWeapon('bow', new BowWeapon(this.scene));
    this.registerWeapon('stink_bomb', new StinkBombWeapon(this.scene));
    this.registerWeapon('fireball', new FireballWeapon(this.scene));
    
    // Set default weapon
    this.setCurrentWeapon('rock');
  }
  
  registerWeapon(key, weapon) {
    this.weapons[key] = weapon;
    return weapon;
  }
  
  getWeapon(key) {
    return this.weapons[key];
  }
  
  getCurrentWeapon() {
    return this.currentWeapon;
  }
  
  setCurrentWeapon(key) {
    if (this.weapons[key]) {
      this.currentWeapon = this.weapons[key];
      this.scene.events.emit('update-weapon', key);
      return true;
    }
    return false;
  }
  
  fire(time, target) {
    if (this.currentWeapon) {
      return this.currentWeapon.fire(time, target);
    }
    return false;
  }
  
  upgradeWeapon(key, properties) {
    if (this.weapons[key]) {
      this.weapons[key].upgrade(properties);
      return true;
    }
    return false;
  }
  
  upgradeAllWeapons(properties) {
    Object.values(this.weapons).forEach(weapon => {
      weapon.upgrade(properties);
    });
  }
} 