import { GridSquare } from '../../models/grid-square';
import { ifDebug, localize } from '../../utils';
import { LineFromTargetBase } from './base';

export class LineFromSelf extends LineFromTargetBase {

    /** @override */
    async getSourceGridSquare() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.getSourceGridSquare.name}`));

        this._setPreviewVisibility(false);
        this.controlIconText = localize('lineStart');
        super.clearTempate();

        const tokenSquare = GridSquare.fromToken(this.token);
        const availableSquares = tokenSquare.adjacentSquares;

        const totalSpots = availableSquares.length;

        const radToNormalizedAngle = (rad, offsetDegrees) => {
            const degrees = Math.toDegrees(rad);
            return Math.normalizeDegrees(degrees + offsetDegrees);
        };

        const sourceSquareConfig = {
            drawIcon: false,
            drawOutline: false,
            interval: 0,
            icon: this.iconImg,
        };

        let square;
        const selectSquareFromCrosshairsRotation = async (crosshairs) => {
            let currentSpotIndex = 0;

            while (crosshairs.inFlight) {
                let tempSquare;
                await warpgate.wait(100);

                const ray = new Ray(tokenSquare.center, crosshairs);
                if (canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE) {
                    // todo fix math for figuring out angle for spot
                    const followAngle = radToNormalizedAngle(ray.angle, -360 / totalSpots / 2);
                    const squareIndex = Math.ceil(followAngle / 360 * totalSpots) - 1 % totalSpots;
                    if (squareIndex === currentSpotIndex) {
                        continue;
                    }
                    currentSpotIndex = squareIndex;
                    square = availableSquares[squareIndex];

                    if (tempSquare === square) {
                        continue;
                    }
                }
                else {
                    const edge = tokenSquare.edgePoint(ray);
                    if (edge.center.x === tempSquare.center.x && edge.center.y === tempSquare.center.y) {
                        continue;
                    }

                    square = GridSquare.fromCenter(edge, 0, 0);
                }
                tempSquare = square;

                this.document.x = square.center.x;
                this.document.y = square.center.y;
                this.refresh();
            };
        }

        const sourceSquare = await warpgate.crosshairs.show(sourceSquareConfig, { show: selectSquareFromCrosshairsRotation });
        if (sourceSquare.cancelled) {
            return false;
        }

        this._setPreviewVisibility(true);
        this.controlIconText = null;

        return square;
    }
}
