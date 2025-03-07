import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Display loading text
    const loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      'Loading...',
      {
        font: '20px Arial',
        fill: '#ffffff'
      }
    );
    loadingText.setOrigin(0.5);

    // Create loading bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(
      this.cameras.main.width / 2 - 160,
      this.cameras.main.height / 2,
      320,
      50
    );

    // Loading progress events
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        this.cameras.main.width / 2 - 150,
        this.cameras.main.height / 2 + 10,
        300 * value,
        30
      );
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load game assets
    this.load.image('player', 'assets/images/player.png');
    this.load.svg('enemy', 'assets/images/enemy.svg');
    this.load.svg('blinker_enemy', 'assets/images/blinker_enemy.svg');
    this.load.svg('crystal', 'assets/images/crystal.svg');
    this.load.svg('rock', 'assets/images/rock.svg');
    this.load.svg('bow', 'assets/images/bow.svg');
    this.load.svg('joystick', 'assets/images/joystick.svg');
  }

  create() {
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
} 