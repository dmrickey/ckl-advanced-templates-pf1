import { CircleGridIntersection } from "./grid";

export class CircleAnywhere extends CircleGridIntersection {
    /** @override */
    _gridInterval() { return canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE ? 2 : 0; }
}
