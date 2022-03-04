import { CONSTS, MODULE_NAME } from '../consts';
import { getToken, ifDebug } from './utils';

const hideControlIconKey = 'hideControlIconKey';

const initMeasuredTemplate = () => {
    ifDebug(() => console.log('init measured template override'));
    const MeasuredTemplatePF = CONFIG.MeasuredTemplate.objectClass;

    class MeasuredTemplatePFAdvanced extends MeasuredTemplatePF {
        get shouldOverrideIcon() {
            return !!this.data.flags?.[MODULE_NAME]?.[hideControlIconKey];
        }

        // todo read game setting to see if medium or smaller tokens are forced to pick a corner of their square to center from
        get tokenEmanationSize() {
            // eslint-disable-next-line
            return false ? 1 : -1;
        }

        get shouldOverrideTokenEmanation() {
            return game.settings.get('pf1', 'measureStyle')
                && this.data.t === 'circle'
                && this.data.flags?.[MODULE_NAME]?.[CONSTS.flags.placementType] === CONSTS.placement.circle.self
                && ['burst', 'emanation'].includes(this.data.flags?.[MODULE_NAME]?.[CONSTS.flags.circle.areaType])
                && this.tokenSizeSquares.sizeSquares > this.tokenEmanationSize;
        }

        get tokenSizeSquares() {
            const tokenId = this.data.flags?.[MODULE_NAME]?.tokenId;
            const token = canvas.tokens.placeables.find((x) => x.id === tokenId);
            const sizeSquares = token?.data.width || 1;
            return { token, sizeSquares };
        }

        get tokenGridCorners() {
            const { token, sizeSquares } = this.tokenSizeSquares;
            const { x, y } = token;
            const gridSize = canvas.grid.h;

            const bottom = y + gridSize * sizeSquares;
            const left = x;
            const top = y;
            const right = x + gridSize * sizeSquares;

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
            let { distance: radius } = this.data;
            radius *= (dimensions.size / dimensions.distance);
            radius += dimensions.size * sizeSquares / 2;
            this.shape = new PIXI.RoundedRectangle(-radius, -radius, radius * 2, radius * 2, radius - dimensions.size * sizeSquares / 2);
        }

        /** @override */
        refresh() {
            if (!this.shouldOverrideIcon && !this.shouldOverrideTokenEmanation) {
                return super.refresh();
            }

            /* ALL OF THIS IS THE ORIGINAL METHOD EXCEPT FOR THE PARTS IN MY IF(SHOULDOVERRIDE) BLOCKS */
            const d = canvas.dimensions;
            this.position.set(this.data.x, this.data.y);

            // Extract and prepare data
            let { direction, distance, width } = this.data;
            distance *= (d.size / d.distance);
            width *= (d.size / d.distance);
            direction = Math.toRadians(direction);
            if (this.shouldOverrideTokenEmanation) {
                const { sizeSquares } = this.tokenSizeSquares;
                distance += d.size * sizeSquares / 2;
            }

            // Create ray and bounding rectangle
            this.ray = Ray.fromAngle(this.data.x, this.data.y, direction, distance);

            // Get the Template shape
            switch (this.data.t) {
                case 'circle':
                    this.shape = this._getCircleShape(distance);
                    break;
                case 'cone':
                    this.shape = this._getConeShape(direction, this.data.angle, distance);
                    break;
                case 'rect':
                    this.shape = this._getRectShape(direction, distance);
                    break;
                case 'ray':
                    this.shape = this._getRayShape(direction, distance, width);
                    break;
            }
            if (this.shouldOverrideTokenEmanation) {
                this._getEmanationShape();
            }

            // Draw the Template outline
            this.template.clear().lineStyle(this._borderThickness, this.borderColor, 0.75).beginFill(0x000000, 0.0);

            // Fill Color or Texture
            if (this.texture) {
                this.template.beginTextureFill({
                    texture: this.texture
                });
            }
            else {
                this.template.beginFill(0x000000, 0.0);
            }

            // Draw the shape
            this.template.drawShape(this.shape);

            // Draw origin and destination points
            this.template.lineStyle(this._borderThickness, 0x000000)
                .beginFill(0x000000, 0.5)
                .drawCircle(0, 0, 6)
                .drawCircle(this.ray.dx, this.ray.dy, 6);

            // Update the HUD
            if (this.shouldOverrideIcon) {
                this.hud.icon.interactive = false;
                this.hud.icon.border.visible = false;
            }
            else {
                this.hud.icon.visible = this.layer._active;
                this.hud.icon.border.visible = this._hover;
            }

            this._refreshRulerText();

            return this;
        }

        /** @override */
        getHighlightedSquares() {
            if (!this.shouldOverrideTokenEmanation) {
                return super.getHighlightedSquares();
            }

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
            const nr = Math.ceil((this.data.distance * 1.5) / d.distance / (d.size / grid.h));
            const nc = Math.ceil((this.data.distance * 1.5) / d.distance / (d.size / grid.w));

            // Get the center of the grid position occupied by the template
            const result = [];

            let origins = this.tokenGridCorners;
            // offset origins to template center to account for token movement
            origins = origins.map(({ x, y }) => ({
                x: x + this.center.x - token.center.x,
                y: y + this.center.y - token.center.y,
            }));

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
                        if (distance <= this.data.distance) {
                            result.push({ x: gx, y: gy });
                        }
                    }
                }
            });

            const filtered = [...(new Set(result.map(JSON.stringify)))].map(JSON.parse);
            return filtered;
        }
    }

    CONFIG.MeasuredTemplate.objectClass = MeasuredTemplatePFAdvanced;

    class AbilityTemplateAdvanced extends MeasuredTemplatePFAdvanced {
        static async fromData(templateData, itemPf) {
            const { t: type, distance } = templateData;
            if (!type
                || !distance
                || !canvas.scene
                || !['cone', 'circle'].includes(type)
            ) {
                return null;
            }

            // Return the template constructed from the item data
            const cls = CONFIG.MeasuredTemplate.documentClass;
            const template = new cls(templateData, { parent: canvas.scene });
            const placementType = itemPf.getFlag(MODULE_NAME, CONSTS.flags.placementType);

            let abilityCls;
            switch (type) {
                case 'circle':
                    switch (placementType) {
                        case CONSTS.placement.circle.self:
                            abilityCls = AbilityTemplateCircleSelf;
                            break;
                        case CONSTS.placement.circle.grid:
                        default:
                            abilityCls = AbilityTemplateCircle;
                            break;
                    }
                    break;
                case 'cone':
                    switch (placementType) {
                        case CONSTS.placement.cone.alt15:
                            abilityCls = AbilityTemplateConeSelfAlt15;
                            break;
                        case CONSTS.placement.cone.selectTargetSquare:
                            abilityCls = AbilityTemplateConeTarget;
                            break;
                        case CONSTS.placement.cone.self:
                        default:
                            abilityCls = AbilityTemplateConeSelf;
                            break;
                    }
                    break;
            }

            const thisTemplate = new abilityCls(template);
            await thisTemplate.initializePlacement(itemPf);

            return thisTemplate;
        }

        async drawPreview() {
            const initialLayer = canvas.activeLayer;

            await this.draw();
            this.active = true;
            this.layer.activate();
            this.layer.preview.addChild(this);

            if (this.controlIcon) {
                this.controlIcon.removeAllListeners();
            }
            this.hitArea = new PIXI.Polygon([]);

            const finalized = await this.commitPreview();

            this.active = false;
            const hl = canvas.grid.getHighlightLayer(`Template.${this.id}`);
            hl.clear();

            this.destroy();
            initialLayer.activate();

            return finalized
                ? {
                    result: true,
                    place: async () => {
                        this.data.update(this.data);
                        const doc = (await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [this.data.toObject()]))[0];
                        this.document = doc;
                        return doc;
                    },
                    delete: () => {
                        return this.document.delete();
                    },

                }
                : { result: false };
        }

        refresh() {
            if (!this.template || !canvas.scene) {
                return;
            }

            super.refresh();

            if (this.active) {
                this.highlightGrid();
            }

            return this;
        }


        /**
         * returns true if committed, false if cancelled
         */
        async commitPreview() { }

        /**
         * sets up data specififc to template placement (initial position, rotation, set up points array for cones around token, extra width info for emanations, etc)
         *
         * @param {ItemPF} itemPf used to grab the token data for initial placement
         */
        async initializePlacement(itemPf) { }
    }

    class AbilityTemplateCircleSelf extends AbilityTemplateAdvanced {
        /** @override */
        async commitPreview() {
            ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

            return true;
        }

        /** @override */
        async initializePlacement(itemPf) {
            ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

            const token = getToken(itemPf) || {};
            const { x, y } = token.center;
            this.data.x = x;
            this.data.y = y;
        }
    }

    class AbilityTemplateCircle extends AbilityTemplateAdvanced {
        /** @override */
        async commitPreview() {
            ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));
            // game.user.updateTokenTargets();

            const updateTemplateLocation = async (crosshairs) => {
                while (crosshairs.inFlight) {
                    await warpgate.wait(20);

                    const { x, y } = crosshairs.center;
                    if (this.data.x === x && this.data.y === y) {
                        continue;
                    }

                    this.data.x = x;
                    this.data.y = y;
                    this.refresh();
                    // todo grab targets
                }
            };

            const targetConfig = {
                drawIcon: true,
                drawOutline: false,
                interval: 1,
                // todo grab icon from ItemPF
            };
            const crosshairs = await warpgate.crosshairs.show(
                targetConfig,
                {
                    show: updateTemplateLocation
                }
            );

            if (crosshairs.cancelled) {
                // game.user.updateTokenTargets();
                return false;
            }

            return true;
        }

        /** @override */
        async initializePlacement(_itemPf) {
            ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

            const mouse = canvas.app.renderer.plugins.interaction.mouse;
            const position = mouse.getLocalPosition(canvas.app.stage);
            const { x, y } = position;
            this.data.x = x;
            this.data.y = y;
        }
    }

    class AbilityTemplateConeBase extends AbilityTemplateAdvanced {
        _tokenSquare;
        _is15;

        /** @override */
        async commitPreview() {
            ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

            // game.user.updateTokenTargets();
            const targetConfig = {
                drawIcon: false,
                drawOutline: false,
            };

            let currentSpotIndex = 0;
            const updateTemplateRotation = async (crosshairs) => {
                while (crosshairs.inFlight) {
                    await warpgate.wait(100);

                    const totalSpots = this._tokenSquare.allSpots.length;
                    const radToNormalizedAngle = (rad) => {
                        let angle = (rad * 180 / Math.PI) % 360;
                        // offset the angle for even-sided tokens, because it's centered in the grid it's just wonky without the offset
                        const offset = this._is15 ? 0 : 1;
                        if (this._tokenSquare.heightSquares % 2 === offset && this._tokenSquare.widthSquares % 2 === offset) {
                            angle -= (360 / totalSpots) / 2;
                        }
                        const normalizedAngle = Math.round(angle / (360 / totalSpots)) * (360 / totalSpots);
                        return normalizedAngle < 0
                            ? normalizedAngle + 360
                            : normalizedAngle;
                    };

                    const ray = new Ray(this._tokenSquare.center, crosshairs);
                    const angle = radToNormalizedAngle(ray.angle);
                    const spotIndex = Math.ceil(angle / 360 * totalSpots);
                    if (spotIndex === currentSpotIndex) {
                        continue;
                    }

                    currentSpotIndex = spotIndex;
                    const spot = this._tokenSquare.allSpots[currentSpotIndex];
                    const { direction, x, y } = spot;

                    this.data.direction = direction;
                    this.data.x = x;
                    this.data.y = y;
                    this.refresh();
                }
            };

            const rotateCrosshairs = await warpgate.crosshairs.show(
                targetConfig,
                {
                    show: updateTemplateRotation
                }
            );

            if (rotateCrosshairs.cancelled) {
                // game.user.updateTokenTargets();
                return false;
            }

            return true;
        }

        /** @override */
        async initializeConeData(token, alt15Override = false) {
            ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

            const { distance } = this.data;
            this._is15 = distance === 15 && !alt15Override;

            if (typeof token === 'undefined' || !token) {
                const sourceConfig = {
                    drawIcon: true,
                    drawOutline: false,
                    interval: -1,
                    label: 'Cone Start',
                    // grab icon from item
                };

                const source = await warpgate.crosshairs.show(sourceConfig);
                if (source.cancelled) {
                    return;
                }
                this._tokenSquare = this._sourceSquare({ x: source.x, y: source.y }, 1, 1);
            }
            else {
                const width = Math.max(Math.round(token.data.width), 1);
                const height = Math.max(Math.round(token.data.height), 1);
                this._tokenSquare = this._sourceSquare(token.center, width, height, alt15Override);
            }

            const { x, y } = this._tokenSquare.allSpots[0];
            this.data.x = x;
            this.data.y = y;
            this.data.angle = 90;
        }

        _sourceSquare(center, widthSquares, heightSquares) {
            const gridSize = canvas.grid.h;
            const h = gridSize * heightSquares;
            const w = gridSize * widthSquares;

            const bottom = center.y + h / 2;
            const left = center.x - w / 2;
            const top = center.y - h / 2;
            const right = center.x + w / 2;

            // 15 foot cones originate in the middle of the grid, so for every square-edge there's one origin point instead of two
            const gridOffset = this._is15 ? gridSize / 2 : 0;
            const qtyOffset = this._is15 ? 0 : 1;

            const rightSpots = [...new Array(heightSquares + qtyOffset)].map((_, i) => ({
                direction: 0,
                x: right,
                y: top + gridSize * i + gridOffset,
            }));
            const bottomSpots = [...new Array(widthSquares + qtyOffset)].map((_, i) => ({
                direction: 90,
                x: right - gridSize * i - gridOffset,
                y: bottom,
            }));
            const leftSpots = [...new Array(heightSquares + qtyOffset)].map((_, i) => ({
                direction: 180,
                x: left,
                y: bottom - gridSize * i - gridOffset,
            }));
            const topSpots = [...new Array(widthSquares + qtyOffset)].map((_, i) => ({
                direction: 270,
                x: left + gridSize * i + gridOffset,
                y: top,
            }));
            const allSpots = [
                ...rightSpots.slice(Math.floor(rightSpots.length / 2)),
                { direction: 45, x: right, y: bottom },
                ...bottomSpots,
                { direction: 135, x: left, y: bottom },
                ...leftSpots,
                { direction: 225, x: left, y: top },
                ...topSpots,
                { direction: 315, x: right, y: top },
                ...rightSpots.slice(0, Math.floor(rightSpots.length / 2)),
            ];

            return {
                x: left,
                y: top,
                center,
                top,
                bottom,
                left,
                right,
                h,
                w,
                heightSquares,
                widthSquares,
                allSpots,
            };
        }
    }

    class AbilityTemplateConeSelfAlt15 extends AbilityTemplateConeBase {
        /** @override */
        async initializePlacement(itemPf) {
            ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

            const token = getToken(itemPf);
            await super.initializeConeData(token, true);
        }
    }

    class AbilityTemplateConeSelf extends AbilityTemplateConeBase {
        /** @override */
        async initializePlacement(itemPf) {
            ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

            const token = getToken(itemPf);
            await super.initializeConeData(token);
        }
    }

    class AbilityTemplateConeTarget extends AbilityTemplateConeBase {
        /** @override */
        async initializePlacement(itemPf) {
            ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

            await super.initializeConeData();
        }
    }

    game[MODULE_NAME] = {
        AbilityTemplateAdvanced,
        MeasuredTemplatePFAdvanced,
    };
};

export {
    hideControlIconKey,
    initMeasuredTemplate,
};
