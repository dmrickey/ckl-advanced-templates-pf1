import HintHandler from "../../../view/hint-handler";
import { ifDebug, localize } from '../../utils';
import { AbilityTemplateAdvanced } from "../ability-template";

export class LineSystem extends AbilityTemplateAdvanced {
    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

        super.clearTargetIfEnabled();

        let onWheel = false;
        this.document.angle = 90;

        const delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;

        HintHandler.show({ title: localize('rotation'), hint: localize('hints.mouseWheelRotate') });
        const updatePosition = async (crosshairs) => {
            const x = crosshairs.x + 1;
            const y = crosshairs.y + 1;
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

                    const snap = event.shiftKey ? delta : 5;
                    this.document.direction = this.document.direction + snap * Math.sign(event.deltaY);
                    this.refresh();
                };
            }

            this.document.x = x;
            this.document.y = y;
            this.refresh();

            await super.targetIfEnabled();
        };

        const config = {
            borderAlpha: 0,
            icon: { borderVisible: false },
            snap: { position: CONST.GRID_SNAPPING_MODES.VERTEX | CONST.GRID_SNAPPING_MODES.CENTER | CONST.GRID_SNAPPING_MODES.EDGE_MIDPOINT },
            fillAlpha: 0,
        }
        const crosshairs = await Sequencer.Crosshair.show(
            config,
            {
                [Sequencer.Crosshair.CALLBACKS.MOUSE_MOVE]: async (crosshair) => {
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
