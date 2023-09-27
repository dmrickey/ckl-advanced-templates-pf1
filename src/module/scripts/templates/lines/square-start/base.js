import { AbilityTemplateAdvanced } from "../../ability-template";
import { ifDebug } from '../../../utils';
export class LineTargetFromSquareCenterBase extends AbilityTemplateAdvanced {
    _gridSquare;

    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

        super.clearTargetIfEnabled();

        const targetConfig = {
            drawIcon: false,
            drawOutline: false,
        };

        const updateTemplateRotation = async (crosshairs) => {
            while (crosshairs.inFlight) {
                await warpgate.wait(100);

                let direction, x, y;
                const ray = new Ray(this._gridSquare.center, crosshairs);
                direction = Math.toDegrees(ray.angle);

                this.document.direction = Math.normalizeDegrees(direction);
                this.refresh();

                super.targetIfEnabled();
            }

            canvas.app.view.onwheel = null;
        };

        const followCrosshairs = await warpgate.crosshairs.show(
            targetConfig,
            {
                show: updateTemplateRotation
            }
        );

        if (followCrosshairs.cancelled) {
            super.clearTargetIfEnabled();

            super.clearTempate();
            if (await this.initializePlacement()) {
                return await this.commitPreview();
            }

            return false;
        }

        return true;
    }

    /** @override */
    _gridInterval() { return canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE ? -1 : 0; }

    /**
     * @virtual
     * @return {Promise<Boolean>}
     */
    async initializeLineData(square) {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

        this._gridSquare = square;

        const { x, y } = square.center;
        this.document.x = x;
        this.document.y = y;

        return true;
    }
}
