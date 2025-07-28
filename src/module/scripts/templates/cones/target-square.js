import HintHandler from '../../../view/hint-handler';
import { ifDebug, localize } from '../../utils';
import { AbilityTemplateFollowMouseAngleCone } from './follow-mouse-angle-base';

export class ConeFromTargetSquare extends AbilityTemplateFollowMouseAngleCone {
    /** @override */
    async initializeVariables() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializeVariables.name}`));

        HintHandler.show({ title: localize('cone'), hint: localize('hints.chooseStart') });

        const config = {
            borderAlpha: 0,
            icon: { texture: this.iconImg },
            label: { text: localize('coneStart') },
            snap: { position: this._snapMode },
        }
        const crosshairs = await Sequencer.Crosshair.show(config);

        if (!crosshairs) {
            return false;
        }
        const size = canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE ? 1 : 0;

        HintHandler.show({ title: localize('cone'), hint: localize('hints.restart') });
        return await super.initializeConeData({ x: crosshairs.x, y: crosshairs.y }, size, size);
    }

    /**
     * @override
     */
    get canRestart() { return true; }
}
