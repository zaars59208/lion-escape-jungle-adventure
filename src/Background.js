import * as PIXI from 'pixi.js';

export class Background {
    constructor(app) {
        this.app = app;
        this.layers = [];
        this.scrollSpeed = 2;

        const texture = PIXI.Assets.get('background');

        // Main background layers (parallax/tile)
        for (let i = 0; i < 2; i++) {
            const sprite = new PIXI.Sprite(texture);
            sprite.width = app.screen.width;
            sprite.height = app.screen.height;
            sprite.x = i * sprite.width;
            app.stage.addChild(sprite);
            this.layers.push(sprite);
        }

    }

    update(delta) {
        // Scroll background
        this.layers.forEach(sprite => {
            sprite.x -= this.scrollSpeed * delta;
            if (sprite.x <= -sprite.width) {
                sprite.x += sprite.width * 2;
            }
        });

    }
}
