import { AbilityTemplateAdvanced } from "../ability-template";

export class CircleGridIntersection extends AbilityTemplateAdvanced {
    /** @override */
    get _snapMode() { return CONST.GRID_SNAPPING_MODES.VERTEX; }
}
