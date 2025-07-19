import { AbilityTemplateAdvanced } from "../ability-template";
import { ifDebug, localize } from '../../utils';
import HintHandler from "../../../view/hint-handler";

export class LineFromTargetBase extends AbilityTemplateAdvanced {
    /** @override */
    set setCenter({ x, y }) {
        const { direction } = this.document;
        const xoffset = direction <= 90 || direction >= 270 ? 1 : -1;
        const yoffset = direction <= 180 ? 1 : -1;

        this.document.x = x + xoffset;
        this.document.y = y + yoffset;
        this.refresh();
    }

    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

        super.clearTargetIfEnabled();

        HintHandler.show({ title: localize('line'), hint: localize('hints.chooseStart') });
        const gridPoint = await this.getSourcePoint();
        if (!gridPoint) {
            return false;
        }
        this.setCenter = gridPoint;

        const updateTemplateRotation = async (crosshairs) => {

            const ray = new Ray(gridPoint, crosshairs);
            const direction = Math.toDegrees(ray.angle);

            this.document.direction = Math.normalizeDegrees(direction);
            this.setCenter = gridPoint;

            this.refresh();

            await super.targetIfEnabled();

            canvas.app.view.onwheel = null;
        };

        HintHandler.show({ title: localize('line'), hint: localize('hints.restart') });
        const config = {
            borderAlpha: 0,
            icon: { borderVisible: false },
            snap: { resolution: canvas.grid.size },
        }
        const followCrosshairs = await Sequencer.Crosshair.show(
            config,
            {
                [Sequencer.Crosshair.CALLBACKS.MOUSE_MOVE]: async (crosshair) => {
                    await updateTemplateRotation(crosshair);
                }
            },
        );

        if (!followCrosshairs) {
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
        this.setCenter = center;
        return true;
    }

    /**
     * @abstract
     * @returns {Promise<{x: number, y: number, direction?: number} | null | undefined | false>}
     */
    async getSourcePoint() { }
}
