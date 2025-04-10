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
        const gridSize = canvas.grid.h;

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
     * @returns { -1 | 0 | 1 }
     */
    _gridInterval() { return canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE ? 1 : 0; }

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
                        // textureSize is basically the hypotenuse, multiple by sin(45) to get the width/height of the rect (square)
                        textureSize *= Math.sin(Math.toRadians(45));
                        xScale = textureSize / this.texture.width;
                        yScale = textureSize / this.texture.height;

                        direction = 0;
                        textureSize /= 2;
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

    /**
     * Get an array of points which define top-left grid spaces to highlight for square or hexagonal grids.
     * @returns {Point[]}
     * @protected
     */
    _getGridHighlightPositions() {
        // TODO verify this
        const grid = canvas.grid.grid;
        const d = canvas.dimensions;
        const { x, y, distance } = this.document;

        // Get number of rows and columns
        const [maxRow, maxCol] = grid.getGridPositionFromPixels(d.width, d.height);
        let nRows = Math.ceil(((distance * 1.5) / d.distance) / (d.size / grid.h));
        let nCols = Math.ceil(((distance * 1.5) / d.distance) / (d.size / grid.w));
        [nRows, nCols] = [Math.min(nRows, maxRow), Math.min(nCols, maxCol)];

        // Get the offset of the template origin relative to the top-left grid space
        const [tx, ty] = grid.getTopLeft(x, y);
        const [row0, col0] = grid.getGridPositionFromPixels(tx, ty);
        const [hx, hy] = [Math.ceil(grid.w / 2), Math.ceil(grid.h / 2)];
        const isCenter = (x - tx === hx) && (y - ty === hy);

        // Identify grid coordinates covered by the template Graphics
        const positions = [];
        for (let r = -nRows; r < nRows; r++) {
            for (let c = -nCols; c < nCols; c++) {
                const [gx, gy] = grid.getPixelsFromGridPosition(row0 + r, col0 + c);
                const [testX, testY] = [(gx + hx) - x, (gy + hy) - y];
                const contains = ((r === 0) && (c === 0) && isCenter) || grid._testShape(testX, testY, this.shape);
                if (!contains) continue;
                positions.push({ x: gx, y: gy });
            }
        }
        return positions;
    }

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

    // getHighlightedSquares() {
    //     if (this.hideHighlight) {
    //         return [];
    //     }

    //     if (!this.id || !this.shape) return [];

    //     if (this.shouldOverrideTokenEmanation) {
    //         const { token, sizeSquares } = this.tokenSizeSquares;
    //         if (token && sizeSquares >= 2) {
    //             return this.#getEmanationHighlightSquares();
    //         }
    //     }

    //     const templateType = this.document.t;
    //     if (!game.settings.get("pf1", "measureStyle") || !["circle", "cone", "ray", "rect", "line"].includes(templateType)) return [];

    //     const grid = canvas.grid;
    //     // Size of each cell in pixels
    //     const gridSizePxBase = canvas.dimensions.size;
    //     // Offset for uneven grids
    //     const gridSizePxOffset = gridSizePxBase % 2;
    //     // Final grid size
    //     const gridSizePx = gridSizePxBase + gridSizePxOffset;
    //     const gridSizeUnits = canvas.dimensions.distance; // feet, meters, etc.

    //     const templateDirection = this.document.direction;
    //     const templateAngle = this.document.angle;

    //     // Parse rays as per Bresenham's algorithm
    //     if (templateType === "ray" || templateType === 'line') {
    //         const result = [];

    //         const line = (x0, y0, x1, y1) => {
    //             x0 = Math.floor(x0 / gridSizePx);
    //             x1 = Math.floor(x1 / gridSizePx);
    //             y0 = Math.floor(y0 / gridSizePx);
    //             y1 = Math.floor(y1 / gridSizePx);

    //             const dx = Math.abs(x1 - x0);
    //             const dy = Math.abs(y1 - y0);
    //             const sx = x0 < x1 ? 1 : -1;
    //             const sy = y0 < y1 ? 1 : -1;
    //             let err = dx - dy;

    //             while (!(x0 === x1 && y0 === y1)) {
    //                 result.push({ x: x0 * gridSizePx, y: y0 * gridSizePx });
    //                 const e2 = err << 1;
    //                 if (e2 > -dy) {
    //                     err -= dy;
    //                     x0 += sx;
    //                 }
    //                 if (e2 < dx) {
    //                     err += dx;
    //                     y0 += sy;
    //                 }
    //             }
    //         };

    //         // Get resulting squares
    //         let xOffset = 0;
    //         let yOffset = 0;
    //         if (90 <= templateDirection && templateDirection <= 270) {
    //             xOffset = -1;
    //         }
    //         if (180 <= templateDirection && templateDirection <= 360) {
    //             yOffset = -1;
    //         }

    //         const width = this.document.flags?.[MODULE_NAME]?.[CONSTS.flags.line.widthOverride] && this.document.flags?.[MODULE_NAME]?.[CONSTS.flags.line.width] || Settings.defaultLineWidth;
    //         const qty = Math.ceil(width / 5);

    //         const rad = Math.toRadians(templateDirection);
    //         const rad90 = Math.toRadians(90);
    //         let points = [];
    //         const isOdd = qty % 2;
    //         if (qty <= 1) {
    //             points.push({ x: this.document.x, y: this.document.y });
    //         } else if (isOdd) {
    //             points = [...new Array(Math.floor(qty / 2))].flatMap((_, i) => [{
    //                 x: this.document.x + gridSizePx * (i + 1) * Math.cos(rad + rad90),
    //                 y: this.document.y + gridSizePx * (i + 1) * Math.sin(rad + rad90),
    //             }, {
    //                 x: this.document.x + gridSizePx * (i + 1) * Math.cos(rad - rad90),
    //                 y: this.document.y + gridSizePx * (i + 1) * Math.sin(rad - rad90),
    //             }]);
    //             points.push({ x: this.document.x, y: this.document.y });
    //         } else {
    //             points = [...new Array(qty / 2)].flatMap((_, i) => [{
    //                 x: this.document.x + (gridSizePx * (i + 1) - gridSizePx / 2) * Math.cos(rad + rad90),
    //                 y: this.document.y + (gridSizePx * (i + 1) - gridSizePx / 2) * Math.sin(rad + rad90),
    //             }, {
    //                 x: this.document.x + (gridSizePx * (i + 1) - gridSizePx / 2) * Math.cos(rad - rad90),
    //                 y: this.document.y + (gridSizePx * (i + 1) - gridSizePx / 2) * Math.sin(rad - rad90),
    //             }]);
    //             points.push({ x: this.document.x, y: this.document.y });
    //         }

    //         points.forEach((point) => {
    //             // Extend ray by half a square for better highlight calculation
    //             const ray = Ray.fromAngle(point.x, point.y, this.ray.angle, this.ray.distance + gridSizePx / 2);
    //             line(ray.A.x + xOffset, ray.A.y + yOffset, ray.B.x, ray.B.y);
    //         })

    //         result.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
    //         const xs = new Set(result.map((p) => p.x));
    //         xs.forEach((x) => {
    //             const ys = new Set(result.filter((p) => p.x === x).map((p) => p.y));

    //             const yMax = Math.max(...ys);
    //             const yMin = Math.min(...ys);
    //             const expected = (yMax - yMin) / gridSizePx + 1;
    //             if (expected <= 2) {
    //                 return;
    //             }

    //             // skip first and last because they already exist
    //             for (let i = 1; i < expected - 1; i++) {
    //                 const y = yMin + i * gridSizePx;
    //                 if (ys.has(y)) {
    //                     continue;
    //                 }
    //                 result.push({ x, y });
    //             }
    //         });

    //         return result;
    //     }
    //     else if (templateType === "circle" || templateType === "cone") {
    //         // Get number of rows and columns
    //         const nr = Math.ceil((this.document.distance * 1.5) / gridSizeUnits / (gridSizePx / grid.h));
    //         const nc = Math.ceil((this.document.distance * 1.5) / gridSizeUnits / (gridSizePx / grid.w));

    //         // Get the center of the grid position occupied by the template
    //         const { x, y } = this.document;

    //         const [cx, cy] = grid.getCenter(x, y);
    //         const [col0, row0] = grid.grid.getGridPositionFromPixels(cx, cy);
    //         const minAngle = Math.normalizeDegrees(templateDirection - templateAngle / 2);
    //         const maxAngle = Math.normalizeDegrees(templateDirection + templateAngle / 2);

    //         // Origin offset multiplier
    //         const offsetMult = { x: 0, y: 0 };
    //         // Offset measurement for cones
    //         // Offset is to ensure that cones only start measuring from cell borders, as in https://www.d20pfsrd.com/magic/#Aiming_a_Spell
    //         if (templateType === "cone") {
    //             // Degrees anticlockwise from pointing right. In 45-degree increments from 0 to 360
    //             const dir = (templateDirection >= 0 ? 360 - templateDirection : -templateDirection) % 360;
    //             // If we're not on a border for X, offset by 0.5 or -0.5 to the border of the cell in the direction we're looking on X axis
    //             // /2 turns from 1/0/-1 to 0.5/0/-0.5
    //             offsetMult.x = x % gridSizePxBase != 0 ? Math.sign(Math.round(Math.cos(this.degToRad(dir)))) / 2 : 0;
    //             // Same for Y, but cos Y goes down on screens, we invert
    //             offsetMult.y = y % gridSizePxBase != 0 ? -Math.sign(Math.round(Math.sin(this.degToRad(dir)))) / 2 : 0;
    //         }

    //         const result = [];
    //         for (let a = -nc; a < nc; a++) {
    //             for (let b = -nr; b < nr; b++) {
    //                 // Position of cell's top-left corner, in pixels
    //                 const [gx, gy] = canvas.grid.grid.getPixelsFromGridPosition(col0 + a, row0 + b);
    //                 // Position of cell's center, in pixels
    //                 const [cellCenterX, cellCenterY] = [gx + gridSizePx * 0.5, gy + gridSizePx * 0.5];

    //                 // Determine point of origin
    //                 const origin = {
    //                     x: x + offsetMult.x * gridSizePxBase,
    //                     y: y + offsetMult.y * gridSizePxBase,
    //                 };

    //                 // Determine point we're measuring the distance to - always in the center of a grid square
    //                 const destination = { x: cellCenterX, y: cellCenterY };

    //                 if (templateType === "cone") {
    //                     const ray = new Ray(origin, destination);
    //                     const rayAngle = Math.normalizeDegrees(ray.angle / (Math.PI / 180));
    //                     if (ray.distance > 0 && !this.withinAngle(minAngle, maxAngle, rayAngle)) {
    //                         continue;
    //                     }
    //                 }

    //                 const distance = pf1.utils.measureDistance(origin, destination);
    //                 if (distance <= this.document.distance) {
    //                     result.push({ x: gx, y: gy });
    //                 }
    //             }
    //         }

    //         return result;
    //     }
    //     else if (templateType === "rect") {
    //         const { baseDistance } = this;
    //         const { x, y } = this.document;
    //         const nr = Math.ceil(baseDistance / gridSizeUnits);
    //         const nc = Math.ceil(baseDistance / gridSizeUnits);
    //         const result = [];
    //         for (let a = 0; a < nc; a++) {
    //             for (let b = 0; b < nr; b++) {
    //                 // Position of cell's top-left corner, in pixels
    //                 const [gx, gy] = [x + a * gridSizePx, y + b * gridSizePx];
    //                 result.push({ x: gx, y: gy });
    //             }
    //         }
    //         return result;
    //     }

    //     return [];
    // }

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
        const nr = Math.ceil((this.document.distance * 1.5) / d.distance / (d.size / grid.h));
        const nc = Math.ceil((this.document.distance * 1.5) / d.distance / (d.size / grid.w));

        // Get the center of the grid position occupied by the template
        const result = [];
        const origins = this.tokenGridCorners;

        origins.forEach(({ x, y }) => {
            const [cx, cy] = grid.getCenter(x, y);
            const [col0, row0] = grid.grid.getGridPositionFromPixels(cx, cy);

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
                    const [gx, gy] = canvas.grid.grid.getPixelsFromGridPosition(col0 + a, row0 + b);
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

    /**
     * Determine tokens residing within the template bounds, based on either grid higlight logic or token center.
     *
     * @public
     * @returns {Promise<Token[]>} Tokens sufficiently within the template.
     */
    async getTokensWithin() {
        const shape = this.document.t;
        const dimensions = this.scene.dimensions;
        const gridSizePx = dimensions.size;
        const gridSizeUnits = dimensions.distance;

        const getCenter = () => {
            if (shape !== "rect") return this.center;
            // Hack: Fix for Foundry bug where .center for rectangle template returns top-left corner instead.
            return {
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
            };
        };

        // Ensure shape and related data exists (e.g. this.ray) for getHighlightedSquares to work correctly.
        // this.width, this.height, etc. are wrong without this
        if (!this.shape) {
            this._applyRenderFlags({ refreshShape: true });
            // HACK: Wait for next tick, the template won't be finalized by Foundry until then.
            // Likely breaks with Foundry v12 with newer PIXI version
            await new Promise((resolve) => canvas.app.ticker.addOnce(() => resolve()), undefined, PIXI.UPDATE_PRIORITY.LOW);
        }

        const { distance, angle, direction } = this.document;

        const tCenter = getCenter();

        let maxDistance;
        switch (this.document.t) {
            case 'rect':
                maxDistance = this.baseDistance / gridSizeUnits * gridSizePx + gridSizePx;
                break;
            case 'ray':
                maxDistance = this.document.distance / gridSizeUnits * gridSizePx + gridSizePx;
                break;
            default:
                maxDistance = Math.max(this.height, this.width);
                break;
        }

        const relevantTokens = new Set(
            canvas.tokens.placeables.filter((t) => new Ray(t.center, tCenter).distance <= maxDistance + t.sizeErrorMargin)
        );

        const isLargeToken = (t) => t.document.width > 1 || t.document.height > 1;

        const results = new Set();

        // Special handling for gridless
        if (canvas.grid.type === CONST.GRID_TYPES.GRIDLESS) {
            if (shape === "ray") {
                const shapePoints = this._computeShape().points;
                const a = {
                    x: shapePoints[0] + this.document.x,
                    y: shapePoints[1] + this.document.y,
                };
                const b = {
                    x: shapePoints[2] + this.document.x,
                    y: shapePoints[3] + this.document.y,
                };
                const c = {
                    x: shapePoints[4] + this.document.x,
                    y: shapePoints[5] + this.document.y,
                };
                const d = {
                    x: shapePoints[6] + this.document.x,
                    y: shapePoints[7] + this.document.y,
                };

                const triangleArea = (aa, bb, cc) => Math.abs(aa.x * (bb.y - cc.y) + bb.x * (cc.y - aa.y) + cc.x * (aa.y - bb.y)) / 2;
                // const rayArea = Math.abs((b.x * a.y - a.x * b.y) + (c.x * b.y - b.x * c.y) + (a.x * c.y - c.x * a.y)) / 2;
                const rayArea = triangleArea(a, b, c) + triangleArea(a, c, d);
                const isWithinRay = (p) => {
                    const triangleAreas = triangleArea(a, p, b) + triangleArea(b, p, c) + triangleArea(c, p, d) + triangleArea(d, p, a);
                    return rayArea + 10 > triangleAreas;
                }

                for (const t of relevantTokens) {
                    const cells = isLargeToken(t) ? t.getOccupiedCells({ center: true }) : [t.center];
                    if (cells.some((c) => isWithinRay(c))) results.add(t);
                }
            }
            else {
                // Pre-calc cone data
                let minAngle, maxAngle;
                if (shape === "cone") {
                    minAngle = Math.normalizeDegrees(direction - angle / 2);
                    maxAngle = Math.normalizeDegrees(direction + angle / 2);
                }

                const withinCircle = (target) => {
                    const ray = new Ray(tCenter, target);
                    // Calculate ray length in relation to circle radius
                    const raySceneLength = (ray.distance / gridSizePx) * gridSizeUnits;
                    // Include this token if its center is within template radius
                    return raySceneLength <= distance + 1;
                };

                const withinCone = (target, minAngle, maxAngle) => {
                    const ray = new Ray(tCenter, target);
                    const rayAngle = Math.normalizeDegrees(Math.toDegrees(ray.angle));
                    const rayWithinAngle = this.withinAngle(minAngle, maxAngle, rayAngle);
                    // Calculate ray length in relation to circle radius
                    const raySceneLength = (ray.distance / gridSizePx) * gridSizeUnits;
                    // Include token if its within template distance and within the cone's angle
                    return rayWithinAngle && raySceneLength <= distance + 1;
                };

                // TODO: Test against vision points and ensure ~third of them are inside the template instead.
                for (const t of relevantTokens) {
                    const cells = isLargeToken(t) ? t.getOccupiedCells({ center: true }) : [t.center];

                    switch (shape) {
                        case "circle": {
                            if (cells.some((c) => withinCircle(c))) results.add(t);
                            break;
                        }
                        case "cone": {
                            if (cells.some((c) => withinCone(c, minAngle, maxAngle))) results.add(t);
                            break;
                        }
                    }
                }
            }
        }
        // Non-gridless
        else {
            const highlightSquares = this.getHighlightedSquares()
                .map(({ x, y }) => ({ x, y, width: gridSizePx, height: gridSizePx }));
            for (const highlightSquare of highlightSquares) {
                for (const token of relevantTokens) {
                    const tokenSquares = GridSquare.fromToken(token).containedSquares;
                    for (const tokenSquare of tokenSquares) {
                        if (this.withinRect(tokenSquare.center, highlightSquare)) {
                            results.add(token);
                            relevantTokens.delete(token);
                            break;
                        }
                    }
                }
            }
        }

        return Array.from(results);
    }

    /** END MY CODE */
}
