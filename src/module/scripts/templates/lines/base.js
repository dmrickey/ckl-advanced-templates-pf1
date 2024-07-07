import { AbilityTemplateAdvanced } from "../ability-template";
import { ifDebug, localize } from '../../utils';
import HintHandler from "../../../view/hint-handler";
import { wait } from '../../utils/wait';
import { xhairs } from '../../utils/crosshairs';

export class LineFromTargetBase extends AbilityTemplateAdvanced {
    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

        super.clearTargetIfEnabled();

        HintHandler.show({ title: localize('line'), hint: localize('hints.chooseStart') });
        const gridPoint = await this.getSourcePoint();
        if (!gridPoint) {
            return false;
        }
        super.setCenter = gridPoint;

        const updateTemplateRotation = async (crosshairs) => {
            while (crosshairs.inFlight) {
                await wait(100);

                const ray = new Ray(gridPoint, crosshairs);
                const direction = Math.toDegrees(ray.angle);

                this.document.direction = Math.normalizeDegrees(direction);
                this.refresh();

                await super.targetIfEnabled();
            }

            canvas.app.view.onwheel = null;
        };

        HintHandler.show({ title: localize('line'), hint: localize('hints.restart') });
        const followCrosshairs = await xhairs.show(
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
