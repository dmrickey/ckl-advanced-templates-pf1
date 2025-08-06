import { ANGLE_ORIGIN, PLACEMENT_TYPE } from '../../../consts';
import { GridSquare } from '../../models/grid-square';
import { AbilityTemplateAdvanced } from '../ability-template';

export class LineFromSelf extends AbilityTemplateAdvanced {

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
    async initializeVariables() {
        this._isSelectingOrigin = !this.token;
        this._gridSquare = GridSquare.fromToken(this.token);
        return super.initializeVariables();
    }

    get selectOriginText() { return localize('lineStart'); }
}
