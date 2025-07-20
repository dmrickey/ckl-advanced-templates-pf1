import { CONSTS, MODULE_NAME } from '../../consts';
import { Settings } from '../../settings';
import { GridSquare } from '../models/grid-square';


/**
 * A type of Placeable Object which highlights an area of the grid as covered by some area of effect.
 * @category - Canvas
 * @see {@link MeasuredTemplateDocument}
 * @see {@link TemplateLayer}
 */
export class MeasuredTemplatePFAdvanced extends pf1.canvas.MeasuredTemplatePF {

    //#region  COPIED FROM PF1
    withinAngle(min, max, value) {
        min = Math.normalizeDegrees(min);
        max = Math.normalizeDegrees(max);
        value = Math.normalizeDegrees(value);

        if (min < max) return value >= min && value <= max;
        return value >= min || value <= max;
    }

    withinCone(target, minAngle, maxAngle) {
        const ray = new Ray(tCenter, target);
        const rayAngle = Math.normalizeDegrees(Math.toDegrees(ray.angle));
        const rayWithinAngle = this.withinAngle(minAngle, maxAngle, rayAngle);
        // Calculate ray length in relation to circle radius
        const raySceneLength = (ray.distance / gridSizePx) * gridSizeUnits;
        // Include token if its within template distance and within the cone's angle
        return rayWithinAngle && raySceneLength <= distance + 1;
    };

    withinRect(point, rect) {
        return point.x >= rect.x && point.x < rect.x + rect.width && point.y >= rect.y && point.y < rect.y + rect.height;
    }

    degToRad(deg) {
        return deg * (Math.PI / 180);
    }
    //#endregion

    //#region BEGIN MY CODE
    get shouldOverrideTokenEmanation() {
        return game.settings.get('pf1', 'measureStyle')
            && this.document.t === 'circle'
            && this.document.flags?.[MODULE_NAME]?.[CONSTS.flags.placementType] === CONSTS.placement.circle.self
            && ['burst', 'emanation'].includes(this.document.flags?.[MODULE_NAME]?.[CONSTS.flags.circle.areaType]);
    }

    get hideHighlight() {
        return !!this.document.flags?.[MODULE_NAME]?.[CONSTS.flags.hideHighlight]
            || !!this.document.flags?.[MODULE_NAME]?.[CONSTS.flags.hidePreview];
    }

    set hideHighlight(value) {
        this.document.flags ||= { [MODULE_NAME]: {} };
        this.document.flags[MODULE_NAME][CONSTS.flags.hideHighlight] = value;
    }

    get tokenSizeSquares() {
        const { token } = this;
        const sizeSquares = token?.document.width || 1;
        return { token, sizeSquares };
    }

    get tokenGridCorners() {
        const { sizeSquares } = this.tokenSizeSquares;
        const { x, y } = this.document;
        const gridSize = canvas.grid.sizeY;

        const bottom = y + gridSize * sizeSquares / 2;
        const left = x - gridSize * sizeSquares / 2;
        const top = y - gridSize * sizeSquares / 2;
        const right = x + gridSize * sizeSquares / 2;

        const rightSpots = [...new Array(sizeSquares + 1)].map((_, i) => ({
            x: right,
            y: top + gridSize * i,
        }));
        const bottomSpots = [...new Array(sizeSquares + 1)].map((_, i) => ({
            x: right - gridSize * i,
            y: bottom,
        }));
        bottomSpots.shift();
        bottomSpots.pop();
        const leftSpots = [...new Array(sizeSquares + 1)].map((_, i) => ({
            x: left,
            y: bottom - gridSize * i,
        }));
        const topSpots = [...new Array(sizeSquares + 1)].map((_, i) => ({
            x: left + gridSize * i,
            y: top,
        }));
        topSpots.shift();
        topSpots.pop();

        const allSpots = [
            ...rightSpots,
            ...bottomSpots,
            ...leftSpots,
            ...topSpots,
        ];

        return allSpots;
    }

    get token() {
        const tokenId = this.document.flags?.[MODULE_NAME]?.tokenId;
        const token = canvas.tokens.placeables.find((x) => x.id === tokenId);
        return token;
    }

    /**
     * Used to get the original distance, i.e. for a rect.
     */
    get baseDistance() { return this.document.flags?.[MODULE_NAME]?.baseDistance || 0; }

    get hasMaxRange() { return !!this.token && !!this.maxRange && !isNaN(this.maxRange); }
    get hasMinRange() { return !!this.token && !!this.minRange && !isNaN(this.minRange); }
    get maxRange() { return this.document.flags?.[MODULE_NAME]?.maxRange; }
    get minRange() { return this.document.flags?.[MODULE_NAME]?.minRange; }

