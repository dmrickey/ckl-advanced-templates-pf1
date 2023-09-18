import { CONSTS, MODULE_NAME } from '../../consts';


/**
 * A type of Placeable Object which highlights an area of the grid as covered by some area of effect.
 * @category - Canvas
 * @see {@link MeasuredTemplateDocument}
 * @see {@link TemplateLayer}
 */
export class MeasuredTemplatePFAdvanced extends pf1.canvas.MeasuredTemplatePF {

    // COPIED FROM PF1
    withinAngle(min, max, value) {
        min = Math.normalizeDegrees(min);
        max = Math.normalizeDegrees(max);
        value = Math.normalizeDegrees(value);

        if (min < max) return value >= min && value <= max;
        return value >= min || value <= max;
    }

    withinRect(point, rect) {
        return point.x >= rect.x && point.x < rect.x + rect.width && point.y >= rect.y && point.y < rect.y + rect.height;
    }

    degToRad(deg) {
        return deg * (Math.PI / 180);
    }
    // END COPIED FROM PF1

    /** BEGIN MY CODE */
    get shouldOverride() {
        return ['circle', 'cone'].includes(this.document.t);
    }

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

    get tokenSizeSquares() {
        const tokenId = this.document.flags?.[MODULE_NAME]?.tokenId;
        const token = canvas.tokens.placeables.find((x) => x.id === tokenId);
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
    /** END MY CODE */

    /**
     * The geometry shape used for testing point intersection
     * @type {PIXI.Circle | PIXI.Ellipse | PIXI.Polygon | PIXI.Rectangle | PIXI.RoundedRectangle}
     */
    shape;

    /**
     * The tiling texture used for this template, if any
     * @type {PIXI.Texture}
     */
    texture;

    /**
     * The template graphics
     * @type {PIXI.Graphics}
     */
    template;

    /**
     * The template control icon
     * @type {ControlIcon}
     */
    controlIcon;

    /**
     * The measurement ruler label
     * @type {PreciseText}
     */
    ruler;

    /**
     * Internal property used to configure the control border thickness
     * @type {number}
     * @protected
     */
    _borderThickness = 3;

    /** @inheritdoc */
    static embeddedName = "MeasuredTemplate";

    /** @override */
    static RENDER_FLAGS = {
        redraw: { propagate: ["refresh"] },
        refresh: { propagate: ["refreshState", "refreshShape"], alias: true },
        refreshState: {},
        refreshShape: { propagate: ["refreshPosition", "refreshGrid", "refreshText"] },
        refreshPosition: { propagate: ["refreshGrid"] },
        refreshGrid: {},
        refreshText: {}
    };

    /* -------------------------------------------- */
    /*  Properties                                  */
    /* -------------------------------------------- */

    /** @inheritdoc */
    get bounds() {
        const { x, y } = this.document;
        const d = canvas.dimensions;
        const r = this.document.distance * (d.size / d.distance);
        return new PIXI.Rectangle(x - r, y - r, 2 * r, 2 * r);
    }

    /* -------------------------------------------- */

    /**
     * A convenience accessor for the border color as a numeric hex code
     * @returns {number}
     */
    get borderColor() {
        return this.document.borderColor ? Color.fromString(this.document.borderColor).valueOf() : 0x000000;
    }

    /* -------------------------------------------- */

    /**
     * A convenience accessor for the fill color as a numeric hex code
     * @returns {number}
     */
    get fillColor() {
        return this.document.fillColor ? Color.fromString(this.document.fillColor).valueOf() : 0x000000;
    }

    /* -------------------------------------------- */

    /**
     * A flag for whether the current User has full ownership over the MeasuredTemplate document.
     * @type {boolean}
     */
    get owner() {
        return this.document.isOwner;
    }

    /* -------------------------------------------- */

    /**
     * Is this MeasuredTemplate currently visible on the Canvas?
     * @type {boolean}
     */
    get isVisible() {
        return !this.document.hidden || this.owner;
    }

    /* -------------------------------------------- */

    /**
     * A unique identifier which is used to uniquely identify related objects like a template effect or grid highlight.
     * @type {string}
     */
    get highlightId() {
        return this.objectId;
    }

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

        // handle preview ?

        // Control Icon
        this.controlIcon = this.addChild(this.#createControlIcon());
        await this.controlIcon.draw();

        // Ruler Text
        this.ruler = this.addChild(this.#drawRulerText());

        // Enable highlighting for this template
        canvas.grid.addHighlightLayer(this.highlightId);
    }

    /* -------------------------------------------- */

    /**
     * Draw the ControlIcon for the MeasuredTemplate
     * @returns {ControlIcon}
     */
    #createControlIcon() {
        const size = Math.max(Math.round((canvas.dimensions.size * 0.5) / 20) * 20, 40);
        const iconTexture = this.document.flags?.[MODULE_NAME]?.icon || CONFIG.controlIcons.template;
        let icon = new ControlIcon({ texture: iconTexture, size: size });
        icon.x -= (size * 0.5);
        icon.y -= (size * 0.5);
        return icon;
    }

    /* -------------------------------------------- */

    /**
     * Draw the Text label used for the MeasuredTemplate
     * @returns {PreciseText}
     */
    #drawRulerText() {
        const style = CONFIG.canvasTextStyle.clone();
        style.fontSize = Math.max(Math.round(canvas.dimensions.size * 0.36 * 12) / 12, 36);
        const text = new PreciseText(null, style);
        text.anchor.set(0, 1);
        return text;
    }

