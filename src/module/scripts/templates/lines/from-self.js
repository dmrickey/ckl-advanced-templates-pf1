import { ANGLE_ORIGIN, ANGLE_POINTS, PLACEMENT_TYPE } from '../../../consts';
import { GridSquare } from '../../models/grid-square';
import { localize } from '../../utils';
import { AbilityTemplateAdvanced } from '../ability-template';

export class LineFromSelf extends AbilityTemplateAdvanced {

    /** @override */
    get _snapMode() {
        return this._isSelectingOrigin
            ? CONST.GRID_SNAPPING_MODES.VERTEX
            : 0;
    }

    /** @override */
    get angleStartPoints() { return ANGLE_POINTS.VERTEX; }

    /** @override */
    get placementType() {
        return (this.token && this._isSelectingOrigin)
            ? PLACEMENT_TYPE.SET_XY_FROM_TOKEN
            : this._isSelectingOrigin
                ? PLACEMENT_TYPE.SET_XY
                : PLACEMENT_TYPE.SET_ANGLE;
    }

    /** @override */
    get angleOrigin() { return ANGLE_ORIGIN.CURRENT; }

    /** @override */
    initializeVariables() {
        this._isSelectingOrigin = true;
        if (this.token) {
            this._gridSquare = GridSquare.fromToken(this.token);
        }
        return super.initializeVariables();
    }

    get selectOriginText() { return localize('lineStart'); }

    /** @override */
    _followAngle({ x, y }) {
        const ray = new Ray(this.center, { x, y });
        const degrees = Math.toDegrees(ray.angle);
        this.document.direction = degrees;

        // const xOffset = degrees < 90 || degrees >= 270 ? 1 : -1;
        // const yOffset = degrees > 0 && degrees <= 180 ? 1 : -1;

        // this.template.x = this.document.x + xOffset;
        // this.template.y = this.document.y + yOffset;
    }
    // todo hex and gridless
}
