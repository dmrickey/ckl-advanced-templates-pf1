import { AbilityTemplateAdvanced } from "../ability-template";
import { ifDebug, localize, localizeFull } from '../../utils';
import { MODULE_NAME } from "../../../consts";
import { GridSquare } from "../../models/grid-square";

export class RectCentered extends AbilityTemplateAdvanced {
    get distance() { return this.document.distance; }
    set distance(value) { this.document.distance = value; }

    get direction() { return this.document.direction; }
    set direction(value) { this.document.direction = value; }

    get offset() { return this.document.flags?.[MODULE_NAME]?.offset ?? 0; }

    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));
        super.clearTargetIfEnabled();

        const existingIcon = this.controlIcon?.iconSrc;
        let isInRange = true;

        const tokenSquare = GridSquare.fromToken(this.token);

        const updateTemplateLocation = async (crosshairs) => {

            // leaving this here but I can't get the highlight to rotate properly
            // if (canvas.scene.grid.type === CONST.GRID_TYPES.GRIDLESS) {
            //     canvas.app.view.onwheel = (event) => {
            //         // Avoid rotation while zooming the browser window
            //         if (event.ctrlKey) {
            //             event.preventDefault();
            //         }
            //         event.stopPropagation();

            //         this.template.rotation += Math.toRadians(45) * Math.sign(event.deltaY);
            //         this.actualRotation = Math.normalizeRadians(this.template.rotation);
            //     };
            // }

            this.document.flags[MODULE_NAME].icon = existingIcon;

            const { x, y } = crosshairs.center;
            const templateX = x - this.offset;
            const templateY = y - this.offset;
            if (this.document.x === templateX && this.document.y === templateY) {
                return;
            }

            if ((this.hasMaxRange || this.hasMinRange) && !this.document.flags[MODULE_NAME].ignoreRange) {
                const distances = tokenSquare.gridPoints
                    .map((spot) => [spot, { x, y }])
                    .map((coords) => canvas.grid.measurePath(coords).distance);
                let range = Math.min(...distances);
                range = !!(range % 1)
                    ? range.toFixed(1)
                    : range;
                const isInToken = tokenSquare.contains(x, y);
                if (isInToken) {
                    range = 0;
                }

                isInRange = !(this.hasMinRange && range < this.minRange
                    || this.hasMaxRange && range > this.maxRange);
                this._setPreviewVisibility(isInRange);
                this._setErrorIconVisibility(isInRange);

                const unit = game.settings.get('pf1', 'units') === 'imperial'
                    ? localizeFull('PF1.Distance.ftShort')
                    : localizeFull('PF1.Distance.mShort');
                crosshairs.crosshair.label.text = localize('range', { range, unit });
                if (!isInRange) {
                    crosshairs.crosshair.label.text += '\n' + localize('errors.outOfRange');
                }
            }

            this.document.x = templateX;
            this.document.y = templateY;
            this.refresh();

            await super.targetIfEnabled();

            canvas.app.view.onwheel = null;
        };

        const config = {
            borderAlpha: 0,
            icon: { borderVisible: false },
            snap: { position: this._snapMode },
            label: { dy: 50 }
        }
        const crosshairs = await Sequencer.Crosshair.show(
            config,
            {
                [Sequencer.Crosshair.CALLBACKS.MOUSE_MOVE]: async (crosshair) => {
                    await updateTemplateLocation(crosshair);
                }
            },
        );

        if (!crosshairs || !isInRange) {
            if (!isInRange && !!crosshairs) {
                const message = localize('errors.outOfRange');
                ui.notifications.error(message);
            }
            super.clearTargetIfEnabled();
            return false;
        }

        return true;
    }

    /** @override */
    get _snapMode() {
        return (super.baseDistance % 2 && !(canvas.grid.distance % 2))
            ? CONST.GRID_SNAPPING_MODES.CENTER
            : CONST.GRID_SNAPPING_MODES.VERTEX;
    }

    /** @override */
    async initializeVariables() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializeVariables.name}`));

        const d = this.distance;
        const squares = d / canvas.scene.grid.distance;
        const offset = squares * canvas.scene.grid.size / 2;

        this.document.flags[MODULE_NAME].offset = offset;

        this.distance = Math.sqrt(Math.pow(d, 2) + Math.pow(d, 2));
        this.direction = 45;

        const { x, y } = canvas.mousePosition;
        this.document.x = x - offset;
        this.document.y = y - offset;
        return true;
    }
}
