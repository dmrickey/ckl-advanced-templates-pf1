import { AbilityTemplateCircleGrid } from "./grid";

export class AbilityTemplateCircleSplash extends AbilityTemplateCircleGrid {
    /** @override */
    _crosshairsOverride(crosshairs) {
        const boundsContains = (bounds, point) =>
            bounds.left <= point.x
            && point.x <= bounds.right
            && bounds.top <= point.y
            && point.y <= bounds.bottom;
        const found = !!canvas.tokens.placeables.map(x => x.bounds).find(b => boundsContains(b, canvas.mousePosition));
        crosshairs.interval = canvas.scene.grid.type !== CONST.GRID_TYPES.SQUARE ? 0 : found ? -1 : 1;
    }
}
