import { AbilityTemplateAdvanced } from "../ability-template";
import { MODULE_NAME } from '../../../consts';
import { Settings } from '../../../settings';
import { getToken, ifDebug, localize, localizeFull } from '../../utils';

export class AbilityTemplateCircleGrid extends AbilityTemplateAdvanced {
    _maxRange;
    _hasMaxRange;
    _minRange;
    _hasMinRange;
    _tokenSquare;

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

    _crosshairsOverride(_crosshairs) { }

    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));
        if (Settings.target) {
            game.user.updateTokenTargets();
        }

        const existingIcon = this.controlIcon?.iconSrc;
        let isInRange = true;

        const updateTemplateLocation = async (crosshairs) => {
            while (crosshairs.inFlight) {
                await warpgate.wait(20);

                this.document.flags[MODULE_NAME].icon = existingIcon;

                const { x, y } = crosshairs;
                if (this.document.x === x && this.document.y === y) {
                    continue;
                }

                this._crosshairsOverride(crosshairs);

                if ((this._hasMaxRange || this._hasMinRange) && !this.document.flags[MODULE_NAME].ignoreRange) {
                    const rays = this._tokenSquare.allSpots.map((spot) => ({
                        ray: new Ray(spot, { x, y }),
                    }));
                    const distances = rays.map((ray) => canvas.grid.measureDistances([ray], { gridSpaces: true })[0]);
                    let range = Math.min(...distances);
                    range = !!(range % 1)
                        ? range.toFixed(1)
                        : range;

                    isInRange = !(this._hasMinRange && range < this._minRange
                        || this._hasMaxRange && range > this._maxRange);
                    this._setPreviewVisibility(isInRange);

                    const unit = game.settings.get('pf1', 'units') === 'imperial'
                        ? localizeFull('PF1.DistFtShort')
                        : localizeFull('PF1.DistMShort');
                    crosshairs.label = `${range} ${unit}`;
                    crosshairs.label = localize('range', { range, unit });
                }

                this.document.x = x;
                this.document.y = y;
                this.refresh();

                this.targetIfEnabled();
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
            if (Settings.target) {
                game.user.updateTokenTargets();
            }
            return false;
        }

        return true;
    }

    /** @override */
    async initializePlacement(itemPf) {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

        const token = getToken(itemPf);

        if (token) {
            this._maxRange = this.document.flags?.[MODULE_NAME]?.maxRange;
            this._hasMaxRange = !!this._maxRange && !isNaN(this._maxRange);
            this._minRange = this.document.flags?.[MODULE_NAME]?.minRange;
            this._hasMinRange = !!this._minRange && !isNaN(this._minRange);

            this._tokenSquare = this._calculateTokenSquare(token);
        }

        const mouse = canvas.app.renderer.plugins.interaction.mouse;
        const position = mouse.getLocalPosition(canvas.app.stage);
        const { x, y } = position;
        this.document.x = x;
        this.document.y = y;
    }
}
