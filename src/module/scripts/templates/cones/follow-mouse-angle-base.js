import { AbilityTemplateAdvanced } from "../ability-template";
import { Settings } from '../../../settings';
import { ifDebug } from '../../utils';

export class AbilityTemplateFollowMouseAngleCone extends AbilityTemplateAdvanced {
    _tokenSquare;
    get #is15() { return this.document?.distance === 15 };

    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

        super.clearTargetIfEnabled();

        let currentSpotIndex = 0;
        let onWheel = false;
        let offsetAngle = 0;
        const updateTemplateRotation = async (crosshairs) => {
            let direction, x, y;
            if (canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE) {
                const totalSpots = this._tokenSquare.allSpots.length;
                const radToNormalizedAngle = (rad) => {
                    let angle = (rad * 180 / Math.PI) % 360;
                    // offset the angle for even-sided tokens, because it's centered in the grid it's just wonky without the offset
                    const offset = this.#is15
                        ? Settings.cone15Alternate
                            ? 0.5
                            : 0
                        : 1;
                    if (this._tokenSquare.heightSquares % 2 === offset && this._tokenSquare.widthSquares % 2 === offset) {
                        angle -= (360 / totalSpots) / 2;
                    }
                    const normalizedAngle = Math.round(angle / (360 / totalSpots)) * (360 / totalSpots);
                    return normalizedAngle < 0
                        ? normalizedAngle + 360
                        : normalizedAngle;
                };

                const ray = new Ray(this._tokenSquare.center, crosshairs);
                const angle = radToNormalizedAngle(ray.angle);
                const spotIndex = Math.ceil(angle / 360 * totalSpots) % totalSpots;
                if (spotIndex === currentSpotIndex) {
                    return;
                }

                currentSpotIndex = spotIndex;

                const spot = this._tokenSquare.allSpots[currentSpotIndex];
                direction = spot.direction;
                x = spot.x;
                y = spot.y;
            }
            else {
                const radToNormalizedAngle = (rad) => {
                    const angle = (rad * 180 / Math.PI) % 360;
                    return angle < 0
                        ? angle + 360
                        : angle;
                };
                const ray = new Ray(this._tokenSquare.center, crosshairs);
                direction = radToNormalizedAngle(ray.angle);
                x = Math.cos(ray.angle) * this._tokenSquare.w / 2 + this._tokenSquare.center.x;
                y = Math.sin(ray.angle) * this._tokenSquare.h / 2 + this._tokenSquare.center.y;
            }

            const alternateRotation = Settings.coneRotation;
            if (alternateRotation && !onWheel) {
                onwheel = true;
                canvas.app.view.onwheel = (event) => {
                    // Avoid rotation while zooming the browser window
                    if (event.ctrlKey) {
                        event.preventDefault();
                    }
                    event.stopPropagation();

                    offsetAngle += alternateRotation * Math.sign(event.deltaY);
                    this.document.direction = direction + offsetAngle;
                    this.refresh();
                };
            }

            this.document.direction = direction + offsetAngle;
            this.document.x = x;
            this.document.y = y;
            this.refresh();

            await super.targetIfEnabled();
        };

        const config = {
            borderAlpha: 0,
            fillAlpha: 0,
            icon: { borderVisible: false },
        }
        const rotateCrosshairs = await Sequencer.Crosshair.show(
            config,
            {
                [Sequencer.Crosshair.CALLBACKS.MOUSE_MOVE]: async (crosshair) => {
                    console.log(crosshair)
                    await updateTemplateRotation(crosshair);
                }
            },
        );
        canvas.app.view.onwheel = null;

        if (!rotateCrosshairs) {
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
    _gridInterval() { return CONST.GRID_SNAPPING_MODES.CENTER; }

    /**
     * @virtual
     * @return {Promise<Boolean>}
     */
    async initializeConeData(center, width, height) {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializeConeData.name}`));

        this._tokenSquare = this.#sourceSquare(center, width, height);

        const { x, y } = this._tokenSquare.allSpots[0];
        this.document.x = x;
        this.document.y = y;
        this.document.angle = 90;

        return true;
    }

    #sourceSquare(center, widthSquares, heightSquares) {
        let gridSize = canvas.grid.sizeY;
        const h = gridSize * heightSquares;
        const w = gridSize * widthSquares;

        const bottom = center.y + h / 2;
        const left = center.x - w / 2;
        const top = center.y - h / 2;
        const right = center.x + w / 2;

        // 15 foot cones originate in the middle of the grid, so for every square-edge there's one origin point instead of two
        const gridOffset = this.#is15 && !Settings.cone15Alternate
            ? gridSize / 2
            : 0;

        // "cheat" by cutting gridsize in half since we're essentially allowing two placement spots per grid square
        if (this.#is15 && Settings.cone15Alternate) {
            gridSize /= 2;
        }

        const heightSpots = this.#is15 && Settings.cone15Alternate
            ? heightSquares * 2 + 1
            : this.#is15
                ? heightSquares
                : heightSquares + 1;
        const widthSpots = this.#is15 && Settings.cone15Alternate
            ? widthSquares * 2 + 1
            : this.#is15
                ? widthSquares
                : widthSquares + 1;

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
