import { ROTATION_TYPE } from '../../../consts';
import { AbilityTemplateAdvanced } from "../ability-template";

export class ConeSystem extends AbilityTemplateAdvanced {

    /** @override */
    get _snapMode() {
        return CONST.GRID_SNAPPING_MODES.CENTER
            | CONST.GRID_SNAPPING_MODES.VERTEX
            | CONST.GRID_SNAPPING_MODES.EDGE_MIDPOINT;
    }

    /** @override */
    initializeVariables() {
        this.document.angle = 90;
        return super.initializeVariables();
    }

    /** @override */
    async handleRangeAndTargeting() {
        await this.targetIfEnabled()
    }

    get _rotationType() { return ROTATION_TYPE.SYSTEM; }

    /**
     * Calculates a set of x & y coordinates that the template actually should have based on type and origin
     *
     * @returns {{x: number, y: number}}
     * @private
     */
    _getTemplateSnapCoordinates() {
        let { x, y } = this.document;
        const grid = canvas.grid;

        if (this.document.t === "cone" && game.canvas.grid.isSquare) {
            const { direction } = this.document;

            if (direction <= 45 || direction >= 315) {
                x = Math.ceil(x / grid.size) * grid.size;
            } else if (direction >= 135 && direction <= 225) {
                x = Math.floor(x / grid.size) * grid.size;
            }

            if (direction >= 45 && direction <= 135) {
                y = Math.ceil(y / grid.size) * grid.size;
            } else if (direction >= 225 && direction <= 315) {
                y = Math.floor(y / grid.size) * grid.size;
            }
        }

        return { x, y };
    }

    /**
     * Recalculate template visual element positions based on snap coordinates
     *
     * @private
     */
    _setElementOffsets() {
        const { x: snapX, y: snapY } = this._getTemplateSnapCoordinates();
        const offsetX = snapX - this.document.x;
        const offsetY = snapY - this.document.y;

        this.template.x = offsetX;
        this.template.y = offsetY;

        this.ruler.position.set(this.ray?.dx + 10 + offsetX, this.ray?.dy + 5 + offsetY);
    }

    /**
     * @override
     * @private
     */
    _refreshRulerText() {
        super._refreshRulerText();
        this._setElementOffsets();
    }

    /**
     * @override
     * @private
     */
    _refreshPosition() {
        super._refreshPosition();
        this._setElementOffsets();
    }

    /**
     * @override
     * @private
     */
    _refreshTemplate() {
        super._refreshTemplate();
        this._setElementOffsets();
    }
}
