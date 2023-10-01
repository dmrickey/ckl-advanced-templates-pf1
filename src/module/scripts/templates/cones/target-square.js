import HintHandler from '../../../view/hint-handler';
import { ifDebug, localize } from '../../utils';
import { AbilityTemplateFollowMouseAngleCone } from './follow-mouse-angle-base';

export class ConeFromTargetSquare extends AbilityTemplateFollowMouseAngleCone {
    /** @override */
    async initializeVariables() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializeVariables.name}`));

        const sourceConfig = {
            drawIcon: true,
            drawOutline: false,
            interval: this._gridInterval(),
            label: localize('coneStart'),
            icon: this.iconImg,
        };

        HintHandler.show({ title: localize('cone'), hint: localize('hints.chooseStart') });
        const source = await warpgate.crosshairs.show(sourceConfig);
        if (source.cancelled) {
            return false;
        }
        const size = canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE ? 1 : 0;

        HintHandler.show({ title: localize('cone'), hint: localize('hints.restart') });
        return await super.initializeConeData({ x: source.x, y: source.y }, size, size);
    }

    /**
     * @override
     */
    get canRestart() { return true; }
}
