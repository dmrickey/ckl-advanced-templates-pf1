import { ifDebug, localize } from '../../utils';
import { LineFromTargetBase } from './base';

export class LineFromSquare extends LineFromTargetBase {
    /** @override */
    async getSourcePoint() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.getSourcePoint.name}`));

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
                super.setCenter = crosshairs.center;
            }
        }
        const source = await warpgate.crosshairs.show(sourceConfig, { show });
        if (source.cancelled) {
            return false;
        }

        this._setPreviewVisibility(true);

        return source;
    }
}
