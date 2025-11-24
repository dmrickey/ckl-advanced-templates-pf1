


/**
 * @this {PIXI.RoundedRectangle}
 */
function getBounds() {
    return new PIXI.Rectangle(this.x, this.y, this.width, this.height);
}

/**
 * @this {PIXI.RoundedRectangle}
 */
function translate(dx, dy) {
    return new PIXI.RoundedRectangle(this.x + dx, this.y + dy, this.width, this.height, this.radius);
}

translate
export const patchPixiRoundedRect = () => {
    if (!PIXI.RoundedRectangle.prototype.getBounds) {
        PIXI.RoundedRectangle.prototype.getBounds = getBounds;
    }
    if (!PIXI.RoundedRectangle.prototype.translate) {
        PIXI.RoundedRectangle.prototype.translate = translate;
    }
    // todo initial testing
    if (!PIXI.RoundedRectangle.prototype.intersectPolygon) {
        PIXI.RoundedRectangle.prototype.intersectPolygon = PIXI.Rectangle.prototype.intersectPolygon;
    }
}