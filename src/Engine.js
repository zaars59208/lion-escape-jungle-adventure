import { Lion } from './Lion';
import { Background } from './Background';
import { Hunter, Arrow, Monkey, YellowMonkey, Parrot } from './Enemies';
import { Cub, Meat, Hindrance } from './Objects';
import { BloodEffect, ScorePopup } from './Effects';
import { AudioManager } from './AudioManager';

export class Engine {
    constructor(app, ui) {
        this.app = app;
        this.ui = ui;
        this.audio = new AudioManager();

        this.keys = {}; // Track keys for continuous movement

        this.reset();

        this.shakeTimer = 0;
        this.shakeIntensity = 0;

        // Input handling
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                if (this.gameActive) this.lion.jump(this.audio);
            }
            if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                if (this.gameActive) this.lion.setSitting(true);
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                if (this.gameActive) this.lion.setSitting(false);
            }
        });

        // Touch handling for mobile: Center tap to jump, Left/Right tap to move? 
        // Let's keep it simple: Top half jump, bottom half sit.
        window.addEventListener('touchstart', (e) => {
            if (!this.gameActive) return;
            const touchY = e.touches[0].clientY;
            if (touchY < window.innerHeight / 2) {
                this.lion.jump(this.audio);
            } else {
                this.lion.setSitting(true);
            }
        });

        window.addEventListener('touchend', () => {
            if (this.gameActive) this.lion.setSitting(false);
        });
    }

    reset() {
        this.app.stage.removeChildren();

        this.background = new Background(this.app);
        this.lion = new Lion(this.app);

        this.enemies = [];
        this.arrows = [];
        this.collectibles = [];
        this.hindrances = [];
        this.parrots = [];
        this.effects = [];

        this.score = 0;
        this.gameActive = false;
        this.spawnTimer = 0;
        this.difficulty = 1;

        this.ui.updateScore(0);
        this.ui.showStartScreen();
    }

    start() {
        this.gameActive = true;
        this.ui.hideStartScreen();
        this.ui.hideGameOver();
        this.audio.startMusic();
    }

    update(delta) {
        // Update effects even if game is not active (for death animations)
        this.effects.forEach((effect, index) => {
            if (effect.update(delta)) {
                this.effects.splice(index, 1);
            }
        });

        if (!this.gameActive) return;

        // Apply screen shake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= delta;
            this.app.stage.x = (Math.random() - 0.5) * this.shakeIntensity;
            this.app.stage.y = (Math.random() - 0.5) * this.shakeIntensity;
        } else {
            this.app.stage.x = 0;
            this.app.stage.y = 0;
        }

        this.background.update(delta);

        // Handle horizontal movement
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.lion.moveX(-1, delta);
        if (this.keys['ArrowRight'] || this.keys['KeyD']) this.lion.moveX(1, delta);

        this.lion.update(delta);

        // Difficulty increases over time
        this.difficulty += 0.00005 * delta;
        this.background.scrollSpeed = (2 + this.difficulty * 1) * delta; // Slower scroll speed

        // Spawning logic (gets faster)
        this.spawnTimer += delta;
        const spawnThreshold = Math.max(30, 100 - (this.difficulty * 20));

        if (this.spawnTimer > spawnThreshold) {
            this.spawnTimer = 0;
            this.spawnRandom();
        }

        // Update enemies
        this.enemies.forEach((enemy, index) => {
            if (enemy instanceof Hunter) {
                // Hunter speed also increases slightly
                enemy.speed = 3 + this.difficulty;
                if (enemy.update(delta, this.lion.sprite.x)) {
                    const arrow = new Arrow(this.app, enemy.sprite.x, enemy.sprite.y - 50);
                    // Arrows get faster!
                    arrow.speed = 10 + this.difficulty * 5;
                    this.arrows.push(arrow);
                }
            } else {
                enemy.update(delta);
            }

            if (enemy.isOffScreen()) {
                enemy.destroy();
                this.enemies.splice(index, 1);
            }
        });

        // Update arrows
        this.arrows.forEach((arrow, index) => {
            arrow.update(delta);
            if (arrow.isOffScreen()) {
                arrow.destroy();
                this.arrows.splice(index, 1);
            }

            // Collision with Lion
            if (this.checkCollision(this.lion.getBounds(), arrow.getBounds())) {
                this.audio.playHitArrow();
                this.shake(20, 10);

                // Lion vanishes and bleeds
                this.lion.sprite.visible = false;
                this.effects.push(new BloodEffect(this.app, this.lion.sprite.x, this.lion.sprite.y - 40));

                this.gameOver();
            }
        });

        // Update objects
        this.collectibles.forEach((item, index) => {
            item.update(delta);
            if (this.checkCollision(this.lion.getBounds(), item.getBounds())) {
                const points = (item instanceof Cub) ? 100 : 50;
                this.score += points;
                this.ui.updateScore(this.score);
                this.audio.playEat(); // Generic collection sound

                // Score popup animation
                this.effects.push(new ScorePopup(this.app, item.sprite.x, item.sprite.y - 30, points));

                item.destroy();
                this.collectibles.splice(index, 1);

                // Little bump for collecting
                if (item instanceof Cub) this.shake(5, 5);
            } else if (item.isOffScreen()) {
                item.destroy();
                this.collectibles.splice(index, 1);
            }
        });

        // Update hindrances
        this.hindrances.forEach((h, index) => {
            h.update(delta);

            if (this.checkCollision(this.lion.getBounds(), h.getBounds())) {
                if (h.type === 'rock') {
                    // Rocks are now lethal!
                    this.audio.playRockThud();
                    this.shake(20, 15);

                    // Lion vanishes and bleeds
                    this.lion.sprite.visible = false;
                    this.effects.push(new BloodEffect(this.app, this.lion.sprite.x, this.lion.sprite.y - 40));

                    this.gameOver();
                } else {
                    if (h.type === 'stream') {
                        this.audio.playSplash();
                        this.shake(20, 15);
                        this.gameOver();
                    }
                    if (h.type === 'tree') {
                        this.audio.playCaught();
                        this.shake(20, 15);
                        this.gameOver();
                    }
                }
            }

            if (h.isOffScreen()) {
                h.destroy();
                this.hindrances.splice(index, 1);
            }
        });

        // Update parrots
        this.parrots.forEach((p, index) => {
            p.update(delta, this.audio);
            if (p.isOffScreen()) {
                p.destroy();
                this.parrots.splice(index, 1);
            }
        });

        // Combined Combat: Lion vs Enemies (Hunters & Monkeys)
        this.enemies.forEach((enemy, index) => {
            if (this.checkCollision(this.lion.getBounds(), enemy.getBounds())) {
                let canDefeat = false;

                if (enemy instanceof Hunter) {
                    canDefeat = true; // Hunters are always defeated by collision currently
                } else if (enemy instanceof Monkey) {
                    // Ground monkey - defeated if lion is jumping/attacking?
                    // "sit to prevent coming monkeys"
                    // Let's say: if sitting, you don't collide. If jumping, you defeat.
                    if (this.lion.isSitting) {
                        // Safe! (Wait, if they collide while sitting, maybe we still want defeat? 
                        // User said "sit to prevent", usually means dodge).
                        return;
                    }
                    canDefeat = true;
                } else if (enemy instanceof YellowMonkey) {
                    // Jumping monkey - safe if lion is sitting.
                    if (this.lion.isSitting) return; // Duck under!
                    canDefeat = true;
                }

                if (canDefeat) {
                    const points = (enemy instanceof Hunter) ? 150 : 200;
                    this.score += points;
                    this.ui.updateScore(this.score);
                    this.effects.push(new BloodEffect(this.app, enemy.sprite.x, enemy.sprite.y - 40));

                    // Score popup animation
                    this.effects.push(new ScorePopup(this.app, enemy.sprite.x, enemy.sprite.y - 60, points));

                    this.audio.playEat();
                    enemy.destroy();
                    this.enemies.splice(index, 1);
                    this.shake(10, 5);
                } else {
                    // If not defeated and not safe, it's lethal
                    // (Though currently hunters/monkeys are always 'defeat' if colliding and not 'return')
                }
            }
        });
    }

    shake(duration, intensity) {
        this.shakeTimer = duration;
        this.shakeIntensity = intensity;
    }

    spawnRandom() {
        const rand = Math.random();

        // Global enemy limit (Hunters + Monkeys)
        const enemies = this.enemies.filter(e => e instanceof Hunter || e instanceof Monkey || e instanceof YellowMonkey);
        const canSpawnEnemy = enemies.length < 2;
        const rightmostEnemyX = enemies.length > 0 ? Math.max(...enemies.map(h => h.sprite.x)) : -1;
        const distanceCheck = rightmostEnemyX < this.app.screen.width - 250;

        if (canSpawnEnemy && distanceCheck) {
            if (rand < 0.15) {
                this.enemies.push(new Hunter(this.app));
            } else if (rand < 0.3) {
                this.enemies.push(new Monkey(this.app));
            } else if (rand < 0.45) {
                this.enemies.push(new YellowMonkey(this.app));
            } else if (rand < 0.6) {
                const types = ['stream', 'tree', 'rock'];
                const type = types[Math.floor(Math.random() * types.length)];
                this.hindrances.push(new Hindrance(this.app, type));
            } else if (rand < 0.8) {
                this.collectibles.push(new Cub(this.app));
            } else if (rand < 0.95) {
                this.collectibles.push(new Meat(this.app));
            }
        }

        // Ambient parrots (Individual and Flocks)
        const parrotRoll = Math.random();

        if (parrotRoll < 0.05) {
            // 5% chance: Spawn a flock of 7-9 parrots
            const flockSize = 7 + Math.floor(Math.random() * 3); // 7, 8, or 9
            const baseY = 50 + Math.random() * (this.app.screen.height * 0.4);
            const baseX = this.app.screen.width + 100;

            for (let i = 0; i < flockSize; i++) {
                // Create parrot with slight offset for flock formation
                const parrot = new Parrot(this.app);

                // V-formation or loose cluster
                const offsetX = (i % 2 === 0 ? 1 : -1) * Math.floor(i / 2) * 40;
                const offsetY = Math.abs(i - flockSize / 2) * 15 + (Math.random() - 0.5) * 20;

                parrot.sprite.x = baseX + offsetX;
                parrot.sprite.y = baseY + offsetY;

                // Sync animation slightly for flock cohesion
                parrot.sprite.currentFrame = Math.floor(Math.random() * 3);

                this.parrots.push(parrot);
            }
        } else if (parrotRoll < 0.20) {
            // 15% chance: Spawn individual parrot
            this.parrots.push(new Parrot(this.app));
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    gameOver() {
        this.gameActive = false;
        this.audio.stopMusic();
        this.ui.showGameOver(this.score);
    }
}