    get iconImg() { return this.document.flags?.[MODULE_NAME]?.icon || 'systems/pf1/icons/misc/magic-swirl.png'; }

    set setCenter({ x, y }) {
        this.document.x = x;
        this.document.y = y;
        this.refresh();
    }

    get actualRotation() { return this.document.flags?.[MODULE_NAME]?.rotation ?? 0; }
    set actualRotation(value) {
        this.document.flags ||= { [MODULE_NAME]: {} };
        this.document.flags[MODULE_NAME].rotation = value;
    }

    /**
     * @virtual
     */
    _gridInterval() { return CONST.GRID_SNAPPING_MODES.VERTEX; } // todo find out if I need to refactor this to provide the whole snap in case this doesn't turn snapping off automatically for gridless scenes

    /**
     * The control icon label
     * @type {PreciseText}
     */
    controlIconTextLabel;

    get controlIconText() {
        return this.document.flags?.[MODULE_NAME]?.[CONSTS.flags.controlIconText] || '';
    }

    set controlIconText(value) {
        this.document.flags ||= { [MODULE_NAME]: {} };
        this.document.flags[MODULE_NAME][CONSTS.flags.controlIconText] = value;
    }

    /**
     * Draw the Text label used for the MeasuredTemplate
     * @returns {PreciseText}
     */
    #drawControlIconText() {
        const style = CONFIG.canvasTextStyle.clone();
        style.fontSize = Math.max(Math.round(canvas.dimensions.size * 0.36 * 12) / 12, 36);
        const text = new PreciseText(null, style);
        text.anchor.set(.5, 1);
        return text;
    }

    /**
     * Update the displayed ruler tooltip text
     * @protected
     */
    _refreshControlIconText() {
        const text = this.controlIconText;
        this.controlIconTextLabel.text = text;
        // todo fix text position
        this.controlIconTextLabel.position.set(0, 80);
    }
    //#endregion

    /** @inheritdoc */
    static embeddedName = "MeasuredTemplate";

    /* -------------------------------------------- */
    /*  Initial Drawing                             */
    /* -------------------------------------------- */

    /** @override */
    async _draw() {
        // Load Fill Texture
        if (this.document.texture) {
            this.texture = await loadTexture(this.document.texture, { fallback: "icons/svg/hazard.svg" });
        } else {
            this.texture = null;
        }

        // Template Shape
        this.template = this.addChild(new PIXI.Graphics());

        // Control Icon
        this.controlIcon = this.addChild(this.#createControlIcon());
        await this.controlIcon.draw();

        //#region BEGIN MY CODE
        this.controlIconTextLabel = this.addChild(this.#drawControlIconText());
        //#endregion

        // Ruler Text
        this.ruler = this.addChild(this.#drawRulerText());

        // Enable highlighting for this template
        canvas.interface.grid.addHighlightLayer(this.highlightId);
    }

    /* -------------------------------------------- */

    /**
     * Draw the ControlIcon for the MeasuredTemplate
     * @returns {ControlIcon}
     */
    #createControlIcon() {
        const size = Math.max(Math.round((canvas.dimensions.size * 0.5) / 20) * 20, 40);
        //#region override icon texture
        const iconTexture = this.document.flags?.[MODULE_NAME]?.icon || CONFIG.controlIcons.template;
        let icon = new ControlIcon({ texture: iconTexture, size: size });
        //#endregion
        icon.x -= (size * 0.5);
        icon.y -= (size * 0.5);

        //#region BEGIN MY CODE
        if (this.document.t === 'rect') {
            icon.x += this.baseDistance / canvas.scene.grid.distance * canvas.scene.grid.size / 2;
            icon.y += this.baseDistance / canvas.scene.grid.distance * canvas.scene.grid.size / 2;
        }
        //#endregion

        return icon;
    }

    /* -------------------------------------------- */

    /**
     * Draw the Text label used for the MeasuredTemplate
     * @returns {PreciseText}
     */
    #drawRulerText() {
        // nothing here is overridden, but because I'm overriding _draw I need to include this
        const style = CONFIG.canvasTextStyle.clone();
        style.fontSize = Math.max(Math.round(canvas.dimensions.size * 0.36 * 12) / 12, 36);
        const text = new PreciseText(null, style);
        text.anchor.set(0, 1);
        return text;
    }

    /* -------------------------------------------- */
    /*  Incremental Refresh                         */
    /* -------------------------------------------- */

    /** @override */
    _applyRenderFlags(flags) {
        if (flags.refreshState) this._refreshState();
        if (flags.refreshPosition) this._refreshPosition();
        if (flags.refreshShape) this._refreshShape();
        if (flags.refreshTemplate) this._refreshTemplate();
        if (flags.refreshGrid) this.highlightGrid();
        if (flags.refreshText) this._refreshRulerText();
        if (flags.refreshElevation) this._refreshElevation();

        // BEGIN MY CODE
        if (flags.refreshPosition) this._refreshControlIconText();
        // END MY CODE
    }

    /* -------------------------------------------- */

    /**
     * Compute the geometry for the template using its document data.
     * Subclasses can override this method to take control over how different shapes are rendered.
     * @returns {PIXI.Circle|PIXI.Rectangle|PIXI.Polygon}
     * @protected
     */
    _computeShape() {
        // let { angle, width, t } = this.document;
        // const { angle: direction, distance } = this.ray;
        // width *= canvas.dimensions.distancePixels;
        // switch (t) {
        //     case "circle":
        //         /** BEGIN MY CODE */
        //         if (this.shouldOverrideTokenEmanation) {
        //             return this._getEmanationShape();
        //         }
        //         else {
        //             /** END MY CODE */
        //             return this.constructor.getCircleShape(distance);
        //             /** BEGIN MY CODE */
        //         }
        //     /** END MY CODE */
        //     case "cone":
        //         return this.constructor.getConeShape(direction, angle, distance);
        //     case "rect":
        //         return this.constructor.getRectShape(direction, distance);
        //     case "ray":
        //         return this.constructor.getRayShape(direction, distance, width);
        // }

        const { t, distance, direction, angle, width } = this.document;
        switch (t) {
            case "circle":
                /** BEGIN MY CODE */
                if (this.shouldOverrideTokenEmanation) {
                    return this._getEmanationShape();
                }
                else {
                    /** END MY CODE */
                    return this.constructor.getCircleShape(distance);
                    /** BEGIN MY CODE */
                }
            /** END MY CODE */
            case "cone":
                return this.constructor.getConeShape(distance, direction, angle);
            case "rect":
                return this.constructor.getRectShape(distance, direction);
            case "ray":
                return this.constructor.getRayShape(distance, direction, width);
        }
    }

    /* -------------------------------------------- */

    /** BEGIN MY CODE - this method is 80ish% re-written */
    /**
     * Refresh the display of the template outline and shape.
     * Subclasses may override this method to take control over how the template is visually rendered.
     * @protected
     */
    _refreshTemplate() {
        if (!this.template) return;
        const template = this.template.clear();
        if (!this.isVisible || this.hideHighlight) {
            return;
        }

        const outlineAlpha = this.document.flags[MODULE_NAME]?.[CONSTS.flags.hideOutline]
            ? 0
            : 0.75;

        // Draw the Template outline
        template.lineStyle(this._borderThickness, this.document.borderColor, outlineAlpha).beginFill(0x000000, 0.0);

        // Fill Color or Texture
        if (this.texture) {
            const d = canvas.dimensions;
            let { direction, distance } = this.document;
            distance *= (d.size / d.distance);

            // add token radius to distance for emanations
            if (this.shouldOverrideTokenEmanation) {
                const { sizeSquares } = this.tokenSizeSquares;
                distance += d.size * sizeSquares / 2;
            }

            const textureAlpha = this.document.flags[MODULE_NAME]?.[CONSTS.flags.textureAlpha] || 0.5;
            const scaleOverride = this.document.flags[MODULE_NAME]?.[CONSTS.flags.textureScale] || 1;
            let textureSize = distance * scaleOverride;

            let xScale = 1;
            let yScale = 1;
            let xOffset = 0;
            let yOffset = 0;

            switch (this.document.t) {
                case 'circle':
                    {
                        xOffset = yOffset = textureSize;
                        xScale = yScale = textureSize * 2 / this.texture.width;
                    }
                    break;
                case 'cone':
                    {
                        textureSize /= 2;
                        yOffset = -textureSize;

                        xScale = yScale = textureSize * 2 / this.texture.width;
                    }
                    break;
                case 'rect':
                    {
                        // textureSize is basically the hypotenuse, multiple by cos/sin to get the width/height of the rect
                        xScale = textureSize * Math.cos(Math.toRadians(direction)) / this.texture.width;
                        yScale = yScale = textureSize * Math.sin(Math.toRadians(direction)) / this.texture.height;

                        // don't change angle of texture as the shape of the rect changes width/height
                        direction = 0;
                        template.rotation = this.actualRotation;
                    }
                    break;
                case 'line':
                case 'ray':
                    {
                        yOffset = this.document.width / d.distance * d.size / 2;

                        xScale = textureSize / this.texture.width;
                        yScale = textureSize / this.texture.height;

                        yScale *= this.document.width / this.document.distance;
                    }
                    break;
            }

            if (this.tempPosition) {
                xOffset += this.tempPosition.x;
                yOffset += this.tempPosition.y;
            }

            // if (this.tempXOffset) {
            //     xOffset += this.tempXOffset;
            // }
            // if (this.tempYOffset) {
            //     yOffset += this.tempYOffset;
            // }

            template.beginTextureFill({
                texture: this.texture,
                matrix: new PIXI.Matrix()
                    .scale(xScale, yScale)
                    .translate(xOffset, yOffset)
                    .rotate(Math.toRadians(direction)),
                alpha: textureAlpha,
            });
        }
        else {
            template.beginFill(0x000000, 0.0);
        }

        // Draw the shape
        template.drawShape(this.shape);

        let endx = this.ray.dx;
        let endy = this.ray.dy;

        if (this.shouldOverrideTokenEmanation) {
            endx += this.tokenSizeSquares.sizeSquares * canvas.scene.grid.size / 2;
        }

        // Draw origin and destination points
        template.lineStyle(this._borderThickness, 0x000000)
            .beginFill(0x000000, 0.5)
            .drawCircle(0, 0, 6)
            .drawCircle(endx, endy, 6)
            .endFill();
    }
    /** END MY CODE */

    /* -------------------------------------------- */

    /** BEGIN MY CODE */
    _getEmanationShape() {
        const { sizeSquares } = this.tokenSizeSquares;

        const dimensions = canvas.dimensions;
        let { distance: radius } = this.document;
        radius *= (dimensions.size / dimensions.distance);
        radius += dimensions.size * sizeSquares / 2;
        return new PIXI.RoundedRectangle(-radius, -radius, radius * 2, radius * 2, radius - dimensions.size * sizeSquares / 2);
    }

    // todo - dunno if I need this
    _createHollowCircle(radius, x, y) {
        let circle = new Graphics();
        circle.beginFill(color);
        circle.drawCircle(0, 0, radius);
        circle.beginHole();
        circle.drawCircle(0, 0, radius - 0.1);
        circle.endHole();
        circle.endFill();
        circle.x = x;
        circle.y = y;
        return circle;
    }

    _setPreviewVisibility(show) {
        this.document.flags[MODULE_NAME][CONSTS.flags.hidePreview] = !show;
        this.ruler.alpha = show ? 1 : 0;
    }

    _setErrorIconVisibility(show) {
        const existingIcon = this.document.flags[MODULE_NAME]?.icon;
        const icon = show ? existingIcon : 'icons/svg/hazard.svg';
        if (icon && icon !== this.controlIcon?.iconSrc) {
            this.document.flags[MODULE_NAME].icon = icon;
            if (this.controlIcon) {
                this.controlIcon.destroy();
            }
            this.controlIcon = this.addChild(this.#createControlIcon());
        }
    }
    /** END MY CODE */

    /* -------------------------------------------- */

    /**
     * Update the displayed ruler tooltip text
     * @protected
     */
    _refreshRulerText() {
        const { distance, t } = this.document;
        const grid = canvas.grid;
        if (t === "rect") {
            const { A: { x: x0, y: y0 }, B: { x: x1, y: y1 } } = this.ray;
            const dx = grid.measurePath([{ x: x0, y: y0 }, { x: x1, y: y0 }]).distance;
            const dy = grid.measurePath([{ x: x0, y: y0 }, { x: x0, y: y1 }]).distance;
            const w = Math.round(dx * 10) / 10;
            const h = Math.round(dy * 10) / 10;
            this.ruler.text = `${w}${grid.units} x ${h}${grid.units}`;
        } else {
            const r = Math.round(distance * 10) / 10;
            this.ruler.text = `${r}${grid.units}`;
        }

        //#region BEGIN MY CODE
        let endx = this.ray.dx;
        if (this.shouldOverrideTokenEmanation) {
            endx += this.tokenSizeSquares.sizeSquares * canvas.scene.grid.size / 2;
        }
        //#endregion

        this.ruler.position.set(endx + 10, this.ray.dy + 5);
    }

    /* -------------------------------------------- */

    /**
     * Highlight the grid squares which should be shown under the area of effect
     */
    highlightGrid() {
        // Clear the existing highlight layer
        canvas.interface.grid.clearHighlightLayer(this.highlightId);

        //#region BEGIN MY CODE
        const alpha = this.document.flags[MODULE_NAME]?.[CONSTS.flags.colorAlpha];
        //#endregion
        // Highlight colors
        const border = this.document.borderColor;
        const color = this.document.fillColor;

        // If we are in grid-less mode, highlight the shape directly
        if (canvas.grid.type === CONST.GRID_TYPES.GRIDLESS) {
            const shape = this._getGridHighlightShape();
            canvas.interface.grid.highlightPosition(this.highlightId, { border, color, shape, alpha });
        }

        // Otherwise, highlight specific grid positions
        else {
            const positions = this._getGridHighlightPositions();
            for (const { x, y } of positions) {
                canvas.interface.grid.highlightPosition(this.highlightId, { x, y, border, color, alpha });
            }
        }
    }

    /* -------------------------------------------- */

    /* -------------------------------------------- */
    /*  Interactivity                               */
    /* -------------------------------------------- */

    /**
    * Get highlighted square coordinates.
    *
    * Supports only circle, cone and ray templates.
    *
    * @protected
    * @override
    * @returns {Point[]} - Array of grid coordinates
    */
    _getGridHighlightPositions() {
        if (!this.id || !this.shape) return [];

        if (this.shouldOverrideTokenEmanation) {
            const { token, sizeSquares } = this.tokenSizeSquares;
            if (token && sizeSquares >= 2) {
                return this.#getEmanationHighlightSquares();
            }
        }

        return super._getGridHighlightPositions();
    }

    /** BEGIN MY CODE */
    clearTempate() {
        this.template.clear();
        canvas.interface.grid.clearHighlightLayer(this.highlightId);
        this.ruler.text = '';
        this.controlIcon.visible = false;
    }

    #getEmanationHighlightSquares() {
        const grid = canvas.grid;
        const d = canvas.dimensions;

        // Get number of rows and columns
        const nr = Math.ceil((this.document.distance * 1.5) / d.distance / (d.size / grid.sizeY));
        const nc = Math.ceil((this.document.distance * 1.5) / d.distance / (d.size / grid.sizeX));

        // Get the center of the grid position occupied by the template
        const result = [];
        const origins = this.tokenGridCorners;

        origins.forEach(({ x, y }) => {
            // const [cx, cy] = grid.getCenter(x, y);
            // const [col0, row0] = grid.getGridPositionFromPixels(cx, cy);
            const { x: cx, y: cy } = grid.getCenterPoint({ x, y });
            const { i: col0, j: row0 } = grid.getOffset({ x: cx, y: cy });

            const measureDistance = function (p0, p1) {
                const gs = canvas.dimensions.size;
                const ray = new Ray(p0, p1);
                // How many squares do we travel across to get there? If 2.3, we should count that as 3 instead of 2; hence, Math.ceil
                const nx = Math.ceil(Math.abs(ray.dx / gs));
                const ny = Math.ceil(Math.abs(ray.dy / gs));

                // Get the number of straight and diagonal moves
                const nDiagonal = Math.min(nx, ny);
                const nStraight = Math.abs(ny - nx);

                // Diagonals in PF pretty much count as 1.5 times a straight
                const distance = Math.floor(nDiagonal * 1.5 + nStraight);
                const distanceOnGrid = distance * canvas.dimensions.distance;
                return distanceOnGrid;
            };

            for (let a = -nc; a < nc; a++) {
                for (let b = -nr; b < nr; b++) {
                    // Position of cell's top-left corner, in pixels
                    const { x: gx, y: gy } = canvas.grid.getTopLeftPoint({ i: col0 + a, j: row0 + b });
                    // Position of cell's center, in pixels
                    const [cellCenterX, cellCenterY] = [gx + d.size * 0.5, gy + d.size * 0.5];

                    // Determine point of origin
                    const origin = { x, y };

                    // Determine point we're measuring the distance to - always in the center of a grid square
                    const destination = { x: cellCenterX, y: cellCenterY };

                    const distance = measureDistance(destination, origin);
                    if (distance <= this.document.distance) {
                        result.push({ x: gx, y: gy });
                    }
                }
            }
        });

        const filtered = [...(new Set(result.map(JSON.stringify)))].map(JSON.parse);
        return filtered;
    }

    /** END MY CODE */
}
