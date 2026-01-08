import * as PIXI from 'pixi.js';

export class Lion {
    constructor(app) {
        this.app = app;
        const texture = PIXI.Assets.get('lion');
        this.sprite = new PIXI.Sprite(texture);

        // Scale and position
        this.sprite.anchor.set(0.5, 1);
        this.sprite.scale.set(0.3); // Adjust based on original image size
        this.sprite.x = 150;
        this.sprite.y = app.screen.height - 80;

        app.stage.addChild(this.sprite);

        // Physics variables
        this.velocity = 0;
        this.gravity = 0.8;
        this.jumpForce = -15;
        this.groundY = app.screen.height - 80;
        this.isJumping = false;
        this.jumpCount = 0;
        this.maxJumps = 2;
        this.animationTime = 0;

        // NEW: Horizontal movement and Sitting
        this.speedX = 5;
        this.isSitting = false;
    }

    jump(audio) {
        if (this.isSitting) return; // Prevent jumping while sitting
        if (this.jumpCount < this.maxJumps) {
            this.velocity = this.jumpForce;
            this.isJumping = true;
            this.jumpCount++;
            if (audio) audio.playJump();
        }
    }

    moveX(direction, delta) {
        if (this.isSitting) return;
        this.sprite.x += direction * this.speedX * delta;

        // Constrain to screen
        const padding = 50;
        if (this.sprite.x < padding) this.sprite.x = padding;
        if (this.sprite.x > this.app.screen.width - padding) this.sprite.x = this.app.screen.width - padding;
    }

    setSitting(val) {
        if (this.isJumping) return;
        this.isSitting = val;
    }

    update(delta) {
        // Apply gravity
        if (this.isJumping || this.sprite.y < this.groundY) {
            this.velocity += this.gravity * delta;
            this.sprite.y += this.velocity * delta;
        }

        // Land on ground
        if (this.sprite.y >= this.groundY) {
            if (this.isJumping) {
                // Land impact squash
                this.sprite.scale.y = 0.2;
                this.sprite.scale.x = 0.4;
            }
            this.sprite.y = this.groundY;
            this.velocity = 0;
            this.isJumping = false;
            this.jumpCount = 0;
        }

        // Sitting logic (Visual change)
        if (this.isSitting) {
            this.sprite.scale.set(0.3, 0.15); // Flatten
            this.sprite.y = this.groundY;
        } else if (!this.isJumping) {
            // Run animation (Ground only)
            this.animationTime += 0.2 * delta;

            // Bobbing
            const bob = Math.sin(this.animationTime) * 5;
            this.sprite.y = this.groundY + bob;

            // Rhythmic Squash & Stretch
            const stretch = Math.sin(this.animationTime * 2) * 0.02;
            const targetScaleX = 0.3 + stretch;
            const targetScaleY = 0.3 - stretch;

            this.sprite.scale.x += (targetScaleX - this.sprite.scale.x) * 0.2 * delta;
            this.sprite.scale.y += (targetScaleY - this.sprite.scale.y) * 0.2 * delta;
        } else {
            // Smoothly return to original scale or apply jumping stretch
            const targetScaleX = 0.3;
            const targetScaleY = 0.3;
            this.sprite.scale.x += (targetScaleX - this.sprite.scale.x) * 0.2 * delta;
            this.sprite.scale.y += (targetScaleY - this.sprite.scale.y) * 0.2 * delta;

            // Stretch while jumping/falling
            this.sprite.scale.y = 0.3 + Math.abs(this.velocity) * 0.01;
            this.sprite.scale.x = 0.3 - Math.abs(this.velocity) * 0.005;
        }
    }

    getBounds() {
        const bounds = this.sprite.getBounds();
        const sittingShrink = this.isSitting ? 0.5 : 1.0;
        return {
            x: bounds.x + bounds.width * 0.15,
            y: bounds.y + bounds.height * (1 - 0.85 * sittingShrink),
            width: bounds.width * 0.7,
            height: bounds.height * 0.85 * sittingShrink
        };
    }
}
