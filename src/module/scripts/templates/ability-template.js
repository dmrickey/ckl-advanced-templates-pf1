import { ANGLE_POINTS, CONSTS, FOLLOW_FROM, MODULE_NAME, PLACEMENT_TYPE } from '../../consts';
import { Settings } from '../../settings';
import { GridSquare } from '../models/grid-square';
import { localize, localizeFull } from '../utils';
import { isSet } from '../utils/bits';
import { MeasuredTemplatePFAdvanced } from './measured-template-pf-advanced';

export class AbilityTemplateAdvanced extends MeasuredTemplatePFAdvanced {

    get followFrom() { return FOLLOW_FROM.CURRENT; }

    get angleStartPoints() { return ANGLE_POINTS.ALL; }

    get placementType() { return PLACEMENT_TYPE.SET_XY; }

    static async fromData(templateData, { action } = {}) {
        const { t: type, distance } = templateData;
        if (!type
            || !distance
            || !canvas.scene
        ) {
            return null;
        }

        const placementType = action.flags?.[MODULE_NAME]?.[CONSTS.flags.placementType];

        const tokenId = templateData.flags?.[MODULE_NAME]?.tokenId;
        const token = canvas.tokens.placeables.find((x) => x.id === tokenId);

        /** @type {typeof MeasuredTemplatePFAdvanced}  */
        let abilityCls;
        switch (type) {
            case 'circle':
                switch (placementType) {
                    case CONSTS.placement.circle.self:
                        abilityCls = !!token
                            ? game.modules.get(MODULE_NAME).api.ability.circles.CircleSelf
                            : game.modules.get(MODULE_NAME).api.ability.circles.CircleGridIntersection;
                        break;
                    case CONSTS.placement.circle.splash:
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.circles.CircleSplash;
                        break;
                    case CONSTS.placement.useSystem:
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.circles.CircleSystem;
                        break;
                    case CONSTS.placement.circle.grid:
                    default:
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.circles.CircleGridIntersection;
                        break;
                }
                break;
            case 'cone':
                switch (placementType) {
                    case CONSTS.placement.cone.selectTargetSquare:
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.cones.ConeFromTargetSquare;
                        break;
                    case CONSTS.placement.useSystem:
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.cones.ConeSystem;
                        break;
                    case CONSTS.placement.cone.self:
                    default:
                        abilityCls = !!token
                            ? game.modules.get(MODULE_NAME).api.ability.cones.ConeFromSelf
                            : game.modules.get(MODULE_NAME).api.ability.cones.ConeFromTargetSquare;
                        break;
                }
                break;
            case 'ray':
            case 'line':
                switch (placementType) {
                    case CONSTS.placement.line.selectTargetSquare:
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.lines.LineFromSquare;
                        break;
                    case CONSTS.placement.useSystem:
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.lines.LineSystem;
                        break;
                    case CONSTS.placement.line.self:
                    default:
                        abilityCls = !!token
                            ? game.modules.get(MODULE_NAME).api.ability.lines.LineFromSelf
                            : game.modules.get(MODULE_NAME).api.ability.lines.LineFromSquare;
                        break;
                }
                break;
            case 'rect':
                if (canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE) {
                    abilityCls = game.modules.get(MODULE_NAME).api.ability.rects.RectCentered;
                }
                else {
                    // rotating rects is too hard, so "cheat" and change it to a line that can be rotated with the mouse wheel
                    templateData.t = 'ray';
                    templateData.width = distance;
                    abilityCls = game.modules.get(MODULE_NAME).api.ability.lines.LineSystem;
                }
                break;
        }

        // Return the template constructed from the item data
        const cls = CONFIG.MeasuredTemplate.documentClass;
        const template = new cls(templateData, { parent: canvas.scene });
        const thisTemplate = /** @type {AbilityTemplateAdvanced} */ (/** @type {any} */ new abilityCls(template));
        thisTemplate.action = action;

        if (await thisTemplate.initializeVariables()) {
            return thisTemplate;
        }

        return null;
    }

    async drawPreview() {
        const initialLayer = canvas.activeLayer;
        await this.draw();
        this.layer.activate();
        this.layer.preview.addChild(this);

        this._isSelectingOrigin = this.placementType !== PLACEMENT_TYPE.SET_XY;

        return this.activatePreviewListeners(initialLayer);
    }

