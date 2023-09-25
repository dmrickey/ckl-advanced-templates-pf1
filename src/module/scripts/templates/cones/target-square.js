import { MODULE_NAME } from '../../../consts';
import { ifDebug, localize } from '../../utils';
import { AbilityTemplateFollowMouseAngleCone } from './follow-mouse-angle-base';

export class ConeFromTargetSquare extends AbilityTemplateFollowMouseAngleCone {
    /** @override */
    async initializePlacement(_itemPf) {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

        const sourceConfig = {
            drawIcon: true,
            drawOutline: false,
            interval: this._gridInterval(),
            label: localize('coneStart'),
            icon: this.document.flags?.[MODULE_NAME]?.icon || 'systems/pf1/icons/misc/magic-swirl.png',
        };

        const source = await warpgate.crosshairs.show(sourceConfig);
        if (source.cancelled) {
            return false;
        }
        const size = canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE ? 1 : 0;

        return await super.initializeConeData({ x: source.x, y: source.y }, size, size);
    }

    /**
     * @override
     */
    get canRestart() { return true; }
}
