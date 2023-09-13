import { CONSTS, MODULE_NAME } from '../../consts';

export class MeasuredTemplatePFAdvanced extends pf1.canvas.MeasuredTemplatePF {
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

    _getEmanationShape() {
        const { sizeSquares } = this.tokenSizeSquares;

        const dimensions = canvas.dimensions;
        let { distance: radius } = this.document;
        radius *= (dimensions.size / dimensions.distance);
        radius += dimensions.size * sizeSquares / 2;
        this.shape = new PIXI.RoundedRectangle(-radius, -radius, radius * 2, radius * 2, radius - dimensions.size * sizeSquares / 2);
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
            this.controlIcon = this.addChild(this._drawControlIcon());
        }
    }

    /** @override */
    refresh() {
        if (!this.shouldOverride) {
            return super.refresh();
        }

        const d = canvas.dimensions;
        this.position.set(this.document.x, this.document.y);

        // Extract and prepare data
        let { direction, distance, width } = this.document;
        distance *= (d.size / d.distance);
        width *= (d.size / d.distance);
        direction = Math.toRadians(direction);
        if (this.shouldOverrideTokenEmanation) {
            const { sizeSquares } = this.tokenSizeSquares;
            distance += d.size * sizeSquares / 2;
        }

        // Create ray and bounding rectangle
        this.ray = Ray.fromAngle(this.document.x, this.document.y, direction, distance);

        // Get the Template shape
        switch (this.document.t) {
            case 'circle':
                if (this.shouldOverrideTokenEmanation) {
                    this._getEmanationShape();
                }
                else {
                    // this.shape = this._getCircleShape(distance);
                    this.shape = this.constructor.getCircleShape(distance);
                }
                break;
            case 'cone':
                // this.shape = this._getConeShape(direction, this.document.angle, distance);
                this.shape = this.constructor.getConeShape(direction, this.document.fromAngle, distance);
                break;
            case 'rect':
                this.shape = this.constructor.getRectShape(direction, distance);
                break;
            case 'ray':
                this.shape = this.constructor.getRayShape(direction, distance, width);
                break;
        }

        const _refreshTemplate = () => {
            const template = this.template.clear();
            if (!this.isVisible || this.document.flags?.[MODULE_NAME]?.[CONSTS.flags.hidePreview]) {
                return;
            }

            const outlineAlpha = this.document.flags[MODULE_NAME]?.[CONSTS.flags.hideOutline]
                ? 0
                : 0.75;

            // Draw the Template outline
            template.lineStyle(this._borderThickness, this.borderColor, outlineAlpha).beginFill(0x000000, 0.0);

            // this is a bit overridden
            // Fill Color or Texture
            if (this.texture) {
                let xOffset = true;
                let yOffset = true;

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
        };

        // Draw the template shape and highlight the grid
        _refreshTemplate(); // method is inline above instead of overridden because mine is more complex and uses local variables. (but still inline to show which block of logic it's basically overwriting)
        this.highlightGrid();

        // Update the HUD
        this._refreshControlIcon();
        this._refreshRulerText();

        return this;
    }

    /** @override */
    _refreshTemplate() {
        // body of this is now in refresh() to avoid resetting position multiple times
        // so only call it when it isn't a shape we handle above in `refresh`
        if (!this.shouldOverride) {
            return super._refreshTemplate();
        }
    }

    /**
     * Draw the ControlIcon for the MeasuredTemplate
     *
     * @returns {ControlIcon}
     *
     * @private
     * @override
     */
    _drawControlIcon() {
        // call this for all templates to use spell's icon
        const size = Math.max(Math.round((canvas.dimensions.size * 0.5) / 20) * 20, 40);
        const iconTexture = this.document.flags?.[MODULE_NAME]?.icon || CONFIG.controlIcons.template;
        const icon = new ControlIcon({ texture: iconTexture, size });
        icon.x -= (size * 0.5);
        icon.y -= (size * 0.5);
        return icon;
    }

    /** @override */
    getHighlightedSquares() {
        if (this.hideHighlight) {
            return [];
        }

        if (this.shouldOverrideTokenEmanation) {
            if (!this.id || !this.shape) {
                return [];
            }

            const { token, sizeSquares } = this.tokenSizeSquares;
            if (!token || sizeSquares < 2) {
                return super.getHighlightedSquares();
            }

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

        return super.getHighlightedSquares();
    }

    // only override is adding alpha
    // Highlight grid in PF1 style
    highlightGrid() {
        if (
            !game.settings.get("pf1", "measureStyle")
            || !["circle", "cone", "ray"].includes(this.document.t)
        ) {
            return super.highlightGrid();
        }

        const grid = canvas.grid;
        const bc = this.borderColor;
        const fc = this.fillColor;

        // Only highlight for objects which have a defined shape
        if (!this.id || !this.shape) {
            return;
        }

        // Clear existing highlight
        const hl = this.getHighlightLayer();
        hl.clear();
        if (!this.isVisible) {
            return;
        }

        // highlightGridPosition has a default so undefined is fine to pass in
        const alpha = this.document.flags[MODULE_NAME]?.[CONSTS.flags.colorAlpha];

        if (grid.type === CONST.GRID_TYPES.GRIDLESS) {
            const highlightShape = this._getGridHighlightShape();
            grid.grid.highlightGridPosition(hl, {
                border: bc,
                color: fc,
                alpha,
                shape: highlightShape,
            });
        }
        else {
            // Get grid squares to highlight
            const highlightSquares = this.getHighlightedSquares();
            for (const s of highlightSquares) {
                grid.grid.highlightGridPosition(hl, {
                    x: s.x,
                    y: s.y,
                    alpha,
                    color: fc,
                    border: bc,
                });
            }
        }
    }
}






