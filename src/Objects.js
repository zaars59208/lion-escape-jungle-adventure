import * as PIXI from 'pixi.js';

export class Cub {
    constructor(app) {
        this.app = app;
        const texture = PIXI.Assets.get('cub');
        this.sprite = new PIXI.Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.2);
        this.sprite.x = app.screen.width + 100;
        this.sprite.y = app.screen.height - 100; // Cubs stay slightly above or on grass
        app.stage.addChild(this.sprite);
        this.speed = 4;
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
        // Cub is small, make it slightly larger than visual for easier pickup
        return {
            x: bounds.x - 2,
            y: bounds.y - 2,
            width: bounds.width + 4,
            height: bounds.height + 4
        };
    }
}

export class Meat {
    constructor(app) {
        this.app = app;
        this.sprite = new PIXI.Graphics();

        // Meat / Steak design
        this.sprite.beginFill(0x8B4513); // Brown edge
        this.sprite.drawRoundedRect(-15, -10, 30, 20, 5);
        this.sprite.endFill();

        this.sprite.beginFill(0xFF6347); // Tomato/Red meat
        this.sprite.drawCircle(0, 0, 8);
        this.sprite.endFill();

        this.sprite.beginFill(0xFFFFFF); // Bone detail
        this.sprite.drawCircle(-8, 0, 4);
        this.sprite.endFill();

        this.sprite.x = app.screen.width + 100;
        this.sprite.y = 200 + Math.random() * 200; // Floating in air
        app.stage.addChild(this.sprite);
        this.speed = 5;
    }

    update(delta) {
        this.sprite.x -= this.speed * delta;
        // Bobbing motion
        this.sprite.y += Math.sin(Date.now() / 200) * 2;
        this.sprite.rotation += 0.05 * delta; // Spinning meat!
    }

    isOffScreen() {
        return this.sprite.x < -100;
    }

    destroy() {
        this.app.stage.removeChild(this.sprite);
    }

    getBounds() {
        const bounds = this.sprite.getBounds();
        // Meat hitbox centered
        return {
            x: bounds.x + 2,
            y: bounds.y + 2,
            width: bounds.width - 4,
            height: bounds.height - 4
        };
    }
}

export class Hindrance {
    constructor(app, type) {
        this.app = app;
        this.type = type; // 'stream', 'tree', 'rock'
        this.sprite = new PIXI.Graphics();

        if (type === 'stream') {
            // Using water-pond.png asset
            const texture = PIXI.Assets.get('water');
            const waterSprite = new PIXI.Sprite(texture);
            waterSprite.anchor.set(0.5, 0.7); // Sink it slightly into the platform
            waterSprite.scale.set(0.2);
            this.sprite.addChild(waterSprite);

        } else if (type === 'tree') {
            // Using tree.png asset
            const texture = PIXI.Assets.get('tree');
            const treeSprite = new PIXI.Sprite(texture);
            treeSprite.anchor.set(0.5, 1);
            treeSprite.scale.set(0.25); // Adjust scale to make it "smaller yet taller" visually
            this.sprite.addChild(treeSprite);

        } else if (type === 'rock') {
            // Using rock.png asset
            const texture = PIXI.Assets.get('rock');
            const rockSprite = new PIXI.Sprite(texture);
            rockSprite.anchor.set(0.5, 1);
            rockSprite.scale.set(0.15);
            this.sprite.addChild(rockSprite);
        }

        this.sprite.x = app.screen.width + 100;
        this.sprite.y = app.screen.height - 80;
        app.stage.addChild(this.sprite);
        this.speed = 4;
    }

    update(delta) {
        this.sprite.x -= this.speed * delta;

        if (this.type === 'stream') {
            // Simple foam animation
            this.sprite.children.forEach((child, i) => {
                child.x = (Math.sin(Date.now() / 500 + i) * 10);
            });
        }
    }

    isOffScreen() {
        return this.sprite.x < -100;
    }

    destroy() {
        this.app.stage.removeChild(this.sprite);
    }

    getBounds() {
        const bounds = this.sprite.getBounds();
        // Obstacles should have tighter hitboxes
        let px = bounds.width * 0.15;
        let py = bounds.height * 0.1;

        if (this.type === 'stream') {
            py = bounds.height * 0.4; // Pond is flat, collision only on content
            px = bounds.width * 0.15;
        } else if (this.type === 'tree') {
            // Tighter bounds for the tree trunk, ignoring most of the canopy
            px = bounds.width * 0.35;
            py = bounds.height * 0.1;
        } else if (this.type === 'rock') {
            px = bounds.width * 0.2;
            py = bounds.height * 0.2;
        }

        return {
            x: bounds.x + px,
            y: bounds.y + py,
            width: bounds.width - px * 2,
            height: bounds.height - py
        };
    }
}
