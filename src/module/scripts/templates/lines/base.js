import { AbilityTemplateAdvanced } from "../ability-template";
import { ifDebug } from '../../utils';
export class LineFromTargetBase extends AbilityTemplateAdvanced {
    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

        super.clearTargetIfEnabled();

        const gridPoint = await this.getSourcePoint();
        if (!gridPoint) {
            return false;
        }
        super.setCenter = gridPoint;

        const updateTemplateRotation = async (crosshairs) => {
            while (crosshairs.inFlight) {
                await warpgate.wait(100);

                const ray = new Ray(gridPoint, crosshairs);
                const direction = Math.toDegrees(ray.angle);

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
                interval: 0,
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
    _gridInterval() { return canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE ? 1 : 0; }

    /** @override */
    async initializeVariables() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializeVariables.name}`));
        const center = this.token?.center ?? { x: 0, y: 0 };
        super.setCenter = center;
        return true;
    }

    /**
     * @abstract
     * @returns {Promise<{x: number, y: number, direction?: number} | null | undefined | false>}
     */
    async getSourcePoint() { }
}
