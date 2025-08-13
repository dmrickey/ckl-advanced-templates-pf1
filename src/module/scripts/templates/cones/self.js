import { ANGLE_ORIGIN, ANGLE_POINTS, PLACEMENT_TYPE } from '../../../consts';
import { Settings } from '../../../settings';
import { GridSquare } from '../../models/grid-square';
import { AbilityTemplateAdvanced } from '../ability-template';

export class ConeFromSelf extends AbilityTemplateAdvanced {

    get #is15() { return this.document?.distance === 15 };

    /** @override */
    get _snapMode() {
        return this._isSelectingOrigin
            ? CONST.GRID_SNAPPING_MODES.VERTEX
            : 0;
    }

    /** @override */
    get placementType() {
        return (this.token || !this._isSelectingOrigin)
            ? PLACEMENT_TYPE.SET_ANGLE
            : PLACEMENT_TYPE.SET_XY;
    }

    /** @override */
    get angleOrigin() { return this.token ? ANGLE_ORIGIN.TOKEN : ANGLE_ORIGIN.CURRENT; }

    /** @override */
    initializeVariables() {
        this._isSelectingOrigin = !this.token;
        this._gridSquare = GridSquare.fromToken(this.token);
        this.document.angle = 90;
        return super.initializeVariables();
    }

    /** @override */
    get angleStartPoints() {
        return this.#is15
            ? Settings.cone15Alternate ? ANGLE_POINTS.CONE_15_ALTERNATE : ANGLE_POINTS.CONE_15_TRADITIONAL
            : Settings.coneAlternate ? ANGLE_POINTS.CONE_FROM_MIDPOINT_AND_VERTEX : ANGLE_POINTS.VERTEX;
    }
}
