import { ANGLE_POINTS, FOLLOW_FROM, PLACEMENT_TYPE } from '../../../consts';
import { GridSquare } from '../../models/grid-square';
import { ifDebug, localize } from '../../utils';
import { AbilityTemplateAdvanced } from '../ability-template';

export class LineFromSelf extends AbilityTemplateAdvanced {

    /** @override */
    get _snapMode() { return this._isSelectingOrigin ? CONST.GRID_SNAPPING_MODES.VERTEX : 0; }

    /** @override */
    get placementType() {
        return (this.token || !_isSelectingOrigin)
            ? PLACEMENT_TYPE.SET_ANGLE
            : PLACEMENT_TYPE.SET_XY;
    }

    /** @override */
    get angleStartPoints() { return ANGLE_POINTS.VERTEX; }

    /** @override */
    get followFrom() { return this.token ? FOLLOW_FROM.TOKEN : FOLLOW_FROM.CURRENT; }

    /** @override */
    async initializeVariables() {
        const { x, y } = canvas.mousePosition;
        this.document.x = x;
        this.document.y = y;
        this._isSelectingOrigin = !this.token;
        return true;
    }

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

        const config = {
            borderAlpha: 0,
            icon: { borderVisible: false },
            snap: { resolution: canvas.grid.size },
        }
        const sourceSquare = await Sequencer.Crosshair.show(
            config,
            {
                [Sequencer.Crosshair.CALLBACKS.MOUSE_MOVE]: async (crosshair) => {
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
