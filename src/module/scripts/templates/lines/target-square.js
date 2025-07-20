import { ifDebug, localize } from '../../utils';
import { LineFromTargetBase } from './base';

export class LineFromSquare extends LineFromTargetBase {
    /** @override */
    async getSourcePoint() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.getSourcePoint.name}`));

        this._setPreviewVisibility(false);
        super.clearTempate();

        const show = async (crosshairs) => {
            super.setCenter = crosshairs.center;
        }

        const config = {
            borderAlpha: 0,
            icon: { borderVisible: false },
            snap: { position: this._gridInterval() },
            label: { text: localize('lineStart') },
        }
        const crosshairs = await Sequencer.Crosshair.show(
            config,
            {
                [Sequencer.Crosshair.CALLBACKS.MOUSE_MOVE]: async (crosshair) => {
                    await show(crosshair);
                }
            },
        );
        console.log(crosshairs);

        if (!crosshairs) {
            return false;
        }

        this._setPreviewVisibility(true);

        return crosshairs;
    }
}
