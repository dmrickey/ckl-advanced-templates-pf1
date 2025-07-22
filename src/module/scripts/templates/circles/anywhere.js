import { CircleGridIntersection } from "./grid";

export class CircleAnywhere extends CircleGridIntersection {
    /** @override */
    _gridInterval() { return CONST.GRID_SNAPPING_MODES.VERTEX | CONST.GRID_SNAPPING_MODES.CENTER | CONST.GRID_SNAPPING_MODES.EDGE_MIDPOINT; }
}
