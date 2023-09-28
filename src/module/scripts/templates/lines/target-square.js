import { GridSquare } from '../../models/grid-square';
import { ifDebug, localize } from '../../utils';
import { LineFromTargetBase } from './base';

export class LineFromSquare extends LineFromTargetBase {
    /** @override */
    async getSourceGridSquare() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.getSourceGridSquare.name}`));

        this._setPreviewVisibility(false);
        super.clearTempate();

        const sourceConfig = {
            drawIcon: false,
            drawOutline: false,
            interval: this._gridInterval(),
            label: localize('lineStart'),
        };

        const show = async (crosshairs) => {
            while (crosshairs.inFlight) {
                await warpgate.wait(100);
                this.document.x = crosshairs.center.x;
                this.document.y = crosshairs.center.y;
                this.refresh();
            }
        }
        const source = await warpgate.crosshairs.show(sourceConfig, { show });
        if (source.cancelled) {
            return false;
        }

        this._setPreviewVisibility(true);

        const size = canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE ? 1 : 0;

        const square = GridSquare.fromCenter(source, size, size);
        this.document.x = square.center.x;
        this.document.y = square.center.y;
        return square;
    }
}
