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

        const tokenContains = (x, y) => new PIXI.Rectangle(tokenSquare.x, tokenSquare.y, tokenSquare.w, tokenSquare.h).contains(x, y);

        const updateTemplateLocation = async (crosshairs) => {
            while (crosshairs.inFlight) {
                await warpgate.wait(20);

                this.document.flags[MODULE_NAME].icon = existingIcon;

                const centerX = crosshairs.x;
                const centerY = crosshairs.y;
                const templateX = centerX - this.offset;
                const templateY = centerY - this.offset;
                if (this.document.x === templateX && this.document.y === templateY) {
                    continue;
                }

                if ((this.hasMaxRange || this.hasMinRange) && !this.document.flags[MODULE_NAME].ignoreRange) {
                    const rays = tokenSquare.gridPoints.map((spot) => ({
                        ray: new Ray(spot, crosshairs),
                    }));
                    const distances = rays.map((ray) => canvas.grid.measureDistances([ray], { gridSpaces: true })[0]);
                    let range = Math.min(...distances);
                    range = !!(range % 1)
                        ? range.toFixed(1)
                        : range;
                    const isInToken = tokenContains(centerX, centerY);
                    if (isInToken) {
                        range = 0;
                    }

                    isInRange = !(this.hasMinRange && range < this.minRange
                        || this.hasMaxRange && range > this.maxRange);
                    this._setPreviewVisibility(isInRange);
                    this._setErrorIconVisibility(isInRange);

                    const unit = game.settings.get('pf1', 'units') === 'imperial'
                        ? localizeFull('PF1.DistFtShort')
                        : localizeFull('PF1.DistMShort');
                    crosshairs.label = localize('range', { range, unit });
                    if (!isInRange) {
                        crosshairs.label += '\n' + localize('errors.outOfRange');
                    }
                }

                this.document.x = templateX;
                this.document.y = templateY;
                this.refresh();

                super.targetIfEnabled();
            }
        };

        const targetConfig = {
            drawIcon: false,
            drawOutline: false,
            interval: this._gridInterval(),
        };
        const crosshairs = await warpgate.crosshairs.show(
            targetConfig,
            {
                show: updateTemplateLocation
            }
        );

        if (crosshairs.cancelled || !isInRange) {
            if (!isInRange && !crosshairs.cancelled) {
                const message = localize('errors.outOfRange');
                ui.notifications.error(message);
            }
            super.clearTargetIfEnabled();
            return false;
        }

        return true;
    }

    /** @override */
    _gridInterval() {
        const interval = super._gridInterval();
        if (interval === 0) {
            return interval;
        }

        return super.baseDistance % 2 ? -1 : 1;
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
