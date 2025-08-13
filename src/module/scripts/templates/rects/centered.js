import { CONSTS, MODULE_NAME } from "../../../consts";
import { GridSquare } from "../../models/grid-square";
import { ifDebug } from '../../utils';
import { AbilityTemplateAdvanced } from "../ability-template";

export class RectCentered extends AbilityTemplateAdvanced {

    get distance() { return this.document.distance; }
    set distance(value) { this.document.distance = value; }

    get direction() { return this.document.direction; }
    set direction(value) { this.document.direction = value; }

    /** @override */
    get _rotationType() { return false; }

    /** @override */
    get _snapMode() {
        const isEvenSquareWidth = !(this.#widthSquares % 2);
        const isEvenSquareHeight = !(this.#heightSquares % 2);

        if (isEvenSquareHeight && isEvenSquareWidth) return CONST.GRID_SNAPPING_MODES.VERTEX;
        if (!isEvenSquareHeight && !isEvenSquareWidth) return CONST.GRID_SNAPPING_MODES.CENTER;

        return isEvenSquareWidth
            ? CONST.GRID_SNAPPING_MODES.LEFT_SIDE_MIDPOINT | CONST.GRID_SNAPPING_MODES.RIGHT_SIDE_MIDPOINT
            : CONST.GRID_SNAPPING_MODES.BOTTOM_SIDE_MIDPOINT | CONST.GRID_SNAPPING_MODES.TOP_SIDE_MIDPOINT;
    }

    #widthSquares = 0;
    #heightSquares = 0;

    get #widthPx() { return this.#widthSquares * canvas.scene.grid.sizeX }
    get #heightPx() { return this.#heightSquares * canvas.scene.grid.sizeY; }

    get #xOffset() { return -this.#widthSquares * canvas.scene.grid.sizeX / 2; }
    get #yOffset() { return -this.#heightSquares * canvas.scene.grid.sizeY / 2; }

    /** @override */
    initializeVariables() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializeVariables.name}`));

        const width = this.distance;
        const height = this.document.flags[MODULE_NAME]?.[CONSTS.flags.rect.height] || this.distance;

        this.#widthSquares = width / canvas.scene.grid.distance;
        this.#heightSquares = height / canvas.scene.grid.distance;

        this.distance = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
        this.direction = Math.toDegrees(Math.atan(height / width));

        return super.initializeVariables();
    }

    /**
     * Calculates a set of x & y coordinates that the template actually should have based on type and origin
     *
     * @returns {{x: number, y: number}}
     * @private
     */
    _getTemplateSnapCoordinates() {
        let { x, y } = this.document;

        if (this.document.t === "rect" && game.canvas.grid.isSquare) {
            x = x - this.#xOffset;
            y = y - this.#yOffset;
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
        const offsetX = this.document.x - snapX;
        const offsetY = this.document.y - snapY;

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

    /** @override */
    _getGridHighlightPositions() {
        const points = GridSquare.fromCenter(this.center, this.#heightSquares, this.#widthSquares).containedSquares;
        return points;
    }

    get center() { return { x: this.document.x, y: this.document.y }; }

    /** @override */
    async getTokensWithin() {
        const gridSizePx = Math.max(canvas.scene.grid.sizeX, canvas.scene.grid.sizeY);
        const maxDistance = Math.max(this.#heightPx, this.#widthPx) + gridSizePx + 1;
        const relevantTokens = new Set(
            canvas.tokens.placeables.filter((t) => new Ray(t.center, this.center).distance - t.sizeErrorMargin <= maxDistance)
        );

        const results = new Set();
        const rect = {
            x: this.document.x + this.#xOffset,
            y: this.document.y + this.#yOffset,
            width: this.#widthPx,
            height: this.#heightPx,
        };

        for (const t of relevantTokens) {
            const tokenGridSquares = GridSquare.fromToken(t);
            if (tokenGridSquares.containedSquares.some((square) => this.withinRect(square.center, rect))) {
                results.add(t);
            }
        }
        return Array.from(results);
    }

    /** @override */
    _finalizeTemplate() {
        this.document.x += this.#xOffset;
        this.document.y += this.#yOffset;
        return true;
    }
}