    /* -------------------------------------------- */

    /** @override */
    _destroy(options) {
        canvas.grid.destroyHighlightLayer(this.highlightId);
        this.texture?.destroy();
    }

    /* -------------------------------------------- */
    /*  Incremental Refresh                         */
    /* -------------------------------------------- */

    /** @override */
    _applyRenderFlags(flags) {
        if (flags.refreshState) this.#refreshState();
        if (flags.refreshPosition) this.#refreshPosition();
        if (flags.refreshShape) this.#refreshShape();
        if (flags.refreshGrid) this.highlightGrid();
        if (flags.refreshText) this._refreshRulerText();
    }

    /* -------------------------------------------- */

    /**
     * Refresh the displayed state of the MeasuredTemplate.
     * This refresh occurs when the user interaction state changes.
     */
    #refreshState() {

        // Template Visibility
        this.visible = this.isVisible && !this.hasPreview;

        // Control Icon Visibility
        const isHidden = this.document.hidden;
        this.controlIcon.refresh({
            visible: this.visible && this.layer.active && this.document.isOwner,
            iconColor: isHidden ? 0xFF3300 : 0xFFFFFF,
            borderColor: isHidden ? 0xFF3300 : 0xFF5500,
            borderVisible: this.hover || this.layer.highlightObjects
        });

        // Alpha transparency
        const alpha = isHidden ? 0.5 : 1;
        this.template.alpha = alpha;
        this.ruler.alpha = alpha;
        const highlightLayer = canvas.grid.getHighlightLayer(this.highlightId);
        highlightLayer.visible = this.visible;
        highlightLayer.alpha = alpha;
        this.alpha = this._getTargetAlpha();

