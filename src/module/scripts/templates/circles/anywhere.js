import { AbilityTemplateCircleGrid } from "./grid";

export class AbilityTemplateCircleAnywhere extends AbilityTemplateCircleGrid {
    /** @override */
    _gridInterval() { return canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE ? 2 : 0; }
}
