

// /**
//  * ORIGINAL
//  * Calculate the original template shape from base Foundry.
//  * Implemented by subclass.
//  * @param {object} [opts]     Optional values to temporarily override the ones in this instance.
//  * @param {number;pixels} [opts.distance]   Radius
//  * @returns {PIXI.Circle}
//  */
// function calculateOriginalShape({ distance } = {}) {
//     // Convert to degrees and grid units for Foundry method.
//     distance ??= this.distance;
//     distance = distance / canvas.dimensions.distancePixels;
//     return CONFIG.MeasuredTemplate.objectClass.getCircleShape(distance);
// }

/**
 * Calculate the original template shape from base Foundry.
 * Implemented by subclass.
 * @param {object} [opts]     Optional values to temporarily override the ones in this instance.
 * @param {number;pixels} [opts.distance]   Radius
 * @returns {PIXI.Circle}
 */
function calculateOriginalShape({ distance } = {}) {
    // Convert to degrees and grid units for Foundry method.
    distance ??= this.distance;
    distance /= canvas.dimensions.distancePixels;
    if (this.template.shouldOverrideTokenEmanation) {
        return this.template._getEmanationShape(distance);
    }

    return CONFIG.MeasuredTemplate.objectClass.getCircleShape(distance);
}

// /**
//  * ORIGINAL
//  * Keeping the origin in the same place, pad the shape by adding (or subtracting) to it
//  * in a border all around it, including the origin (for cones, rays, rectangles).
//  * Implemented by subclass.
//  * @param {number; pixels} [padding]    Optional padding value, if not using the one for this instance.
//  * @returns {PIXI.Circle}
//  */
// function calculatePaddedShape(padding) {
//     padding ??= this.options.padding;
//     return this.calculateOriginalShape({ distance: this.distance + padding });
// }

export const patchWalledTemplates = () => {
    Hooks.on('walledtemplatesReady', () => {
        const api = game.modules.get('walledtemplates').api;
        api.WalledTemplateCircle.prototype.calculateOriginalShape = calculateOriginalShape;
        // api.WalledTemplateCircle.prototype.calculatePaddedShape = calculatePaddedShape;
    });
};