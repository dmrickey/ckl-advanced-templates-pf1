import { ANGLE_POINTS, FOLLOW_FROM, PLACEMENT_TYPE } from '../../../consts';
import { Settings } from '../../../settings';
import { AbilityTemplateAdvanced } from '../ability-template';

export class ConeFromSelf extends AbilityTemplateAdvanced {

    get #is15() { return this.document?.distance === 15 };

    /** @override */
    get _snapMode() { return this._isSelectingOrigin ? CONST.GRID_SNAPPING_MODES.VERTEX : 0; }

    /** @override */
    get placementType() {
        return (this.token || !_isSelectingOrigin)
            ? PLACEMENT_TYPE.SET_ANGLE
            : PLACEMENT_TYPE.SET_XY;
    }

    /** @override */
    get followFrom() { return this.token ? FOLLOW_FROM.TOKEN : FOLLOW_FROM.CURRENT; }

    /** @override */
    async initializeVariables() {
        this._isSelectingOrigin = !this.token;
        this.document.angle = 90;
        return super.initializeVariables();
    }

    /** @override */
    get angleStartPoints() {
        return this.#is15
            ? Settings.cone15Alternate ? ANGLE_POINTS.CONE_15_ALTERNATE : ANGLE_POINTS.CONE_15_TRADITIONAL
            : Settings.coneAlternate ? ANGLE_POINTS.CONE_FROM_MIDPOINT_AND_VERTEX : ANGLE_POINTS.VERTEX;
    }

    // /** @override */
    // async initializeVariables() {
    //     ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializeVariables.name}`));

    //     const token = this.token;
    //     const width = Math.max(Math.round(token.document.width), 1);
    //     const height = Math.max(Math.round(token.document.height), 1);
    //     return await super.initializeConeData(token.center, width, height);
    // }
}
