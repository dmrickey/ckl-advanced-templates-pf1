import { AbilityTemplateAdvanced } from "../ability-template";
import { MODULE_NAME } from '../../../consts';
import { ifDebug, localize, localizeFull } from '../../utils';

export class CircleGridIntersection extends AbilityTemplateAdvanced {

    _calculateTokenSquare(token) {
        const heightSquares = Math.max(Math.round(token.document.height), 1);
        const widthSquares = Math.max(Math.round(token.document.width), 1);

        const gridSize = canvas.grid.sizeY;
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

    /**
     * @abstract
     * @returns {GridSquare | null | undefined}
     */
    async getSourceGridSquare() { return this._calculateTokenSquare(this.token); }

    _crosshairsOverride(_crosshairs) { }

    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));
        super.clearTargetIfEnabled();

        const existingIcon = this.controlIcon?.iconSrc;
        let isInRange = true;

        const tokenSquare = await this.getSourceGridSquare();

        const tokenContains = (x, y) =>
            new PIXI.Rectangle(tokenSquare.x, tokenSquare.y, tokenSquare.w, tokenSquare.h).contains(x, y);

        const updateTemplateLocation = async (crosshairs) => {
            this.document.flags[MODULE_NAME].icon = existingIcon;

            const { x, y } = crosshairs.center;
            if (this.document.x === x && this.document.y === y) {
                return;
            }

            this._crosshairsOverride(crosshairs);

            if ((this.hasMaxRange || this.hasMinRange) && !this.document.flags[MODULE_NAME].ignoreRange) {
                const distances = tokenSquare.allSpots
                    .map((spot) => [spot, { x, y }])
                    .map((coords) => canvas.grid.measurePath(coords).distance);
                let range = Math.min(...distances);
                range = !!(range % 1)
                    ? range.toFixed(1)
                    : range;
                const isInToken = tokenContains(x, y);
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

            this.document.x = x;
            this.document.y = y;
            this.refresh();

            await super.targetIfEnabled();
        };

        const config = {
            borderAlpha: 0,
            icon: { borderVisible: false },
            snap: { position: this._gridInterval() },
            label: {
                dy: 50,
            }
        }
        const crosshairs = await Sequencer.Crosshair.show(
            config,
            {
                [Sequencer.Crosshair.CALLBACKS.MOUSE_MOVE]: async (crosshair) => {
                    await updateTemplateLocation(crosshair);
                },
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
    async initializeVariables() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializeVariables.name}`));

        const { x, y } = canvas.mousePosition;
        this.document.x = x;
        this.document.y = y;
        return true;
    }
}
