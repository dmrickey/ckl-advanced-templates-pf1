import { AbilityTemplateAdvanced } from "../../ability-template";
import { ifDebug } from '../../../utils';
export class LineTargetFromSquareEdgeBase extends AbilityTemplateAdvanced {
    _tokenSquare;

    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

        super.clearTargetIfEnabled();

        const targetConfig = {
            drawIcon: false,
            drawOutline: false,
        };

        const totalSpots = this._tokenSquare.allSpots.length;

        const radToNormalizedAngle = (rad, offset) => {
            const degrees = Math.toDegrees(rad);
            return Math.normalizeDegrees(degrees + offset);
        };

        let currentOffsetAngle = 0;
        let currentSpotIndex = 0;
        const updateTemplateRotation = async (crosshairs) => {
            let offsetAngle = 0;

            canvas.app.view.onwheel = (event) => {
                // Avoid rotation while zooming the browser window
                if (event.ctrlKey) {
                    event.preventDefault();
                }
                event.stopPropagation();

                offsetAngle += 3 * Math.sign(event.deltaY);
            };

            while (crosshairs.inFlight) {
                await warpgate.wait(100);

                let direction, x, y;
                if (canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE) {

                    const ray = new Ray(this._tokenSquare.center, crosshairs);
                    const followAngle = radToNormalizedAngle(ray.angle, -360 / totalSpots / 2);
                    const spotIndex = Math.ceil(followAngle / 360 * totalSpots) % totalSpots;
                    if (spotIndex === currentSpotIndex && offsetAngle === currentOffsetAngle) {
                        continue;
                    }

                    currentOffsetAngle = offsetAngle;
                    currentSpotIndex = spotIndex;

                    const spot = this._tokenSquare.allSpots[currentSpotIndex];
                    direction = spot.direction;
                    x = spot.x;
                    y = spot.y;
                }
                else {
                    const ray = new Ray(this._tokenSquare.center, crosshairs);
                    direction = radToNormalizedAngle(ray.angle);
                    x = Math.cos(ray.angle) * this._tokenSquare.w / 2 + this._tokenSquare.center.x;
                    y = Math.sin(ray.angle) * this._tokenSquare.h / 2 + this._tokenSquare.center.y;
                }

                this.document.direction = Math.normalizeDegrees(direction + offsetAngle);
                this.document.x = x;
                this.document.y = y;
                this.refresh();

                super.targetIfEnabled();
            }

            canvas.app.view.onwheel = null;
        };

        const followCrosshairs = await warpgate.crosshairs.show(
            targetConfig,
            {
                show: updateTemplateRotation
            }
        );

        if (followCrosshairs.cancelled) {
            super.clearTargetIfEnabled();

            if (this.canRestart) {
                super.clearTempate();
                if (await this.initializeVariables()) {
                    return await this.commitPreview();
                }
            }
            return false;
        }

        return true;
    }

    /** @override */
    _gridInterval() { return canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE ? -1 : 0; }

    /**
     * @virtual
     * @return {Promise<Boolean>}
     */
    async initializeLineData(center, width, height) {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializeVariables.name}`));

        this._tokenSquare = this.#sourceSquare(center, width, height);

        const { x, y } = this._tokenSquare.allSpots[0];
        this.document.x = x;
        this.document.y = y;

        return true;
    }

    #sourceSquare(center, widthSquares, heightSquares) {
        let gridSize = canvas.grid.h;
        const h = gridSize * heightSquares;
        const w = gridSize * widthSquares;

        const bottom = center.y + h / 2;
        const left = center.x - w / 2;
        const top = center.y - h / 2;
        const right = center.x + w / 2;
        const heightSpots = heightSquares;
        const widthSpots = widthSquares;

        // only originate from the edge or a square (not the corner)
        const gridOffset = gridSize / 2;

        const rightSpots = [...new Array(widthSpots)].map((_, i) => ({
            direction: 0,
            x: right,
            y: top + gridSize * i + gridOffset,
        }));
        const bottomSpots = [...new Array(heightSpots)].map((_, i) => ({
            direction: 90,
            x: right - gridSize * i - gridOffset,
            y: bottom,
        }));
        const leftSpots = [...new Array(widthSpots)].map((_, i) => ({
            direction: 180,
            x: left,
            y: bottom - gridSize * i - gridOffset,
        }));
        const topSpots = [...new Array(heightSpots)].map((_, i) => ({
            direction: 270,
            x: left + gridSize * i + gridOffset,
            y: top,
        }));
        const allSpots = [
            ...rightSpots.slice(Math.floor(rightSpots.length / 2)),
            { direction: 45, x: right, y: bottom },
            ...bottomSpots,
            { direction: 135, x: left, y: bottom },
            ...leftSpots,
            { direction: 225, x: left, y: top },
            ...topSpots,
            { direction: 315, x: right, y: top },
            ...rightSpots.slice(0, Math.floor(rightSpots.length / 2)),
        ];

        return {
            x: left,
            y: top,
            center,
            top,
            bottom,
            left,
            right,
            // h: canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE ? h : 0,
            // w: canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE ? w : 0,
            h,
            w,
            heightSquares,
            widthSquares,
            allSpots,
        };
    }

    /**
     * @virtual
     * @returns {boolean}
     */
    get canRestart() { return false; }
}
