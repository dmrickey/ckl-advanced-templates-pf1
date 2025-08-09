import { ANGLE_POINTS, ANGLE_ORIGIN, PLACEMENT_TYPE } from '../../../consts';
import { Settings } from '../../../settings';
import { localize } from '../../utils';
import { AbilityTemplateAdvanced } from '../ability-template';

export class ConeFromTargetSquare extends AbilityTemplateAdvanced {

    get #is15() { return this.document?.distance === 15 };

    /** @override */
    get _snapMode() {
        if (!this._isSelectingOrigin) return 0;
        return CONST.GRID_SNAPPING_MODES.VERTEX;
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
    initializeVariables() {
        this._isSelectingOrigin = true;
        this.document.angle = 90;
        return super.initializeVariables();
    }

    /** @override */
    get angleStartPoints() {
        return this.#is15
            ? Settings.cone15Alternate ? ANGLE_POINTS.CONE_15_ALTERNATE : ANGLE_POINTS.CONE_15_TRADITIONAL
            : Settings.coneAlternate ? ANGLE_POINTS.CONE_FROM_MIDPOINT_AND_VERTEX : ANGLE_POINTS.VERTEX;
    }

    get selectOriginText() { return localize('coneStart'); }
}
