import { AbilityTemplateAdvanced } from "../ability-template";
import { ifDebug } from '../../utils';
import { Settings } from "../../../settings";

export class AbilityTemplateConeSystem extends AbilityTemplateAdvanced {
    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

        super.clearTargetIfEnabled();

        const targetConfig = {
            drawIcon: false,
            drawOutline: false,
        };

        let offsetAngle = 0;

        this.document.angle = 90;
        let currentOffsetAngle = 0;
        const updatePosition = async (crosshairs) => {

            canvas.app.view.onwheel = (event) => {
                // Avoid zooming the browser window
                if (event.ctrlKey) {
                    event.preventDefault();
                }
                event.stopPropagation();

                offsetAngle += 45 * Math.sign(event.deltaY);
            };

            while (crosshairs.inFlight) {
                await warpgate.wait(100);

                const { x, y } = crosshairs;
                if (currentOffsetAngle === offsetAngle && x === this.document.x && y === this.document.y) {
                    continue;
                }

                currentOffsetAngle = offsetAngle;

                // this.document.direction += offsetAngle;
                this.document.direction = this.document.direction + offsetAngle;
                this.document.x = crosshairs.x;
                this.document.y = crosshairs.y;
                this.refresh();

                super.targetIfEnabled();
            }

            canvas.app.view.onwheel = null;
        };

        const coneCrosshairs = await warpgate.crosshairs.show(
            targetConfig,
            {
                show: updatePosition
            }
        );

        if (coneCrosshairs.cancelled) {
            super.clearTargetIfEnabled();
            return false;
        }

        return true;
    }
}
