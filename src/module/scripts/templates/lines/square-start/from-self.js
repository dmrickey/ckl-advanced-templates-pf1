import { MODULE_NAME } from '../../../../consts';
import { GridSquare } from '../../../models/grid-square';
import { ifDebug, localize } from '../../../utils';
import { LineTargetFromSquareCenterBase } from './base';

export class LineFromSquareCenterSelf extends LineTargetFromSquareCenterBase {

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
            icon: this.document.flags?.[MODULE_NAME]?.icon || 'systems/pf1/icons/misc/magic-swirl.png',
        };

        let spot;
        const selectSquareFromCrosshairsRotation = async (crosshairs) => {
            let currentSpotIndex = 0;

            while (crosshairs.inFlight) {
                let tempSpot;
                await warpgate.wait(100);

                const ray = new Ray(tokenSquare.center, crosshairs);
                if (canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE) {
                    // todo fix math for figuring out angle for spot
                    const followAngle = radToNormalizedAngle(ray.angle, -360 / totalSpots / 2);
                    const spotIndex = Math.ceil(followAngle / 360 * totalSpots) - 1 % totalSpots;
                    if (spotIndex === currentSpotIndex) {
                        continue;
                    }
                    currentSpotIndex = spotIndex;
                    spot = availableSquares[spotIndex];

                    if (tempSpot === spot) {
                        continue;
                    }
                }
                else {
                    const edge = tokenSquare.edgePoint(ray);
                    if (edge.center.x === tempSpot.center.x && edge.center.y === tempSpot.center.y) {
                        continue;
                    }

                    spot = GridSquare.fromCenter(edge, 0, 0);
                }
                tempSpot = spot;

                this.document.x = spot.center.x;
                this.document.y = spot.center.y;
                this.refresh();
            };
        }

        const sourceSquare = await warpgate.crosshairs.show(sourceSquareConfig, { show: selectSquareFromCrosshairsRotation });
        if (sourceSquare.cancelled) {
            return false;
        }

        this._setPreviewVisibility(true);
        this.controlIconText = null;

        return spot;
    }
}
