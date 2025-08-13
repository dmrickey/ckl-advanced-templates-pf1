import { PLACEMENT_TYPE } from '../../../consts';
import { LineFromSelf } from './from-self';

export class LineFromSquare extends LineFromSelf {

    /** @override */
    get placementType() {
        return this._isSelectingOrigin
            ? PLACEMENT_TYPE.SET_XY
            : PLACEMENT_TYPE.SET_ANGLE;
    }
}
