import { ROTATION_TYPE } from '../../../consts';
import { AbilityTemplateAdvanced } from "../ability-template";

export class LineSystem extends AbilityTemplateAdvanced {

    /** @override */
    get _snapMode() {
        return CONST.GRID_SNAPPING_MODES.CENTER
            | CONST.GRID_SNAPPING_MODES.VERTEX
            | CONST.GRID_SNAPPING_MODES.EDGE_MIDPOINT;
    }

    /** @override */
    async handleRangeAndTargeting() {
        await this.targetIfEnabled()
    }

    get _rotationType() { return ROTATION_TYPE.SYSTEM; }
}
