import { AbilityTemplateAdvanced } from "../../ability-template";
import { ifDebug } from '../../../utils';
export class LineTargetFromSquareCenterBase extends AbilityTemplateAdvanced {
    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

        super.clearTargetIfEnabled();

        const gridSquare = await this.getSourceGridSquare();
        if (!gridSquare) {
            return false;
        }

        const updateTemplateRotation = async (crosshairs) => {
            while (crosshairs.inFlight) {
                await warpgate.wait(100);

                let direction, x, y;
                const ray = new Ray(gridSquare.center, crosshairs);
                direction = Math.toDegrees(ray.angle);

                this.document.direction = Math.normalizeDegrees(direction);
                this.refresh();

                super.targetIfEnabled();
            }

            canvas.app.view.onwheel = null;
        };

        const followCrosshairs = await warpgate.crosshairs.show(
            {
                drawIcon: false,
                drawOutline: false,
            },
            {
                show: updateTemplateRotation
            }
        );

        if (followCrosshairs.cancelled) {
            super.clearTargetIfEnabled();
            super.clearTempate();
            return await this.commitPreview();
        }

        return true;
    }

    /** @override */
    _gridInterval() { return canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE ? -1 : 0; }

    /** @override */
    async initializePlacement() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));
        const { x, y } = this.token?.center ?? { x: 0, y: 0 };
        this.document.x = x;
        this.document.y = y;
        return true;
    }

    /**
     * @abstract
     * @returns {GridSquare | null | undefined}
     */
    async getSourceGridSquare() { }
}
