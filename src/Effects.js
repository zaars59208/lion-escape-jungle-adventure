import * as PIXI from 'pixi.js';

export class BloodEffect {
    constructor(app, x, y) {
        this.app = app;
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;
        app.stage.addChild(this.container);

        this.particles = [];
        this.timer = 0;
        this.duration = 120; // 2 seconds at 60fps

        for (let i = 0; i < 20; i++) {
            const p = new PIXI.Graphics();
            p.beginFill(0x8B0000); // Dark red
            p.drawCircle(0, 0, Math.random() * 5 + 2);
            p.endFill();

            p.vx = (Math.random() - 0.5) * 10;
            p.vy = (Math.random() - 0.5) * 10;
            p.alpha = 1;

            this.container.addChild(p);
            this.particles.push(p);
        }
    }

    update(delta) {
        this.timer += delta;

        this.particles.forEach(p => {
            p.x += p.vx * delta;
            p.y += p.vy * delta;
            p.vy += 0.2 * delta; // Gravity
            p.alpha = Math.max(0, 1 - (this.timer / this.duration));
        });

        if (this.timer >= this.duration) {
            this.destroy();
            return true;
        }
        return false;
    }

    destroy() {
        this.app.stage.removeChild(this.container);
        this.container.destroy({ children: true });
    }
}

export class ScorePopup {
    constructor(app, x, y, points) {
        this.app = app;
        this.timer = 0;
        this.duration = 60; // 1 second at 60fps

        // Create text with PIXI v8 syntax
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: '#FFD700', // Gold color
            stroke: { color: '#000000', width: 4 },
            dropShadow: {
                color: '#000000',
                blur: 4,
                angle: Math.PI / 6,
                distance: 2
            }
        });

        this.text = new PIXI.Text({ text: `+${points}`, style });
        this.text.anchor.set(0.5);
        this.text.x = x;
        this.text.y = y;
        this.text.scale.set(0.5); // Start small

        app.stage.addChild(this.text);

        this.startY = y;
    }

    update(delta) {
        this.timer += delta;
        const progress = this.timer / this.duration;

        // Rise up
        this.text.y = this.startY - (progress * 80);

        // Scale animation: grow then shrink
        if (progress < 0.3) {
            this.text.scale.set(0.5 + progress * 2);
        } else {
            this.text.scale.set(1.1 - (progress - 0.3) * 0.5);
        }

        // Fade out
        this.text.alpha = 1 - progress;

        if (this.timer >= this.duration) {
            this.destroy();
            return true;
        }
        return false;
    }

    destroy() {
        this.app.stage.removeChild(this.text);
        this.text.destroy();
    }
}
