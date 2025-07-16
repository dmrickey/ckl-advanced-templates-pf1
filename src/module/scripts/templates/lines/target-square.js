import { ifDebug, localize } from '../../utils';
import { wait } from '../../utils/wait';
import { LineFromTargetBase } from './base';

export class LineFromSquare extends LineFromTargetBase {
    /** @override */
    async getSourcePoint() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.getSourcePoint.name}`));

        this._setPreviewVisibility(false);
        super.clearTempate();

        const show = async (crosshairs) => {
            await wait(100);
            super.setCenter = crosshairs.center;
        }

        // const sourceConfig = {
        //     drawIcon: false,
        //     drawOutline: false,
        //     interval: this._gridInterval(),
        //     label: localize('lineStart'),
        // };
        // const source = await xhairs.show(sourceConfig, { show });

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
                    console.log(crosshair)
                    await show(crosshair);
                }
            },
        );
        console.log(crosshairs);

        if (source.cancelled) {
            return false;
        }

        this._setPreviewVisibility(true);

        return source;
    }
}
