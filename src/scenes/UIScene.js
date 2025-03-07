import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
    
    // UI elements
    this.healthBar = null;
    this.xpBar = null;
    this.timerText = null;
    this.levelText = null;
    this.waveText = null;
    this.weaponIcon = null;
    this.weaponText = null;
  }

  create() {
    // Get reference to the game scene
    this.gameScene = this.scene.get('GameScene');
    
    // Create UI container
    this.createUIContainer();
    
    // Create health bar
    this.createHealthBar();
    
    // Create XP bar
    this.createXPBar();
    
    // Create timer
    this.createTimer();
    
    // Create level display
    this.createLevelDisplay();
    
    // Create wave display
    this.createWaveDisplay();
    
    // Create weapon display
    this.createWeaponDisplay();
    
    // Listen for events from the game scene
    this.gameScene.events.on('update-player-health', this.updateHealthBar, this);
    this.gameScene.events.on('update-player-xp', this.updateXPBar, this);
    this.gameScene.events.on('update-player-level', this.updateLevelDisplay, this);
    this.gameScene.events.on('update-game-time', this.updateTimer, this);
    this.gameScene.events.on('update-wave', this.updateWaveDisplay, this);
    this.gameScene.events.on('update-weapon', this.updateWeaponDisplay, this);
  }

  createUIContainer() {
    // Create a container for all UI elements
    this.uiContainer = this.add.container(0, 0);
    this.uiContainer.setDepth(100);
    this.uiContainer.setScrollFactor(0);
  }

  createHealthBar() {
    // Create health bar background
    const healthBarBg = this.add.rectangle(20, 20, 200, 20, 0x000000, 0.7);
    healthBarBg.setOrigin(0, 0);
    
    // Create health bar fill
    this.healthBar = this.add.rectangle(22, 22, 196, 16, 0xff0000, 1);
    this.healthBar.setOrigin(0, 0);
    
    // Create health text
    this.healthText = this.add.text(120, 20, 'Health', {
      font: '14px Arial',
      fill: '#ffffff'
    });
    this.healthText.setOrigin(0.5, 0);
    
    // Add to UI container
    this.uiContainer.add(healthBarBg);
    this.uiContainer.add(this.healthBar);
    this.uiContainer.add(this.healthText);
  }

  createXPBar() {
    // Create XP bar background
    const xpBarBg = this.add.rectangle(20, 50, 200, 20, 0x000000, 0.7);
    xpBarBg.setOrigin(0, 0);
    
    // Create XP bar fill
    this.xpBar = this.add.rectangle(22, 52, 196, 16, 0x9b59b6, 1);
    this.xpBar.setOrigin(0, 0);
    
    // Create XP text
    this.xpText = this.add.text(120, 50, 'XP', {
      font: '14px Arial',
      fill: '#ffffff'
    });
    this.xpText.setOrigin(0.5, 0);
    
    // Add to UI container
    this.uiContainer.add(xpBarBg);
    this.uiContainer.add(this.xpBar);
    this.uiContainer.add(this.xpText);
  }

  createTimer() {
    // Create timer background
    const timerBg = this.add.rectangle(this.cameras.main.width / 2, 20, 150, 30, 0x000000, 0.7);
    timerBg.setOrigin(0.5, 0);
    
    // Create timer text
    this.timerText = this.add.text(this.cameras.main.width / 2, 35, '00:00', {
      font: '18px Arial',
      fill: '#ffffff'
    });
    this.timerText.setOrigin(0.5, 0.5);
    
    // Add to UI container
    this.uiContainer.add(timerBg);
    this.uiContainer.add(this.timerText);
  }

  createLevelDisplay() {
    // Create level background
    const levelBg = this.add.rectangle(this.cameras.main.width - 20, 20, 100, 30, 0x000000, 0.7);
    levelBg.setOrigin(1, 0);
    
    // Create level text
    this.levelText = this.add.text(this.cameras.main.width - 70, 35, 'Level: 1', {
      font: '16px Arial',
      fill: '#ffffff'
    });
    this.levelText.setOrigin(0.5, 0.5);
    
    // Add to UI container
    this.uiContainer.add(levelBg);
    this.uiContainer.add(this.levelText);
  }

  createWaveDisplay() {
    // Create wave background
    const waveBg = this.add.rectangle(this.cameras.main.width - 20, 60, 100, 30, 0x000000, 0.7);
    waveBg.setOrigin(1, 0);
    
    // Create wave text
    this.waveText = this.add.text(this.cameras.main.width - 70, 75, 'Wave: 1', {
      font: '16px Arial',
      fill: '#ffffff'
    });
    this.waveText.setOrigin(0.5, 0.5);
    
    // Add to UI container
    this.uiContainer.add(waveBg);
    this.uiContainer.add(this.waveText);
  }

  createWeaponDisplay() {
    // Create weapon background
    const weaponBg = this.add.rectangle(20, this.cameras.main.height - 20, 80, 80, 0x000000, 0.7);
    weaponBg.setOrigin(0, 1);
    
    // Create weapon icon
    this.weaponIcon = this.add.image(60, this.cameras.main.height - 60, 'rock');
    this.weaponIcon.setScale(2);
    
    // Create weapon text
    this.weaponText = this.add.text(60, this.cameras.main.height - 25, 'Rock', {
      font: '14px Arial',
      fill: '#ffffff'
    });
    this.weaponText.setOrigin(0.5, 0.5);
    
    // Add to UI container
    this.uiContainer.add(weaponBg);
    this.uiContainer.add(this.weaponIcon);
    this.uiContainer.add(this.weaponText);
  }

  updateHealthBar(currentHealth, maxHealth) {
    // Update health bar width
    const healthPercent = Math.max(0, currentHealth / maxHealth);
    this.healthBar.width = 196 * healthPercent;
    
    // Update health text
    this.healthText.setText(`Health: ${currentHealth}/${maxHealth}`);
  }

  updateXPBar(currentXP, maxXP) {
    // Update XP bar width
    const xpPercent = currentXP / maxXP;
    this.xpBar.width = 196 * xpPercent;
    
    // Update XP text
    this.xpText.setText(`XP: ${currentXP}/${maxXP}`);
  }

  updateLevelDisplay(level) {
    // Update level text
    this.levelText.setText(`Level: ${level}`);
  }

  updateTimer(currentTime, maxTime) {
    // Calculate minutes and seconds
    const totalSeconds = Math.floor(currentTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // Format time string
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update timer text
    this.timerText.setText(timeString);
    
    // Calculate remaining time percentage
    const timePercent = currentTime / maxTime;
    
    // Change color based on remaining time
    if (timePercent > 0.75) {
      this.timerText.setColor('#ffffff');
    } else if (timePercent > 0.5) {
      this.timerText.setColor('#ffff00');
    } else if (timePercent > 0.25) {
      this.timerText.setColor('#ffa500');
    } else {
      this.timerText.setColor('#ff0000');
    }
  }

  updateWaveDisplay(wave) {
    // Update wave text
    this.waveText.setText(`Wave: ${wave}`);
  }

  updateWeaponDisplay(weaponKey) {
    // Update weapon icon and text based on current weapon
    if (weaponKey === 'bow') {
      this.weaponIcon.setTexture('bow');
      this.weaponText.setText('Bow');
    } else if (weaponKey === 'stink_bomb') {
      this.weaponIcon.setTexture('stink_bomb');
      this.weaponText.setText('Stink Bomb');
    } else if (weaponKey === 'fireball') {
      this.weaponIcon.setTexture('rock'); // Using rock texture with tint for now
      this.weaponIcon.setTint(0xff5500); // Orange tint to match fireball
      this.weaponText.setText('Fireball');
    } else {
      this.weaponIcon.setTexture('rock');
      this.weaponIcon.clearTint(); // Clear any tint
      this.weaponText.setText('Rock');
    }
  }
} 