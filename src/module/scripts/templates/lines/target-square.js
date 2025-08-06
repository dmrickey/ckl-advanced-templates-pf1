import { ANGLE_ORIGIN, ANGLE_POINTS, PLACEMENT_TYPE } from '../../../consts';
import { localize } from '../../utils';
import { AbilityTemplateAdvanced } from '../ability-template';

export class LineFromSquare extends AbilityTemplateAdvanced {

    /** @override */
    get _snapMode() {
        return this._isSelectingOrigin
            ? CONST.GRID_SNAPPING_MODES.VERTEX
            : 0;
    }

    /** @override */
    get placementType() {
        return this._isSelectingOrigin
            ? PLACEMENT_TYPE.SET_XY
            : PLACEMENT_TYPE.SET_ANGLE;
    }

    /** @override */
    get angleOrigin() { return ANGLE_ORIGIN.CURRENT; }

    /** @override */
    async initializeVariables() {
        this._isSelectingOrigin = true;
        return super.initializeVariables();
    }

    /** @override */
    get angleStartPoints() {
        return ANGLE_POINTS.VERTEX;
    }

    get selectOriginText() { return localize('coneStart'); }
}
