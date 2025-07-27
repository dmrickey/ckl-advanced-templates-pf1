import { CONSTS, MODULE_NAME } from '../../consts';
import { Settings } from '../../settings';
import HintHandler from '../../view/hint-handler';
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
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.circles.CircleAnywhere;
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
        this.active = true;
        this.layer.activate();
        this.layer.preview.addChild(this);

        this.hitArea = new PIXI.Polygon([]);

        const finalized = await this.commitPreview();

        this.active = false;

        this.destroy();
        initialLayer.activate();

        HintHandler.close();

        return finalized
            ? {
                result: true,
                place: async () => {
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
                delete: () => {
                    return this.document.delete();
                },
            }
            : null;
    }

    refresh() {
        if (!this.template || !canvas.scene) {
            return;
        }

        super.refresh();

        if (this.active && this.shape) {
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
            canvas.stage.on("click", this.#events.confirm);
            canvas.app.view.addEventListener("contextmenu", this.#events.cancel);
            canvas.app.view.addEventListener("wheel", this.#events.rotate);
        });
    }

    // #endregion
}
