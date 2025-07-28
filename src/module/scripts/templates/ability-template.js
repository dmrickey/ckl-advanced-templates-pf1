import { CONSTS, MODULE_NAME } from '../../consts';
import { Settings } from '../../settings';
import { localize, localizeFull } from '../utils';
import { MeasuredTemplatePFAdvanced } from './measured-template-pf-advanced';

export class AbilityTemplateAdvanced extends MeasuredTemplatePFAdvanced {
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
        const thisTemplate = new abilityCls(template);
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
     * returns true if committed, false if cancelled
     * @virtual
     * @returns {Promise<Boolean>}
     */
    async commitPreview() { }

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

    async handleRangeAndTargeting() {
        let isInRange = true;

        if ((this.hasMaxRange || this.hasMinRange) && !this.document.flags[MODULE_NAME].ignoreRange) {
            const { x, y } = this.center;

            const tokenSquare = await this.getSourceGridSquare();
            const tokenContains = (x, y) =>
                new PIXI.Rectangle(tokenSquare.x, tokenSquare.y, tokenSquare.w, tokenSquare.h).contains(x, y);

            const distances = tokenSquare.allSpots
                .map((spot) => [spot, { x, y }])
                .map((coords) => canvas.grid.measurePath(coords).distance);
            let range = Math.min(...distances);
            range = !!(range % 1)
                ? range.toFixed(1)
                : range;
            const isInToken = tokenContains(x, y);
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
        this.#isDrag = !!(leftDown && canvas.mouseInteractionManager.isDragging);
        this.#isPanning = this.#isPanning || !!(rightDown && canvas.mouseInteractionManager.isDragging);

        // Throttle
        const now = performance.now();
        if (now - this.#lastMove <= this.constructor.RENDER_THROTTLE) return;

        const center = event.data.getLocalPosition(this.layer);
        const pos = canvas.grid.getSnappedPoint(center, { mode: this._snapMode });

        this.document.updateSource({
            x: pos.x,
            y: pos.y,
        });

        this.handleRangeAndTargeting();

        this.refresh();

        this.#lastMove = now;
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
        console.debug("PF1 | Cancelling template placement for", this.action?.item?.name ?? "unknown");

        this._onFinish(event);
        this.#events.reject();
    }

    /**
     * Confirm the workflow (left-click)
     */
    _onConfirm(event) {
        if (event.button !== 0) return;

        if (this.#isDrag) {
            this.#isDrag = false;
            return;
        }
        console.debug("PF1 | Placing template for", this.action?.item?.name ?? "unknown");

        this._onFinish(event);

        // Reject if template size is zero
        if (!this.document.distance) return this.#events.reject();

        // Create the template
        // TODO: This should create the template directly and resolve with it.
        const result = {
            result: true,
            place: async () => {
                // this.document = await MeasuredTemplateDocument.create(this.document.toObject(false), { parent: canvas.scene });
                // return this.document;

                // todo put this in a better place
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
            },
            delete: () => this.document.delete(),
        };

        this.#events.resolve(result);
    }

    /**
     * Rotate the template by 3 degree increments (mouse-wheel)
     *
     * @param {Event} event
     */
    _onRotate(event) {
        event.preventDefault(); // Prevent browser zoom
        event.stopPropagation(); // Prevent other handlers

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

    /** @override */
    _onClickRight(event) {
        event.stopPropagation(); // Prevent right click counting as left click
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