    refresh() {
        if (!this.template || !canvas.scene) {
            return;
        }

        super.refresh();

        if (this.shape) {
            this.highlightGrid();
        }

        return this;
    }

    /**
     * sets up data specififc to template placement (initial position, rotation, set up points array for cones around token, extra width info for emanations, etc)
     *
     * @returns {Promise<Boolean>}
     */
    async initializeVariables() {
        const { x, y } = canvas.mousePosition;
        this.document.x = x;
        this.document.y = y;
        return true;
    }

    clearTargetIfEnabled() {
        if (Settings.target) {
            game.user.updateTokenTargets();
        }
    }

    async targetIfEnabled() {
        if (Settings.target) {
            const targets = await this.getTokensWithin();
            const ids = targets.map((t) => t.id);
            game.user.updateTokenTargets(ids);
        }
    }

    // #region Event Handling
    // Event handlers
    #events;

    // Initial layer
    #initialLayer;

    /**
     * Activate listeners for the template preview
     *
     * @param {CanvasLayer} initialLayer  The initially active CanvasLayer to re-activate after the workflow is complete
     * @returns {Promise<object>} Returns result object
     */
    activatePreviewListeners(initialLayer) {
        this.#initialLayer = initialLayer;
        this.pfStyle = game.settings.get("pf1", "measureStyle") === true;

        return new Promise((resolve, reject) => {
            // Prepare events
            this.#events = {
                confirm: this._onConfirm.bind(this),
                cancel: this._onCancel.bind(this),
                move: this._onMove.bind(this),
                rotate: this._onRotate.bind(this),
                resolve,
                reject,
            };

            // Prevent interactions with control icon
            // This also allows left and right click to work correctly
            if (this.controlIcon) this.controlIcon.removeAllListeners();

            // Activate listeners
            canvas.stage.on("pointermove", this.#events.move);
            canvas.stage.on("pointerup", this.#events.confirm);
            canvas.app.view.addEventListener("contextmenu", this.#events.cancel);
            canvas.app.view.addEventListener("wheel", this.#events.rotate);

            this.tempDrag = canvas.templates._onDragLeftStart;
            canvas.templates._onDragLeftStart = () => { };
            this.tempCancel = canvas.templates._onDragLeftCancel;
            canvas.templates._onDragLeftCancel = () => { };
            this.tempMove = canvas.templates._onDragLeftMove;
            canvas.templates._onDragLeftMove = () => { };
            this.tempDrop = canvas.templates._onDragLeftDrop;
            canvas.templates._onDragLeftDrop = () => { };
            this.tempLeft = canvas.templates._onClickLeft;
            canvas.templates._onClickLeft = () => { };
            this.tempLeft2 = canvas.templates._onClickLeft2;
            canvas.templates._onClickLeft2 = () => { };
        });
    }

    #removeListeners() {
        canvas.stage.off("pointermove", this.#events.move);
        canvas.stage.off("pointerup", this.#events.confirm);
        canvas.app.view.removeEventListener("contextmenu", this.#events.cancel);
        canvas.app.view.removeEventListener("wheel", this.#events.rotate);
        canvas.templates._onDragLeftStart = this.tempDrag;
        canvas.templates._onDragLeftCancel = this.tempCancel;
        canvas.templates._onDragLeftMove = this.tempMove;
        canvas.templates._onDragLeftDrop = this.tempDrop;
        canvas.templates._onClickLeft = this.tempLeft;
        canvas.templates._onClickLeft2 = this.tempLeft2;
    }

    #lastMove = 0;
    #isDrag = false;
    #isPanning = false;
    _isSelectingOrigin = false;

    async handleRangeAndTargeting() {
        let isInRange = true;

        if ((this.hasMaxRange || this.hasMinRange) && !this.document.flags[MODULE_NAME].ignoreRange && this.token) {
            const { x, y } = this.center;

            const tokenSquare = GridSquare.fromToken(this.token);

            const distances = tokenSquare.gridPoints
                .map((spot) => [spot, { x, y }])
                .map((coords) => canvas.grid.measurePath(coords).distance);
            let range = Math.min(...distances);
            range = !!(range % 1)
                ? range.toFixed(1)
                : range;
            const isInToken = tokenSquare.contains(x, y);
            if (isInToken) {
                range = 0;
            }

            isInRange = !(this.hasMinRange && range < this.minRange
                || this.hasMaxRange && range > this.maxRange);
            this._setPreviewVisibility(isInRange);
            this._setErrorIconVisibility(isInRange);

            const unit = game.settings.get('pf1', 'units') === 'imperial'
                ? localizeFull('PF1.Distance.ftShort')
                : localizeFull('PF1.Distance.mShort');
            this.#customLabel = localize('range', { range, unit });
            if (!isInRange) {
                this.#customLabel += '\n' + localize('errors.outOfRange');
            }
        }

        // todo handled for gridless lines
        isInRange ? await this.targetIfEnabled() : this.clearTargetIfEnabled();
    }

    /** @virtual */
    /** Update placement (mouse-move) */
    async _onMove(event) {
        event.stopPropagation();

        const leftDown = (event.buttons & 1) > 0;
        const rightDown = (event.buttons & 2) > 0;
        this._isDrag = !!(leftDown && canvas.mouseInteractionManager.isDragging);
        this.#isPanning = this.#isPanning || !!(rightDown && canvas.mouseInteractionManager.isDragging);

        // Throttle
        const now = performance.now();
        if (now - this.#lastMove <= this.constructor.RENDER_THROTTLE) return;

        const center = event.data.getLocalPosition(this.layer);
        const pos = canvas.grid.getSnappedPoint(center, { mode: this._snapMode });

        this._setPreviewVisibility(!this._isSelectingOrigin);

        if (isSet(placementType, PLACEMENT_TYPE.SET_XY)) {
            this.document.updateSource({
                x: pos.x,
                y: pos.y,
            });
        } else if (isSet(placementType, PLACEMENT_TYPE.SET_ANGLE)) {
            this._followAngle(pos);
        } else {
            throw new Error('this should never be reached');
        }

        if (!this._isSelectingOrigin) {
            this.handleRangeAndTargeting();
        }

        this.refresh();

        this.#lastMove = now;
    }

    #isGridPoint({ x, y }) {
        return !(x % canvas.grid.size) && !(y % canvas.grid.size);
    }

    /**=
     * @param {object} input
     * @param {number} input.x
     * @param {number} input.y
     * @returns { GridSquare }
     */
    #getStartingGridSquare({ x, y }) {
        if (isSet(this.followFrom, FOLLOW_FROM.CURRENT)) {
            return this.#isGridPoint({ x, y })
                ? GridSquare.fromGridPoint({ x, y })
                : GridSquare.fromGridSquare({ x, y }).getAngleStartPoints(this.angleStartPoints);
        }
        else if (isSet(this.followFrom, FOLLOW_FROM.TOKEN)) {
            return GridSquare.fromToken(this.token).getAngleStartPoints(this.angleStartPoints);
        }
        else {
            throw new Error('this should never happen');
        }
    }

    #currentSpotIndex = 0;
    _followAngle({ x, y }) {
        if (canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE) {
            const square = this.#getStartingGridSquare({ x, y });
            const totalSpots = square.getAngleStartPoints(this.angleStartPoints);
            const isMid = isSet(this.angleStartPoints, ANGLE_POINTS.EDGE_MIDPOINT);
            const isVertex = isSet(this.angleStartPoints, ANGLE_POINTS.EDGE_VERTEX);
            const radToNormalizedAngle = (rad) => {
                let angle = (rad * 180 / Math.PI) % 360;
                // offset the angle for even-sided tokens, because it's centered in the grid it's just wonky without the offset
                const offset = isMid
                    ? isVertex
                        ? 0.5
                        : 0
                    : 1;
                if (square.heightSquares % 2 === offset && square.widthSquares % 2 === offset) {
                    angle -= (360 / totalSpots) / 2;
                }
                const normalizedAngle = Math.round(angle / (360 / totalSpots)) * (360 / totalSpots);
                return normalizedAngle < 0
                    ? normalizedAngle + 360
                    : normalizedAngle;
            };

            const ray = new Ray(square.center, crosshairs);
            const angle = radToNormalizedAngle(ray.angle);
            const spotIndex = Math.ceil(angle / 360 * totalSpots) % totalSpots;
            if (spotIndex === this.#currentSpotIndex) {
                return;
            }

            this.#currentSpotIndex = spotIndex;

            const spot = square.allSpots[this.#currentSpotIndex];
            this.document.direction = spot.direction;
            this.document.x = spot.x;
            this.document.y = spot.y;
        }
        // todo hex and gridless
    }

    /**
     * Cancel the workflow (right-click)
     *
     * @param {Event} event
     */
    _onCancel(event) {
        if (this.#isPanning) {
            this.#isPanning = false;
            return;
        }

        if (this.placementType !== PLACEMENT_TYPE.SET_XY && !this._isSelectingOrigin) {
            this._isSelectingOrigin = true;
            this._setPreviewVisibility(false);
            this.refresh();
            return;
        }

        console.debug("PF1 | Cancelling template placement for", this.action?.item?.name ?? "unknown");

        this._onFinish(event);
        this.#events.reject();
    }

    /**
     * Confirm the workflow (left-click)
     */
    async _onConfirm(event) {
        if (event.button !== 0) return;

        if (this.#isDrag) {
            this._isDrag = false;
            return;
        }

        if (this.placementType !== PLACEMENT_TYPE.SET_XY && this._isSelectingOrigin) {
            this._isSelectingOrigin = false;
            await this.handleRangeAndTargeting();
            this.refresh();
            return;
        }

        console.debug("PF1 | Placing template for", this.action?.item?.name ?? "unknown");

        this._onFinish(event);

        // Reject if template size is zero
        if (!this.document.distance) return this.#events.reject();

        this.#events.resolve(this.templateResult);
    }

    /** @override */
    _onClickRight(event) {
        event.stopPropagation(); // Prevent right click counting as left click
    }

    get templateResult() {
        return {
            result: true,
            place: this._place.bind(this),
            delete: () => this.document.delete(),
        };
    }

    async _place() {
        // all of the custom props I can set
        this.document.updateSource({
            angle: this.document.angle,
            borderColor: this.document.borderColor,
            direction: this.document.direction,
            distance: this.document.distance,
            fillColor: this.document.fillColor,
            flags: this.document.flags,
            texture: this.document.texture,
            width: this.document.width,
            x: this.document.x,
            y: this.document.y
        });
        const doc = (await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [this.document.toObject()]))[0];
        this.document = doc;
        return doc;
    }

    get _canRotate() { return true; }

    /**
     * Rotate the template by 3 degree increments (mouse-wheel)
     *
     * @param {Event} event
     */
    _onRotate(event) {
        event.preventDefault(); // Prevent browser zoom
        event.stopPropagation(); // Prevent other handlers

        if (!this._canRotate) return;

        let { distance, direction } = this.document,
            delta;

        if (event.ctrlKey) {
            delta = canvas.dimensions.distance * -Math.sign(event.deltaY);
            distance += delta;
            if (distance < 0) distance = 0;
        } else {
            let snap;
            if (this.pfStyle && this.document.t === "cone") {
                delta = game.canvas.grid.isHexagonal ? 60 : 90;
                snap = event.shiftKey ? delta : game.canvas.grid.isHexagonal ? 30 : 45;
            } else {
                delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
                snap = event.shiftKey ? delta : 5;
            }
            if (this.document.t === "rect") {
                snap = Math.sqrt(Math.pow(5, 2) + Math.pow(5, 2));
                distance += snap * -Math.sign(event.deltaY);
            } else {
                direction += snap * Math.sign(event.deltaY);
            }
        }

        this.document.updateSource({ distance, direction });

        this.refresh();
    }

    /**
     * @param {Event} event
     */
    _onFinish(event) {
        // Call Foundry's preview cleanup
        this.layer._onDragLeftCancel(event);

        this.#removeListeners();

        this.#initialLayer.activate();
    }

    // #endregion
    #customLabel = null;
    #customPreciseText = null;

    _refreshRulerText() {
        super._refreshRulerText();
        if (this.#customLabel) {
            if (!this.#customPreciseText) {
                const style = CONFIG.canvasTextStyle.clone();
                style.align = 'center';
                this.#customPreciseText = this.template.addChild(new PreciseText("", style));
            }
            if (this.#customPreciseText.text !== this.#customLabel) {
                this.#customPreciseText.text = this.#customLabel;
            }
            this.#customPreciseText.anchor.set(0.5, 0);
            this.#customPreciseText.position.set(0, 50);
        } else {
            if (this.#customPreciseText) {
                this.#customPreciseText.text = "";
                this.#customPreciseText.destroy();
                this.#customPreciseText = null;
            }
            return super._refreshRulerText();
        }
    }
}
