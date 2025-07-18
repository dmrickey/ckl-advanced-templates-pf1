import { CircleGridIntersection } from "./grid";

export class CircleSplash extends CircleGridIntersection {
    /** @override */
    _crosshairsOverride(crosshairs) {
        const boundsContains = (bounds, point) =>
            bounds.left <= point.x
            && point.x <= bounds.right
            && bounds.top <= point.y
            && point.y <= bounds.bottom;
        const found = !!canvas.tokens.placeables.map(x => x.bounds).find(b => boundsContains(b, canvas.mousePosition));
        crosshairs.interval = found ? CONST.GRID_SNAPPING_MODES.CENTER : CONST.GRID_SNAPPING_MODES.VERTEX;
    }
}
