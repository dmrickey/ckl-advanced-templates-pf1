import { AbilityTemplateAdvanced } from "../ability-template";
import { Settings } from '../../../settings';
import { ifDebug } from '../../utils';
export class AbilityTemplateLineTargetBase extends AbilityTemplateAdvanced {
    _tokenSquare;

    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

        super.clearTargetIfEnabled();

        const targetConfig = {
            drawIcon: false,
            drawOutline: false,
        };

        let targetX = 0;
        let targetY = 0;
        let currentSpotIndex = 0;
        const totalSpots = this._tokenSquare.allSpots.length;

        const radToNormalizedAngle = (rad) => {
            let angle = (rad * 180 / Math.PI) % 360;
            return angle < 0
                ? angle + 360
                : angle;
        };

        const updateTemplateRotation = async (crosshairs) => {

            let tempSpotIndex = 0;
            canvas.app.view.onwheel = (event) => {
                // Avoid rotation while zooming the browser window
                if (event.ctrlKey) {
                    event.preventDefault();
                }
                event.stopPropagation();

                tempSpotIndex = (currentSpotIndex + totalSpots + Math.sign(event.deltaY) * 1) % totalSpots;
            };

            while (crosshairs.inFlight) {
                await warpgate.wait(100);

                let direction, x, y;
                if (canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE) {
                    if (tempSpotIndex === currentSpotIndex && targetX === crosshairs.x && targetY === crosshairs.y) {
                        continue;
                    }

                    currentSpotIndex = tempSpotIndex;
                    targetX = crosshairs.x;
                    targetY = crosshairs.y;

                    const spot = this._tokenSquare.allSpots[currentSpotIndex];
                    const ray = new Ray(spot, crosshairs);
                    direction = radToNormalizedAngle(ray.angle);
                    x = spot.x;
                    y = spot.y;
                }
                else {
                    const ray = new Ray(this._tokenSquare.center, crosshairs);
                    direction = radToNormalizedAngle(ray.angle);
                    x = Math.cos(ray.angle) * this._tokenSquare.w / 2 + this._tokenSquare.center.x;
                    y = Math.sin(ray.angle) * this._tokenSquare.h / 2 + this._tokenSquare.center.y;
                }

                this.document.direction = direction;
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
                if (await this.initializePlacement()) {
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
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

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

        // "cheat" by cutting gridsize in half since we're essentially allowing two placement spots per grid square
        gridSize /= 2;

        const bottom = center.y + h / 2;
        const left = center.x - w / 2;
        const top = center.y - h / 2;
        const right = center.x + w / 2;
        const heightSpots = heightSquares * 2 + 1;
        const widthSpots = widthSquares * 2 + 1;

        const rightSpots = [...new Array(widthSpots)].map((_, i) => ({
            x: right,
            y: top + gridSize * i,
        }));
        const bottomSpots = [...new Array(heightSpots)].map((_, i) => ({
            x: right - gridSize * i,
            y: bottom,
        }));
        const leftSpots = [...new Array(widthSpots)].map((_, i) => ({
            x: left,
            y: bottom - gridSize * i,
        }));
        const topSpots = [...new Array(heightSpots)].map((_, i) => ({
            x: left + gridSize * i,
            y: top,
        }));
        const allSpots = [
            ...rightSpots.slice(Math.floor(rightSpots.length / 2)),
            { x: right, y: bottom },
            ...bottomSpots,
            { x: left, y: bottom },
            ...leftSpots,
            { x: left, y: top },
            ...topSpots,
            { x: right, y: top },
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
