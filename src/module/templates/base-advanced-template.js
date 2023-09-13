/**
 * A type of Placeable Object which highlights an area of the grid as covered by some area of effect.
 * @category - Canvas
 * @see {@link MeasuredTemplateDocument}
 * @see {@link TemplateLayer}
 */
class MeasuredTemplate extends PlaceableObject {

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
        let icon = new ControlIcon({ texture: CONFIG.controlIcons.template, size: size });
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
        let { x, y } = this.document;
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
                return this.constructor.getCircleShape(distance);
            case "cone":
                return this.constructor.getConeShape(direction, angle, distance);
            case "rect":
                return this.constructor.getRectShape(direction, distance);
            case "ray":
                return this.constructor.getRayShape(direction, distance, width);
        }
    }

    /* -------------------------------------------- */

    /**
     * Refresh the display of the template outline and shape.
     * Subclasses may override this method to take control over how the template is visually rendered.
     * @protected
     */
    _refreshTemplate() {
        const t = this.template.clear();

        // Draw the Template outline
        t.lineStyle(this._borderThickness, this.borderColor, 0.75).beginFill(0x000000, 0.0);

        // Fill Color or Texture
        if (this.texture) t.beginTextureFill({ texture: this.texture });
        else t.beginFill(0x000000, 0.0);

        // Draw the shape
        t.drawShape(this.shape);

        // Draw origin and destination points
        t.lineStyle(this._borderThickness, 0x000000)
            .beginFill(0x000000, 0.5)
            .drawCircle(0, 0, 6)
            .drawCircle(this.ray.dx, this.ray.dy, 6)
            .endFill();
    }

    /* -------------------------------------------- */

    /**
     * Get a Circular area of effect given a radius of effect
     * @param {number} distance
     * @returns {PIXI.Circle}
     */
    static getCircleShape(distance) {
        return new PIXI.Circle(0, 0, distance);
    }

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
        let d = canvas.dimensions;
        let r = Ray.fromAngle(0, 0, direction, distance);
        let dx = Math.round(r.dx / (d.size / 2)) * (d.size / 2);
        let dy = Math.round(r.dy / (d.size / 2)) * (d.size / 2);
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
        let up = Ray.fromAngle(0, 0, direction - Math.toRadians(90), (width / 2) + 1);
        let down = Ray.fromAngle(0, 0, direction + Math.toRadians(90), (width / 2) + 1);
        let l1 = Ray.fromAngle(up.B.x, up.B.y, direction, distance + 1);
        let l2 = Ray.fromAngle(down.B.x, down.B.y, direction, distance + 1);

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
        let u = canvas.scene.grid.units;
        if (t === "rect") {
            let d = canvas.dimensions;
            let dx = Math.round(this.ray.dx) * (d.distance / d.size);
            let dy = Math.round(this.ray.dy) * (d.distance / d.size);
            let w = Math.round(dx * 10) / 10;
            let h = Math.round(dy * 10) / 10;
            text = `${w}${u} x ${h}${u}`;
        } else {
            let d = Math.round(distance * 10) / 10;
            text = `${d}${u}`;
        }
        this.ruler.text = text;
        this.ruler.position.set(this.ray.dx + 10, this.ray.dy + 5);
    }

    /* -------------------------------------------- */

    /**
     * Highlight the grid squares which should be shown under the area of effect
     */
    highlightGrid() {
        if (!this.visible) return;

        // Clear the existing highlight layer
        const grid = canvas.grid;
        const hl = grid.getHighlightLayer(this.highlightId);
        hl.clear();
        if (!this.isVisible) return;

        // Highlight colors
        const border = this.borderColor;
        const color = this.fillColor;

        // If we are in grid-less mode, highlight the shape directly
        if (grid.type === CONST.GRID_TYPES.GRIDLESS) {
            const shape = this._getGridHighlightShape();
            grid.grid.highlightGridPosition(hl, { border, color, shape });
        }

        // Otherwise, highlight specific grid positions
        else {
            const positions = this._getGridHighlightPositions();
            for (const { x, y } of positions) {
                grid.grid.highlightGridPosition(hl, { x, y, border, color });
            }
        }
    }

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
}
