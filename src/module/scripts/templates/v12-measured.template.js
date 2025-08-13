
pf1.canvas.MeasuredTemplatePF = MeasuredTemplatePF;
class MeasuredTemplatePF extends MeasuredTemplate { }

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
        refresh: { propagate: ["refreshState", "refreshPosition", "refreshShape", "refreshElevation"], alias: true },
        refreshState: {},
        refreshPosition: { propagate: ["refreshGrid"] },
        refreshShape: { propagate: ["refreshTemplate", "refreshGrid", "refreshText"] },
        refreshTemplate: {},
        refreshGrid: {},
        refreshText: {},
        refreshElevation: {}
    };

    /* -------------------------------------------- */
    /*  Properties                                  */
    /* -------------------------------------------- */

    /**
     * A convenient reference for whether the current User is the author of the MeasuredTemplate document.
     * @type {boolean}
     */
    get isAuthor() {
        return this.document.isAuthor;
    }

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
     * Is this MeasuredTemplate currently visible on the Canvas?
     * @type {boolean}
     */
    get isVisible() {
        return !this.document.hidden || this.isAuthor || game.user.isGM;
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
    async _draw(options) {

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
        canvas.interface.grid.addHighlightLayer(this.highlightId);
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
        canvas.interface.grid.destroyHighlightLayer(this.highlightId);
        this.texture?.destroy();
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
    }

    /* -------------------------------------------- */

    /**
     * Refresh the displayed state of the MeasuredTemplate.
     * This refresh occurs when the user interaction state changes.
     * @protected
     */
    _refreshState() {

        // Template Visibility
        const wasVisible = this.visible;
        this.visible = this.isVisible && !this.hasPreview;
        if (this.visible !== wasVisible) MouseInteractionManager.emulateMoveEvent();

        // Sort on top of others on hover
        this.zIndex = this.hover ? 1 : 0;

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
        const highlightLayer = canvas.interface.grid.getHighlightLayer(this.highlightId);
        highlightLayer.visible = this.visible;
        // FIXME the elevation is not considered in sort order of the highlight layers
        highlightLayer.zIndex = this.document.sort;
        highlightLayer.alpha = alpha;
        this.alpha = this._getTargetAlpha();

        // Ruler Visibility
        this.ruler.visible = this.visible && this.layer.active;
    }

    /* -------------------------------------------- */

    /**
     * Refresh the elevation of the control icon.
     * @protected
     */
    _refreshElevation() {
        this.controlIcon.elevation = this.document.elevation;
    }

    /* -------------------------------------------- */

    /** @override */
    _getTargetAlpha() {
        return this.isPreview ? 0.8 : 1.0;
    }

    /* -------------------------------------------- */

    /**
     * Refresh the position of the MeasuredTemplate
     * @protected
     */
    _refreshPosition() {
        const { x, y } = this.document;
        if ((this.position.x !== x) || (this.position.y !== y)) MouseInteractionManager.emulateMoveEvent();
        this.position.set(x, y);
    }

    /* -------------------------------------------- */

    /**
     * Refresh the underlying geometric shape of the MeasuredTemplate.
     * @protected
     */
    _refreshShape() {
        let { x, y, direction, distance } = this.document;

        // Grid type
        if (game.settings.get("core", "gridTemplates")) {
            this.ray = new Ray({ x, y }, canvas.grid.getTranslatedPoint({ x, y }, direction, distance));
        }

        // Euclidean type
        else {
            this.ray = Ray.fromAngle(x, y, Math.toRadians(direction), distance * canvas.dimensions.distancePixels);
        }

        // Get the Template shape
        this.shape = this._computeShape();
    }

    /* -------------------------------------------- */

    /**
     * Compute the geometry for the template using its document data.
     * Subclasses can override this method to take control over how different shapes are rendered.
     * @returns {PIXI.Circle|PIXI.Rectangle|PIXI.Polygon}
     * @protected
     */
    _computeShape() {
        const { t, distance, direction, angle, width } = this.document;
        switch (t) {
            case "circle":
                return this.constructor.getCircleShape(distance);
            case "cone":
                return this.constructor.getConeShape(distance, direction, angle);
            case "rect":
                return this.constructor.getRectShape(distance, direction);
            case "ray":
                return this.constructor.getRayShape(distance, direction, width);
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
        t.lineStyle(this._borderThickness, this.document.borderColor, 0.75).beginFill(0x000000, 0.0);

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
     * @param {number} distance    The radius of the circle in grid units
     * @returns {PIXI.Circle|PIXI.Polygon}
     */
    static getCircleShape(distance) {

        // Grid circle
        if (game.settings.get("core", "gridTemplates")) {
            return new PIXI.Polygon(canvas.grid.getCircle({ x: 0, y: 0 }, distance));
        }

        // Euclidean circle
        return new PIXI.Circle(0, 0, distance * canvas.dimensions.distancePixels);
    }

    /* -------------------------------------------- */

    /**
     * Get a Conical area of effect given a direction, angle, and distance
     * @param {number} distance     The radius of the cone in grid units
     * @param {number} direction    The direction of the cone in degrees
     * @param {number} angle        The angle of the cone in degrees
     * @returns {PIXI.Polygon|PIXI.Circle}
     */
    static getConeShape(distance, direction, angle) {

        // Grid cone
        if (game.settings.get("core", "gridTemplates")) {
            return new PIXI.Polygon(canvas.grid.getCone({ x: 0, y: 0 }, distance, direction, angle));
        }

        // Euclidean cone
        if ((distance <= 0) || (angle <= 0)) return new PIXI.Polygon();
        distance *= canvas.dimensions.distancePixels;
        const coneType = game.settings.get("core", "coneTemplateType");

        // For round cones - approximate the shape with a ray every 3 degrees
        let angles;
        if (coneType === "round") {
            if (angle >= 360) return new PIXI.Circle(0, 0, distance);
            const da = Math.min(angle, 3);
            angles = Array.fromRange(Math.floor(angle / da)).map(a => (angle / -2) + (a * da)).concat([angle / 2]);
        }

        // For flat cones, direct point-to-point
        else {
            angle = Math.min(angle, 179);
            angles = [(angle / -2), (angle / 2)];
            distance /= Math.cos(Math.toRadians(angle / 2));
        }

        // Get the cone shape as a polygon
        const rays = angles.map(a => Ray.fromAngle(0, 0, Math.toRadians(direction + a), distance));
        const points = rays.reduce((arr, r) => {
            return arr.concat([r.B.x, r.B.y]);
        }, [0, 0]).concat([0, 0]);
        return new PIXI.Polygon(points);
    }

    /* -------------------------------------------- */

    /**
     * Get a Rectangular area of effect given a width and height
     * @param {number} distance     The length of the diagonal in grid units
     * @param {number} direction    The direction of the diagonal in degrees
     * @returns {PIXI.Rectangle}
     */
    static getRectShape(distance, direction) {
        let endpoint;

        // Grid rectangle
        if (game.settings.get("core", "gridTemplates")) {
            endpoint = canvas.grid.getTranslatedPoint({ x: 0, y: 0 }, direction, distance);
        }

        // Euclidean rectangle
        else endpoint = Ray.fromAngle(0, 0, Math.toRadians(direction), distance * canvas.dimensions.distancePixels).B;

        return new PIXI.Rectangle(0, 0, endpoint.x, endpoint.y).normalize();
    }

    /* -------------------------------------------- */

    /**
     * Get a rotated Rectangular area of effect given a width, height, and direction
     * @param {number} distance      The length of the ray in grid units
     * @param {number} direction     The direction of the ray in degrees
     * @param {number} width         The width of the ray in grid units
     * @returns {PIXI.Polygon}
     */
    static getRayShape(distance, direction, width) {
        const d = canvas.dimensions;
        width *= d.distancePixels;
        const p00 = Ray.fromAngle(0, 0, Math.toRadians(direction - 90), width / 2).B;
        const p01 = Ray.fromAngle(0, 0, Math.toRadians(direction + 90), width / 2).B;
        let p10;
        let p11;

        // Grid ray
        if (game.settings.get("core", "gridTemplates")) {
            p10 = canvas.grid.getTranslatedPoint(p00, direction, distance);
            p11 = canvas.grid.getTranslatedPoint(p01, direction, distance);
        }

        // Euclidean ray
        else {
            distance *= d.distancePixels;
            direction = Math.toRadians(direction);
            p10 = Ray.fromAngle(p00.x, p00.y, direction, distance).B;
            p11 = Ray.fromAngle(p01.x, p01.y, direction, distance).B;
        }

        return new PIXI.Polygon(p00.x, p00.y, p10.x, p10.y, p11.x, p11.y, p01.x, p01.y);
    }

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
        this.ruler.position.set(this.ray.dx + 10, this.ray.dy + 5);
    }

    /* -------------------------------------------- */

    /**
     * Highlight the grid squares which should be shown under the area of effect
     */
    highlightGrid() {
        // Clear the existing highlight layer
        canvas.interface.grid.clearHighlightLayer(this.highlightId);

        // Highlight colors
        const border = this.document.borderColor;
        const color = this.document.fillColor;

        // If we are in grid-less mode, highlight the shape directly
        if (canvas.grid.type === CONST.GRID_TYPES.GRIDLESS) {
            const shape = this._getGridHighlightShape();
            canvas.interface.grid.highlightPosition(this.highlightId, { border, color, shape });
        }

        // Otherwise, highlight specific grid positions
        else {
            const positions = this._getGridHighlightPositions();
            for (const { x, y } of positions) {
                canvas.interface.grid.highlightPosition(this.highlightId, { x, y, border, color });
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
        const grid = canvas.grid;
        const { x: ox, y: oy } = this.document;
        const shape = this.shape;
        const bounds = shape.getBounds();
        bounds.x += ox;
        bounds.y += oy;
        bounds.fit(canvas.dimensions.rect);
        bounds.pad(1);

        // Identify grid space that have their center points covered by the template shape
        const positions = [];
        const [i0, j0, i1, j1] = grid.getOffsetRange(bounds);
        for (let i = i0; i < i1; i++) {
            for (let j = j0; j < j1; j++) {
                const offset = { i, j };
                const { x: cx, y: cy } = grid.getCenterPoint(offset);

                // If the origin of the template is a grid space center, this grid space is highlighted
                let covered = (Math.max(Math.abs(cx - ox), Math.abs(cy - oy)) < 1);
                if (!covered) {
                    for (let dx = -0.5; dx <= 0.5; dx += 0.5) {
                        for (let dy = -0.5; dy <= 0.5; dy += 0.5) {
                            if (shape.contains(cx - ox + dx, cy - oy + dy)) {
                                covered = true;
                                break;
                            }
                        }
                    }
                }
                if (!covered) continue;
                positions.push(grid.getTopLeftPoint(offset));
            }
        }
        return positions;
    }

    /* -------------------------------------------- */
    /*  Methods                                     */
    /* -------------------------------------------- */

    /** @override */
    async rotate(angle, snap) {
        if (game.paused && !game.user.isGM) {
            ui.notifications.warn("GAME.PausedWarning", { localize: true });
            return this;
        }
        const direction = this._updateRotation({ angle, snap });
        await this.document.update({ direction });
        return this;
    }

    /* -------------------------------------------- */
    /*  Document Event Handlers                     */
    /* -------------------------------------------- */

    /** @inheritDoc */
    _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);

        // Incremental Refresh
        this.renderFlags.set({
            redraw: "texture" in changed,
            refreshState: ("sort" in changed) || ("hidden" in changed),
            refreshPosition: ("x" in changed) || ("y" in changed),
            refreshElevation: "elevation" in changed,
            refreshShape: ["t", "angle", "direction", "distance", "width"].some(k => k in changed),
            refreshTemplate: "borderColor" in changed,
            refreshGrid: ("borderColor" in changed) || ("fillColor" in changed)
        });
    }

    /* -------------------------------------------- */
    /*  Interactivity                               */
    /* -------------------------------------------- */

    /** @override */
    _canControl(user, event) {
        if (!this.layer.active || this.isPreview) return false;
        return user.isGM || (user === this.document.author);
    }

    /** @inheritdoc */
    _canHUD(user, event) {
        return this.isOwner; // Allow template owners to right-click
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
        if (!this._propagateRightClick(event)) event.stopPropagation();
    }

    /* -------------------------------------------- */
    /*  Deprecations and Compatibility              */
    /* -------------------------------------------- */

    /**
     * @deprecated since v12
     * @ignore
     */
    get borderColor() {
        const msg = "MeasuredTemplate#borderColor has been deprecated. Use MeasuredTemplate#document#borderColor instead.";
        foundry.utils.logCompatibilityWarning(msg, { since: 12, until: 14 });
        return this.document.borderColor.valueOf();
    }

    /* -------------------------------------------- */


    /**
     * @deprecated since v12
     * @ignore
     */
    get fillColor() {
        const msg = "MeasuredTemplate#fillColor has been deprecated. Use MeasuredTemplate#document#fillColor instead.";
        foundry.utils.logCompatibilityWarning(msg, { since: 12, until: 14 });
        return this.document.fillColor.valueOf();
    }

    /* -------------------------------------------- */

    /**
     * @deprecated since v12
     * @ignore
     */
    get owner() {
        const msg = "MeasuredTemplate#owner has been deprecated. Use MeasuredTemplate#isOwner instead.";
        foundry.utils.logCompatibilityWarning(msg, { since: 12, until: 14 });
        return this.isOwner;
    }
}