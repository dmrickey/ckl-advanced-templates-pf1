import { GridSquare } from '../../models/grid-square';
import { ifDebug, localize } from '../../utils';
import { xhairs } from '../../utils/crosshairs';
import { wait } from '../../utils/wait';
import { LineFromTargetBase } from './base';

export class LineFromSelf extends LineFromTargetBase {

    /** @override */
    async getSourcePoint() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.getSourcePoint.name}`));

        this._setPreviewVisibility(false);
        this.controlIconText = localize('lineStart');
        super.clearTempate();

        const tokenSquare = GridSquare.fromToken(this.token);
        const availablePoints = tokenSquare.gridPoints;

        const totalSpots = availablePoints.length;

        const radToNormalizedAngle = (rad) => {
            const degrees = Math.toDegrees(rad);
            return Math.normalizeDegrees(degrees);
        };

        let point;
        const selectSquareFromCrosshairsRotation = async (crosshairs) => {
            let currentSpotIndex = 0;

            while (crosshairs.inFlight) {
                let tempPoint = { x: 0, y: 0 };
                await wait(100);

                const ray = new Ray(tokenSquare.center, crosshairs);
                if (canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE) {
                    const followAngle = radToNormalizedAngle(ray.angle);
                    const pointIndex = Math.ceil(followAngle / 360 * totalSpots) - 1 % totalSpots;
                    if (pointIndex === currentSpotIndex) {
                        continue;
                    }
                    currentSpotIndex = pointIndex;
                    point = availablePoints[pointIndex];
                }
                else {
                    point = tokenSquare.edgePoint(ray);
                }

                if (point.x === tempPoint.x && point.y === tempPoint.y) {
                    continue;
                }
                tempPoint = point;

                super.setCenter = point;
                this.refresh();
            };
        }

        const sourcePointConfig = {
            drawIcon: false,
            drawOutline: false,
            interval: 0,
            icon: this.iconImg,
        };
        const sourceSquare = await xhairs.show(sourcePointConfig, { show: selectSquareFromCrosshairsRotation });
        if (sourceSquare.cancelled) {
            return false;
        }

        this._setPreviewVisibility(true);
        this.controlIconText = null;

        return point;
    }
}
