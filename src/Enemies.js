import * as PIXI from 'pixi.js';

export class Arrow {
    constructor(app, startX, startY) {
        this.app = app;
        const texture = PIXI.Assets.get('arrow');
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.15);
        this.sprite.scale.x *= -1; // Flip to face left (towards the lion)
        this.sprite.x = startX;
        this.sprite.y = startY;
        this.speed = 10;
        app.stage.addChild(this.sprite);
    }

    update(delta) {
        this.sprite.x -= this.speed * delta;
    }

    isOffScreen() {
        return this.sprite.x < -100;
    }

    destroy() {
        this.app.stage.removeChild(this.sprite);
    }

    getBounds() {
        const bounds = this.sprite.getBounds();
        // Tight bounds for the arrow shaft and tip
        return {
            x: bounds.x + bounds.width * 0.1,
            y: bounds.y + bounds.height * 0.45,
            width: bounds.width * 0.8,
            height: bounds.height * 0.1
        };
    }
}

export class Hunter {
    constructor(app) {
        this.app = app;
        const texture = PIXI.Assets.get('hunter');
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5, 1);
        this.sprite.scale.set(0.25);
        this.sprite.scale.x *= -1; // Flip to face left (towards the lion)
        this.sprite.x = app.screen.width + 100;
        this.sprite.y = app.screen.height - 80;
        app.stage.addChild(this.sprite);

        this.speed = 3;
        this.shootTimer = 0;
        this.shootInterval = 120; // Every 2 seconds approx
        this.hasShot = false;
    }

    getBounds() {
        const bounds = this.sprite.getBounds();
        // Typical hunter hitbox, avoiding the edges of the bow/feathers
        return {
            x: bounds.x + bounds.width * 0.2,
            y: bounds.y + bounds.height * 0.1,
            width: bounds.width * 0.6,
            height: bounds.height * 0.85
        };
    }

    update(delta, lionX) {
        this.sprite.x -= this.speed * delta;
        this.shootTimer += delta;

        if (!this.hasShot && this.shootTimer >= this.shootInterval) {
            this.hasShot = true;
            return true; // Signal to shoot EXACTLY ONCE
        }
        return false;
    }

    isOffScreen() {
        return this.sprite.x < -200;
    }

    destroy() {
        this.app.stage.removeChild(this.sprite);
    }
}

export class Monkey {
    constructor(app) {
        this.app = app;
        const texture = PIXI.Assets.get('monkey');
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5, 1);
        this.sprite.scale.set(0.25);
        this.sprite.scale.x *= -1; // Face lion
        this.sprite.x = app.screen.width + 100;
        this.sprite.y = app.screen.height - 80;
        app.stage.addChild(this.sprite);

        this.speed = 3.5;
    }

    getBounds() {
        const b = this.sprite.getBounds();
        return { x: b.x + 10, y: b.y + 10, width: b.width - 20, height: b.height - 20 };
    }

    update(delta) {
        this.sprite.x -= this.speed * delta;
    }

    isOffScreen() { return this.sprite.x < -100; }
    destroy() { this.app.stage.removeChild(this.sprite); }
}

export class YellowMonkey {
    constructor(app) {
        this.app = app;
        const texture = PIXI.Assets.get('yellow-monkey');
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5, 1);
        this.sprite.scale.set(0.25);
        this.sprite.scale.x *= -1; // Face lion
        this.sprite.x = app.screen.width + 100;
        this.sprite.y = app.screen.height - 80;
        app.stage.addChild(this.sprite);

        this.speed = 4;
        this.jumpTimer = 0;
        this.jumpInterval = 60;
        this.velocity = 0;
        this.gravity = 0.5;
    }

    getBounds() {
        const b = this.sprite.getBounds();
        return { x: b.x + 10, y: b.y + 10, width: b.width - 20, height: b.height - 20 };
    }

    update(delta) {
        this.sprite.x -= this.speed * delta;

        // Jumps rhythmicially
        this.velocity += this.gravity * delta;
        this.sprite.y += this.velocity * delta;

        if (this.sprite.y >= this.app.screen.height - 80) {
            this.sprite.y = this.app.screen.height - 80;
            this.jumpTimer += delta;
            if (this.jumpTimer >= this.jumpInterval) {
                this.jumpTimer = 0;
                this.velocity = -12;
            }
        }
    }

    isOffScreen() { return this.sprite.x < -100; }
    destroy() { this.app.stage.removeChild(this.sprite); }
}

export class Parrot {
    constructor(app) {
        this.app = app;

        // Create animation frames from the 8 parrot images
        const frames = [
            PIXI.Assets.get('p1-a'),
            PIXI.Assets.get('p1-b'),
            PIXI.Assets.get('p1-c'),
            PIXI.Assets.get('p1-d'),
            PIXI.Assets.get('p1-e'),
            PIXI.Assets.get('p1-f'),
            PIXI.Assets.get('p1-g'),
            PIXI.Assets.get('p1-h')
        ];

        this.sprite = new PIXI.AnimatedSprite(frames);
        this.sprite.anchor.set(0.5);
        this.sprite.animationSpeed = 0.15 + Math.random() * 0.1; // Vary wing flap speed
        this.sprite.play();

        // Random scale for variety
        const scale = 0.15 + Math.random() * 0.15;
        this.sprite.scale.set(scale);

        // Flip some parrots horizontally for variety
        if (Math.random() > 0.5) {
            this.sprite.scale.x *= -1;
        }

        // Random height (top 60% of screen)
        this.sprite.x = app.screen.width + 100;
        this.sprite.y = 50 + Math.random() * (app.screen.height * 0.6);

        app.stage.addChild(this.sprite);

        this.speed = 3 + Math.random() * 2;
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveSpeed = 0.03 + Math.random() * 0.03;

        this.hasSounded = false;
    }

    update(delta, audio) {
        this.sprite.x -= this.speed * delta;

        // Wave pattern for natural flight
        this.waveOffset += this.waveSpeed * delta;
        this.sprite.y += Math.sin(this.waveOffset) * 0.8;

        // Play sound when entering the screen
        if (!this.hasSounded && this.sprite.x < this.app.screen.width - 50) {
            this.hasSounded = true;
            if (audio) audio.playParrot();
        }
    }

    isOffScreen() { return this.sprite.x < -200; }
    destroy() {
        this.sprite.stop();
        this.app.stage.removeChild(this.sprite);
    }
    getBounds() { return this.sprite.getBounds(); }
}
