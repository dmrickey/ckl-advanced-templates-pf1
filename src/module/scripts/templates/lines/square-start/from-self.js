import { MODULE_NAME } from '../../../../consts';
import { GridSquare } from '../../../models/grid-square';
import { getToken, ifDebug, localize } from '../../../utils';
import { LineTargetFromSquareCenterBase } from './base';

export class LineFromSquareCenterSelf extends LineTargetFromSquareCenterBase {

    #token;

    /** @override */
    async initializePlacement(itemPf) {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

        const token = this.#token ??= getToken(itemPf);
        const tokenSquare = GridSquare.fromToken(token);
        const availableSquares = tokenSquare.adjacentSquares;

        const totalSpots = availableSquares.length;

        const radToNormalizedAngle = (rad, offset) => {
            const degrees = Math.toDegrees(rad);
            return Math.normalizeDegrees(degrees + offset);
        };

        const sourceSquareConfig = {
            drawIcon: false,
            drawOutline: false,
            interval: 0,
            label: localize('lineStart'), // add label override to base
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
                    const followAngle = radToNormalizedAngle(ray.angle, -360 / totalSpots / 2);
                    const spotIndex = Math.ceil(followAngle / 360 * totalSpots) % totalSpots;
                    if (spotIndex === currentSpotIndex) {
                        continue;
                    }
                    currentSpotIndex = spotIndex;
                    spot = availableSquares[spotIndex];

                    if (tempSpot === spot) {
                        return;
                    }
                }
                else {
                    const edge = tokenSquare.edgePoint(ray);
                    if (edge.center.x === spot.center.x && edge.center.y === spot.center.y) {
                        return;
                    }

                    spot = GridSquare.fromCenter(edge, 0, 0);
                }
                tempSpot = spot;

                this.document.x = spot.center.x;
                this.document.y = spot.center.y;
            };

            canvas.app.view.onwheel = null;
        }

        const sourceSquare = await warpgate.crosshairs.show(sourceSquareConfig, { show: selectSquareFromCrosshairsRotation });
        if (sourceSquare.cancelled) {
            return false;
        }

        return await super.initializeLineData(spot);
    }
}
