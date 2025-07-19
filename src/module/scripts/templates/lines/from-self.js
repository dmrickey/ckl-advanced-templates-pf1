import { GridSquare } from '../../models/grid-square';
import { ifDebug, localize } from '../../utils';
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

            let tempPoint = { x: 0, y: 0 };

            const ray = new Ray(tokenSquare.center, crosshairs);
            if (canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE) {
                const followAngle = radToNormalizedAngle(ray.angle);
                const pointIndex = Math.ceil(followAngle / 360 * totalSpots) - 1 % totalSpots;
                if (pointIndex === currentSpotIndex) {
                    return;
                }
                currentSpotIndex = pointIndex;
                point = availablePoints[pointIndex];
            }
            else {
                point = tokenSquare.edgePoint(ray);
            }

            if (point.x === tempPoint.x && point.y === tempPoint.y) {
                return;
            }
            tempPoint = point;

            super.setCenter = point;
            this.refresh();
        }

        // const sourcePointConfig = {
        //     drawIcon: false,
        //     drawOutline: false,
        //     interval: 0,
        //     icon: this.iconImg,
        // };
        // const sourceSquare = await xhairs.show(sourcePointConfig, { show: selectSquareFromCrosshairsRotation });
        const config = {
            borderAlpha: 0,
            icon: { borderVisible: false },
            snap: { resolution: canvas.grid.size },
        }
        const sourceSquare = await Sequencer.Crosshair.show(
            config,
            {
                [Sequencer.Crosshair.CALLBACKS.MOUSE_MOVE]: async (crosshair) => {
                    console.log(crosshair)
                    await selectSquareFromCrosshairsRotation(crosshair);
                }
            },
        );


        if (!sourceSquare) {
            return false;
        }

        this._setPreviewVisibility(true);
        this.controlIconText = null;

        return point;
    }
}
