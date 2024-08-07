import { AbilityTemplateAdvanced } from "../ability-template";
import { ifDebug } from '../../utils';
import { wait } from '../../utils/wait';
import { xhairs } from '../../utils/crosshairs';

export class ConeSystem extends AbilityTemplateAdvanced {
    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

        super.clearTargetIfEnabled();

        const targetConfig = {
            drawIcon: false,
            drawOutline: false,
        };

        this.document.angle = 90;
        const updatePosition = async (crosshairs) => {

            let newDirection = 0;
            canvas.app.view.onwheel = (event) => {
                // Avoid rotation while zooming the browser window
                if (event.ctrlKey) {
                    event.preventDefault();
                }
                event.stopPropagation();

                newDirection = this.document.direction + 45 * Math.sign(event.deltaY);
            };

            while (crosshairs.inFlight) {
                await wait(100);

                const { x, y } = crosshairs;
                if (this.document.direction === newDirection && x === this.document.x && y === this.document.y) {
                    continue;
                }

                this.document.direction = newDirection;
                this.document.x = crosshairs.x;
                this.document.y = crosshairs.y;
                this.refresh();

                await super.targetIfEnabled();
            }

            canvas.app.view.onwheel = null;
        };

        const coneCrosshairs = await xhairs.show(
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
