import { AbilityTemplateAdvanced } from "../ability-template";
import { getToken, ifDebug, localize, localizeFull } from '../../utils';
import { MODULE_NAME } from "../../../consts";

export class RectCentered extends AbilityTemplateAdvanced {
    get distance() { return this.document.distance; }
    set distance(value) { this.document.distance = value; }

    get direction() { return this.document.direction; }
    set direction(value) { this.document.direction = value; }

    get _maxRange() { return this.document.flags?.[MODULE_NAME]?.maxRange; };
    get _hasMaxRange() { return !!this._maxRange && !isNaN(this._maxRange); };
    get _minRange() { return this.document.flags?.[MODULE_NAME]?.minRange; };
    get _hasMinRange() { return !!this._minRange && !isNaN(this._minRange); };
    _tokenSquare;

    get offset() { return this.document.flags?.[MODULE_NAME]?.offset ?? 0; }

    _calculateTokenSquare(token) {
        const heightSquares = Math.max(Math.round(token.document.height), 1);
        const widthSquares = Math.max(Math.round(token.document.width), 1);

        const gridSize = canvas.grid.h;
        const { x, y, h, w } = token;

        const bottom = y + h;
        const left = x;
        const top = y;
        const right = x + w;

        const rightSpots = [...new Array(heightSquares)].map((_, i) => ({
            x: right,
            y: top + gridSize * i,
        }));
        const leftSpots = [...new Array(heightSquares)].map((_, i) => ({
            x: left,
            y: bottom - gridSize * i,
        }));
        const topSpots = [...new Array(widthSquares)].map((_, i) => ({
            x: left + gridSize * i,
            y: top,
        }));
        const bottomSpots = [...new Array(widthSquares)].map((_, i) => ({
            x: right - gridSize * i,
            y: bottom,
        }));
        const allSpots = [
            ...rightSpots,
            ...bottomSpots,
            ...leftSpots,
            ...topSpots,
        ];

        return {
            x: left,
            y: top,
            center: token.center,
            top,
            bottom,
            left,
            right,
            h,
            w,
            heightSquares,
            widthSquares,
            allSpots,
        };
    }

    tokenContains(x, y) {
        return new PIXI.Rectangle(this._tokenSquare.x, this._tokenSquare.y, this._tokenSquare.w, this._tokenSquare.h).contains(x, y);
    }

    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));
        super.clearTargetIfEnabled();

        const existingIcon = this.controlIcon?.iconSrc;
        let isInRange = true;

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

                if ((this._hasMaxRange || this._hasMinRange) && !this.document.flags[MODULE_NAME].ignoreRange) {
                    const rays = this._tokenSquare.allSpots.map((spot) => ({
                        ray: new Ray(spot, crosshairs),
                    }));
                    const distances = rays.map((ray) => canvas.grid.measureDistances([ray], { gridSpaces: true })[0]);
                    let range = Math.min(...distances);
                    range = !!(range % 1)
                        ? range.toFixed(1)
                        : range;
                    const isInToken = this.tokenContains(centerX, centerY);
                    if (isInToken) {
                        range = 0;
                    }

                    isInRange = !(this._hasMinRange && range < this._minRange
                        || this._hasMaxRange && range > this._maxRange);
                    this._setPreviewVisibility(isInRange);

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
    async initializePlacement(itemPf) {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

        const token = getToken(itemPf);

        if (token) {
            this._tokenSquare = this._calculateTokenSquare(token);
        }

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
