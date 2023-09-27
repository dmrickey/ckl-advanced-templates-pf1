import { MODULE_NAME } from '../../../../consts';
import { ifDebug, localize } from '../../../utils';
import { LineTargetFromSquareCenterBase } from './base';

export class LineFromSquareCenterTarget extends LineTargetFromSquareCenterBase {
    /** @override */
    async initializePlacement() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

        const sourceConfig = {
            drawIcon: true,
            drawOutline: false,
            interval: this._gridInterval(),
            label: localize('lineStart'),
            icon: this.document.flags?.[MODULE_NAME]?.icon || 'systems/pf1/icons/misc/magic-swirl.png',
        };

        const source = await warpgate.crosshairs.show(sourceConfig);
        if (source.cancelled) {
            return false;
        }
        const size = canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE ? 1 : 0;

        return await super.initializeLineData({ x: source.x, y: source.y }, size, size);
    }

    /**
     * @override
     */
    get canRestart() { return true; }
}
