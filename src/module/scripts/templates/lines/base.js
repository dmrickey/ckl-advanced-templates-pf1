import { AbilityTemplateAdvanced } from "../ability-template";
import { ifDebug } from '../../utils';
import HintHandler from "../../../view/hint-handler";
export class LineFromTargetBase extends AbilityTemplateAdvanced {
    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

        super.clearTargetIfEnabled();

        HintHandler.show({ title: 'Ray', hint: 'Left click to choose starting point.' });
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

        HintHandler.show({ title: 'Ray', hint: 'Right click to re-choose starting point. Left click to submit.' });
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
