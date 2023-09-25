import { CONSTS, MODULE_NAME } from '../../consts';
import { Settings } from '../../settings';
import { MeasuredTemplatePFAdvanced } from './measured-template-pf-advanced';

export class AbilityTemplateAdvanced extends MeasuredTemplatePFAdvanced {
    static async fromData(templateData, action) {
        const { t: type, distance } = templateData;
        if (!type
            || !distance
            || !canvas.scene
        ) {
            return null;
        }

        // Return the template constructed from the item data
        const cls = CONFIG.MeasuredTemplate.documentClass;
        const template = new cls(templateData, { parent: canvas.scene });
        const placementType = action.data.flags?.[MODULE_NAME]?.[CONSTS.flags.placementType];

        const tokenId = templateData.flags?.[MODULE_NAME]?.tokenId;
        const token = canvas.tokens.placeables.find((x) => x.id === tokenId);

        let abilityCls;
        switch (type) {
            case 'circle':
                switch (placementType) {
                    case CONSTS.placement.circle.self:
                        abilityCls = !!token ? game.modules.get(MODULE_NAME).api.ability.circles.AbilityTemplateCircleSelf : game.modules.get(MODULE_NAME).api.ability.circles.AbilityTemplateCircleGrid;
                        break;
                    case CONSTS.placement.circle.splash:
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.circles.AbilityTemplateCircleSplash;
                        break;
                    case CONSTS.placement.useSystem:
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.circles.AbilityTemplateCircleAnywhere;
                        break;
                    case CONSTS.placement.circle.grid:
                    default:
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.circles.AbilityTemplateCircleGrid;
                        break;
                }
                break;
            case 'cone':
                switch (placementType) {
                    case CONSTS.placement.cone.selectTargetSquare:
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.cones.AbilityTemplateConeTarget;
                        break;
                    case CONSTS.placement.useSystem:
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.cones.AbilityTemplateConeSystem;
                        break;
                    case CONSTS.placement.cone.self:
                    default:
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.cones.AbilityTemplateConeSelf;
                        break;
                }
                break;
            case 'ray':
            case 'line':
                switch (placementType) {
                    case CONSTS.placement.line.selectTargetSquare:
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.lines.AbilityTemplateLineTargetSquare;
                        break;
                    case CONSTS.placement.useSystem:
                        // todo
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.lines.AbilityTemplateAdvanced;
                        break;
                    case CONSTS.placement.line.self:
                    default:
                        abilityCls = game.modules.get(MODULE_NAME).api.ability.lines.AbilityTemplateLineFromSelf;
                        break;
                }
                break;
            case 'rect':
                abilityCls = game.modules.get(MODULE_NAME).api.ability.rects.AbilityTemplateRectCentered;
                break;
        }

        const thisTemplate = new abilityCls(template);
        if (await thisTemplate.initializePlacement(action.parent)) {
            return thisTemplate;
        }

        return null;
    }

    /**
     * @virtual
     * @returns { -1 | 0 | 1 }
     */
    _gridInterval() { return canvas.scene.grid.type === CONST.GRID_TYPES.SQUARE ? 1 : 0; }

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


    // todo fill in default here for rect / line
    /**
     * returns true if committed, false if cancelled
     * @virtual
     * @returns {Promise<Boolean>}
     */
    async commitPreview() { }

    // todo fill in default here for rect / line
    /**
     * sets up data specififc to template placement (initial position, rotation, set up points array for cones around token, extra width info for emanations, etc)
     *
     * @param {ItemPF} [itemPf] used to grab the token data for initial placement
     * @returns {Promise<Boolean>}
     */
    async initializePlacement(itemPf) {
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
    targetIfEnabled() {
        if (Settings.target) {
            const targets = this.getTokensWithin();
            const ids = targets.map((t) => t.id);
            game.user.updateTokenTargets(ids);
        }
    }
}
