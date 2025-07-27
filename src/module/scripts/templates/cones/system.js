import { ifDebug } from '../../utils';
import { AbilityTemplateAdvanced } from "../ability-template";

export class ConeSystem extends AbilityTemplateAdvanced {
    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

        super.clearTargetIfEnabled();

        let onWheel = false;

        this.document.angle = 90;
        const updatePosition = async (crosshairs) => {
            const { x, y } = crosshairs.center;
            if (x === this.document.x && y === this.document.y) {
                return;
            }

            if (!onWheel) {
                onwheel = true;
                canvas.app.view.onwheel = (event) => {
                    // Avoid rotation while zooming the browser window
                    if (event.ctrlKey) {
                        event.preventDefault();
                    }
                    event.stopPropagation();

                    this.document.direction = this.document.direction + 45 * Math.sign(event.deltaY);
                    this.refresh();
                };
            }

            this.document.x = crosshairs.x;
            this.document.y = crosshairs.y;
            this.refresh();

            await super.targetIfEnabled();
        };

        const config = {
            borderAlpha: 0,
            fillAlpha: 0,
            icon: { borderVisible: false },
        }
        const crosshairs = await Sequencer.Crosshair.show(
            config,
            {
                [Sequencer.Crosshair.CALLBACKS.MOUSE_MOVE]: async (crosshair) => {
                    console.log(crosshair)
                    await updatePosition(crosshair);
                }
            },
        );

        if (!crosshairs) {
            super.clearTargetIfEnabled();
            return false;
        }

        return true;
    }
}