        // Ruler Visibility
        this.ruler.visible = this.visible && this.layer.active;
    }

    /* -------------------------------------------- */

    /** @override */
    _getTargetAlpha() {
        return this.isPreview ? 0.8 : 1.0;
    }

    /* -------------------------------------------- */

    /**
     * Refresh the position of the MeasuredTemplate
     */
    #refreshPosition() {
        const { x, y } = this.document;
        this.position.set(x, y);
    }

    /* -------------------------------------------- */

    /**
     * Refresh the underlying geometric shape of the MeasuredTemplate.
     */
    #refreshShape() {
        let { x, y, direction, distance } = this.document;
        distance *= canvas.dimensions.distancePixels;
        direction = Math.toRadians(direction);

        // Create a Ray from origin to endpoint
        this.ray = Ray.fromAngle(x, y, direction, distance);

        // Get the Template shape
        this.shape = this._computeShape();

        // Refresh the drawn template shape
        this._refreshTemplate();

        // todo
        // might need to add in grid highlight here

        // todo?
        // // Update the HUD
        // this._refreshControlIcon();
        // this._refreshRulerText();
    }

    /* -------------------------------------------- */

    /**
     * Compute the geometry for the template using its document data.
     * Subclasses can override this method to take control over how different shapes are rendered.
     * @returns {PIXI.Circle|PIXI.Rectangle|PIXI.Polygon}
     * @protected
     */
    _computeShape() {
        let { angle, width, t } = this.document;
        const { angle: direction, distance } = this.ray;
        width *= canvas.dimensions.distancePixels;
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
                return this.constructor.getConeShape(direction, angle, distance);
            case "rect":
                return this.constructor.getRectShape(direction, distance);
            case "ray":
                return this.constructor.getRayShape(direction, distance, width);
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
        const template = this.template.clear();
        if (!this.isVisible || this.document.flags?.[MODULE_NAME]?.[CONSTS.flags.hidePreview]) {
            return;
        }

        const outlineAlpha = this.document.flags[MODULE_NAME]?.[CONSTS.flags.hideOutline]
            ? 0
            : 0.75;

        // Draw the Template outline
        template.lineStyle(this._borderThickness, this.borderColor, outlineAlpha).beginFill(0x000000, 0.0);

        // Fill Color or Texture
        if (this.texture) {
            let xOffset = true;
            let yOffset = true;

            const d = canvas.dimensions;
            let { direction, distance } = this.document;
            distance *= (d.size / d.distance);
            if (this.shouldOverrideTokenEmanation) {
                const { sizeSquares } = this.tokenSizeSquares;
                distance += d.size * sizeSquares / 2;
            }

            const textureAlpha = this.document.flags[MODULE_NAME]?.[CONSTS.flags.textureAlpha] || 0.5;
            const scaleOverride = this.document.flags[MODULE_NAME]?.[CONSTS.flags.textureScale] || 1;
            let textureSize = distance * scaleOverride;

            if (this.document.t === 'cone') {
                textureSize /= 2;
                xOffset = false;
            }

            const tileTexture = false; // todo
            const scale = tileTexture ? 1 : textureSize * 2 / this.texture.width;
            const offset = tileTexture ? 0 : (textureSize);
            template.beginTextureFill({
                texture: this.texture,
                matrix: new PIXI.Matrix()
                    .scale(scale, scale)
                    .translate(xOffset ? -offset : 0, yOffset ? -offset : 0)
                    .rotate(direction),
                alpha: textureAlpha,
            });
        }
        else {
            template.beginFill(0x000000, 0.0);
        }

        // Draw the shape
        template.drawShape(this.shape);

        // Draw origin and destination points
        template.lineStyle(this._borderThickness, 0x000000)
            .beginFill(0x000000, 0.5)
            .drawCircle(0, 0, 6)
            .drawCircle(this.ray.dx, this.ray.dy, 6)
            .endFill();
    }
    /** END MY CODE */

    /* -------------------------------------------- */

    /**
     * Get a Circular area of effect given a radius of effect
     * @param {number} distance
     * @returns {PIXI.Circle}
     */
    static getCircleShape(distance) {
        return new PIXI.Circle(0, 0, distance);
    }

    /** BEGIN MY CODE */
    _getEmanationShape() {
        const { sizeSquares } = this.tokenSizeSquares;

        const dimensions = canvas.dimensions;
        let { distance: radius } = this.document;
        radius *= (dimensions.size / dimensions.distance);
        radius += dimensions.size * sizeSquares / 2;
        return new PIXI.RoundedRectangle(-radius, -radius, radius * 2, radius * 2, radius - dimensions.size * sizeSquares / 2);
    }

    _setPreviewVisibility(show) {
        this.document.flags[MODULE_NAME][CONSTS.flags.hidePreview] = !show;
        const existingIcon = this.document.flags[MODULE_NAME].icon;
        const icon = show ? existingIcon : 'icons/svg/hazard.svg';
        this.ruler.alpha = show ? 1 : 0;

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
     * Get a Conical area of effect given a direction, angle, and distance
     * @param {number} direction
     * @param {number} angle
     * @param {number} distance
     * @returns {PIXI.Polygon}
     */
    static getConeShape(direction, angle, distance) {
        angle = angle || 90;
        const coneType = game.settings.get("core", "coneTemplateType");

        // For round cones - approximate the shape with a ray every 3 degrees
        let angles;
        if (coneType === "round") {
            const da = Math.min(angle, 3);
            angles = Array.fromRange(Math.floor(angle / da)).map(a => (angle / -2) + (a * da)).concat([angle / 2]);
        }

        // For flat cones, direct point-to-point
        else {
            angles = [(angle / -2), (angle / 2)];
            distance /= Math.cos(Math.toRadians(angle / 2));
        }

        // Get the cone shape as a polygon
        const rays = angles.map(a => Ray.fromAngle(0, 0, direction + Math.toRadians(a), distance + 1));
        const points = rays.reduce((arr, r) => {
            return arr.concat([r.B.x, r.B.y]);
        }, [0, 0]).concat([0, 0]);
        return new PIXI.Polygon(points);
    }

    /* -------------------------------------------- */

    /**
     * Get a Rectangular area of effect given a width and height
     * @param {number} direction
     * @param {number} distance
     * @returns {PIXI.Rectangle}
     */
    static getRectShape(direction, distance) {
        const d = canvas.dimensions;
        const r = Ray.fromAngle(0, 0, direction, distance);
        const dx = Math.round(r.dx / (d.size / 2)) * (d.size / 2);
        const dy = Math.round(r.dy / (d.size / 2)) * (d.size / 2);
        return new PIXI.Rectangle(0, 0, dx, dy).normalize();
    }

    /* -------------------------------------------- */

    /**
     * Get a rotated Rectangular area of effect given a width, height, and direction
     * @param {number} direction
     * @param {number} distance
     * @param {number} width
     * @returns {PIXI.Polygon}
     */
    static getRayShape(direction, distance, width) {
        const up = Ray.fromAngle(0, 0, direction - Math.toRadians(90), (width / 2) + 1);
        const down = Ray.fromAngle(0, 0, direction + Math.toRadians(90), (width / 2) + 1);
        const l1 = Ray.fromAngle(up.B.x, up.B.y, direction, distance + 1);
        const l2 = Ray.fromAngle(down.B.x, down.B.y, direction, distance + 1);

        // Create Polygon shape and draw
        const points = [down.B.x, down.B.y, up.B.x, up.B.y, l1.B.x, l1.B.y, l2.B.x, l2.B.y];
        return new PIXI.Polygon(points);
    }

    /* -------------------------------------------- */

    /**
     * Update the displayed ruler tooltip text
     * @protected
     */
    _refreshRulerText() {
        let text;
        const { distance, t } = this.document;
        const u = canvas.scene.grid.units;
        if (this.document.flags[MODULE_NAME][CONSTS.flags.hidePreview]) {
            text = '';
        }
        else if (t === "rect") {
            const d = canvas.dimensions;
            const dx = Math.round(this.ray.dx) * (d.distance / d.size);
            const dy = Math.round(this.ray.dy) * (d.distance / d.size);
            const w = Math.round(dx * 10) / 10;
            const h = Math.round(dy * 10) / 10;
            text = `${w}${u} x ${h}${u}`;
        } else {
            const d = Math.round(distance * 10) / 10;
            text = `${d}${u}`;
        }
        this.ruler.text = text;
        this.ruler.position.set(this.ray.dx + 10, this.ray.dy + 5);
    }

    /* -------------------------------------------- */

    /**
     * Highlight the grid squares which should be shown under the area of effect
     */
    /** BEGIN MY CODE */
    highlightGrid() {
        const usePf1Highlight = game.settings.get("pf1", "measureStyle")
            && ["circle", "cone", "ray"].includes(this.document.t);

        // Only highlight for objects which have a defined shape
        if (!this.id || !this.shape) {
            return;
        }

        // Clear existing highlight
        const highlightLayer = this.getHighlightLayer();
        highlightLayer.clear();
        if (!this.isVisible) {
            return;
        }

        // highlightGridPosition has a default so undefined is fine to pass in
        const alpha = this.document.flags[MODULE_NAME]?.[CONSTS.flags.colorAlpha];
        const border = this.borderColor;
        const fillColor = this.fillColor;
        const grid = canvas.grid;

        // If we are in grid-less mode, highlight the shape directly
        if (grid.type === CONST.GRID_TYPES.GRIDLESS) {
            const highlightShape = this._getGridHighlightShape();
            grid.grid.highlightGridPosition(highlightLayer, {
                alpha,
                border,
                color: fillColor,
                shape: highlightShape,
            });
        }

        // Otherwise, highlight specific grid squares
        else {
            const highlightSquares = usePf1Highlight ? this.getHighlightedSquares() : this._getGridHighlightPositions();
            for (const { x, y } of highlightSquares) {
                grid.grid.highlightGridPosition(highlightLayer, {
                    alpha,
                    border,
                    color: fillColor,
                    x,
                    y,
                });
            }
        }
    }
    /** END MY CODE */

    /* -------------------------------------------- */

    /**
     * Get the shape to highlight on a Scene which uses grid-less mode.
     * @returns {PIXI.Polygon|PIXI.Circle|PIXI.Rectangle}
     * @protected
     */
    _getGridHighlightShape() {
        const shape = this.shape.clone();
        if ("points" in shape) {
            shape.points = shape.points.map((p, i) => {
                if (i % 2) return this.y + p;
                else return this.x + p;
            });
        } else {
            shape.x += this.x;
            shape.y += this.y;
        }
        return shape;
    }

    /* -------------------------------------------- */

    /**
     * Get an array of points which define top-left grid spaces to highlight for square or hexagonal grids.
     * @returns {Point[]}
     * @protected
     */
    _getGridHighlightPositions() {
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
    /*  Methods                                     */
    /* -------------------------------------------- */

    /** @override */
    async rotate(angle, snap) {
        const direction = this._updateRotation({ angle, snap });
        return this.document.update({ direction });
    }

    /* -------------------------------------------- */
    /*  Document Event Handlers                     */
    /* -------------------------------------------- */

    /** @override */
    _onUpdate(data, options, userId) {
        super._onUpdate(data, options, userId);

        // Full re-draw
        const changed = new Set(Object.keys(data));
        if (changed.has("texture")) return this.renderFlags.set({ redraw: true });

        // Incremental Refresh
        this.renderFlags.set({
            refreshState: changed.has("hidden"),
            refreshShape: ["angle", "direction", "distance", "width", "t"].some(k => changed.has(k)),
            refreshPosition: ["x", "y", "direction", "distance"].some(k => changed.has(k)),
            refreshGrid: ["hidden", "borderColor", "fillColor"].some(k => changed.has(k))
        });
    }

    /* -------------------------------------------- */
    /*  Interactivity                               */
    /* -------------------------------------------- */

    /** @override */
    _canControl(user, event) {
        if (!this.layer.active || this.isPreview) return false;
        return user.isGM || (user === this.document.user);
    }

    /** @inheritdoc */
    _canHUD(user, event) {
        return this.owner; // Allow template owners to right-click
    }

    /** @inheritdoc */
    _canConfigure(user, event) {
        return false; // Double-right does nothing
    }

    /** @override */
    _canView(user, event) {
        return this._canControl(user, event);
    }

    /** @inheritdoc */
    _onClickRight(event) {
        this.document.update({ hidden: !this.document.hidden });
    }

    getHighlightedSquares() {
        if (this.hideHighlight) {
            return [];
        }

        if (!this.id || !this.shape) return [];

        /** BEGIN MY CODE */
        if (this.shouldOverrideTokenEmanation) {
            const { token, sizeSquares } = this.tokenSizeSquares;
            if (token && sizeSquares >= 2) {
                return this.#getEmanationHighlightSquares();
            }
        }
        /** END MY CODE */

        const templateType = this.document.t;
        if (!game.settings.get("pf1", "measureStyle") || !["circle", "cone", "ray"].includes(templateType)) return [];

        const grid = canvas.grid,
            // Size of each cell in pixels
            gridSizePxBase = canvas.dimensions.size,
            // Offset for uneven grids
            gridSizePxOffset = gridSizePxBase % 2,
            // Final grid size
            gridSizePx = gridSizePxBase + gridSizePxOffset,
            gridSizeUnits = canvas.dimensions.distance; // feet, meters, etc.

        const templateDirection = this.document.direction,
            templateAngle = this.document.angle;

        // Parse rays as per Bresenham's algorithm
        if (templateType === "ray") {
            const result = [];

            const line = (x0, y0, x1, y1) => {
                x0 = Math.floor(Math.floor(x0) / gridSizePx);
                x1 = Math.floor(Math.floor(x1) / gridSizePx);
                y0 = Math.floor(Math.floor(y0) / gridSizePx);
                y1 = Math.floor(Math.floor(y1) / gridSizePx);

                const dx = Math.abs(x1 - x0);
                const dy = Math.abs(y1 - y0);
                const sx = x0 < x1 ? 1 : -1;
                const sy = y0 < y1 ? 1 : -1;
                let err = dx - dy;

                while (!(x0 === x1 && y0 === y1)) {
                    result.push({ x: x0 * gridSizePx, y: y0 * gridSizePx });
                    const e2 = err << 1;
                    if (e2 > -dy) {
                        err -= dy;
                        x0 += sx;
                    }
                    if (e2 < dx) {
                        err += dx;
                        y0 += sy;
                    }
                }
            };

            // Extend ray by half a square for better highlight calculation
            const ray = Ray.fromAngle(this.ray.A.x, this.ray.A.y, this.ray.angle, this.ray.distance + gridSizePx / 2);

            // Get resulting squares
            line(ray.A.x, ray.A.y, ray.B.x, ray.B.y);

            return result;
        }

        // Get number of rows and columns
        const nr = Math.ceil((this.document.distance * 1.5) / gridSizeUnits / (gridSizePx / grid.h)),
            nc = Math.ceil((this.document.distance * 1.5) / gridSizeUnits / (gridSizePx / grid.w));

        // Get the center of the grid position occupied by the template
        const { x, y } = this.document;

        const [cx, cy] = grid.getCenter(x, y),
            [col0, row0] = grid.grid.getGridPositionFromPixels(cx, cy),
            minAngle = Math.normalizeDegrees(templateDirection - templateAngle / 2),
            maxAngle = Math.normalizeDegrees(templateDirection + templateAngle / 2);

        // Origin offset multiplier
        const offsetMult = { x: 0, y: 0 };
        // Offset measurement for cones
        // Offset is to ensure that cones only start measuring from cell borders, as in https://www.d20pfsrd.com/magic/#Aiming_a_Spell
        if (templateType === "cone") {
            // Degrees anticlockwise from pointing right. In 45-degree increments from 0 to 360
            const dir = (templateDirection >= 0 ? 360 - templateDirection : -templateDirection) % 360;
            // If we're not on a border for X, offset by 0.5 or -0.5 to the border of the cell in the direction we're looking on X axis
            // /2 turns from 1/0/-1 to 0.5/0/-0.5
            offsetMult.x = x % gridSizePxBase != 0 ? Math.sign(Math.round(Math.cos(this.degToRad(dir)))) / 2 : 0;
            // Same for Y, but cos Y goes down on screens, we invert
            offsetMult.y = y % gridSizePxBase != 0 ? -Math.sign(Math.round(Math.sin(this.degToRad(dir)))) / 2 : 0;
        }

        const result = [];
        for (let a = -nc; a < nc; a++) {
            for (let b = -nr; b < nr; b++) {
                // Position of cell's top-left corner, in pixels
                const [gx, gy] = canvas.grid.grid.getPixelsFromGridPosition(col0 + a, row0 + b);
                // Position of cell's center, in pixels
                const [cellCenterX, cellCenterY] = [gx + gridSizePx * 0.5, gy + gridSizePx * 0.5];

                // Determine point of origin
                const origin = {
                    x: x + offsetMult.x * gridSizePxBase,
                    y: y + offsetMult.y * gridSizePxBase,
                };

                // Determine point we're measuring the distance to - always in the center of a grid square
                const destination = { x: cellCenterX, y: cellCenterY };

                if (templateType === "cone") {
                    const ray = new Ray(origin, destination);
                    const rayAngle = Math.normalizeDegrees(ray.angle / (Math.PI / 180));
                    if (ray.distance > 0 && !this.withinAngle(minAngle, maxAngle, rayAngle)) {
                        continue;
                    }
                }

                const distance = pf1.utils.measureDistance(origin, destination);
                if (distance <= this.document.distance) {
                    result.push({ x: gx, y: gy });
                }
            }
        }

        return result;
    }

    /** BEGIN MY CODE */
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
    /** END MY CODE */

    /**
     * Determine tokens residing within the template bounds, based on either grid higlight logic or token center.
     *
     * @public
     * @returns {Token[]} Tokens sufficiently within the template.
     */
    getTokensWithin() {
        const shape = this.document.t;
        const dimensions = this.scene.dimensions;
        const gridSizePx = dimensions.size;
        const gridSizeUnits = dimensions.distance;

        const maxDistance = Math.max(this.height, this.width);
        // Get tokens within max potential distance from the template
        const relevantTokens = new Set(
            canvas.tokens.placeables.filter((t) => new Ray(t.center, this.center).distance + t.sizeErrorMargin <= maxDistance)
        );

        const result = new Set();
        // Special handling for gridless
        if (canvas.grid.type === CONST.GRID_TYPES.GRIDLESS && ["circle", "cone", "rect"].includes(shape)) {
            // TODO: Test against vision points and ensure ~third of them are inside the template instead.
            // BUG: Behaves incorrectly with large tokens
            for (const t of relevantTokens) {
                switch (shape) {
                    case "circle": {
                        const ray = new Ray(this.center, t.center);
                        // Calculate ray length in relation to circle radius
                        const raySceneLength = (ray.distance / gridSizePx) * gridSizeUnits;
                        // Include this token if its center is within template radius
                        if (raySceneLength <= this.document.distance) result.add(t);
                        break;
                    }
                    case "cone": {
                        const templateDirection = this.document.direction;
                        const templateAngle = this.document.angle;
                        const minAngle = Math.normalizeDegrees(templateDirection - templateAngle / 2);
                        const maxAngle = Math.normalizeDegrees(templateDirection + templateAngle / 2);

                        const ray = new Ray(this.center, t.center);
                        const rayAngle = Math.normalizeDegrees(Math.toDegrees(ray.angle));

                        const rayWithinAngle = this.withinAngle(minAngle, maxAngle, rayAngle);
                        // Calculate ray length in relation to circle radius
                        const raySceneLength = (ray.distance / gridSizePx) * gridSizeUnits;
                        // Include token if its within template distance and within the cone's angle
                        if (rayWithinAngle && raySceneLength <= this.document.distance) result.add(t);
                        break;
                    }
                    case "rect": {
                        const rect = {
                            x: this.x,
                            y: this.y,
                            width: this.width,
                            height: this.width,
                        };
                        if (this.withinRect(t.center, rect)) {
                            result.add(t);
                        }
                        break;
                    }
                }
            }
        }
        // Non-gridless
        else {
            const highlightSquares = this.getHighlightLayer().positions.map((p) => {
                const [x, y] = p.split(".");
                return { x: Number(x), y: Number(y), width: gridSizePx, height: gridSizePx };
            });

            for (const square of highlightSquares) {
                for (const t of relevantTokens) {
                    if (this.withinRect(t.center, square)) {
                        result.add(t);
                        relevantTokens.delete(t);
                    }
                }
            }
        }

        return Array.from(result);
    }

    getHighlightLayer() {
        return canvas.grid.getHighlightLayer(this.highlightId);
    }
}
