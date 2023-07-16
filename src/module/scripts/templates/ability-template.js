import { CONSTS, MODULE_NAME } from '../../consts';
import { Settings } from '../../settings';
import { MeasuredTemplatePFAdvanced } from './measured-template-pf-advanced';

export class AbilityTemplateAdvanced extends MeasuredTemplatePFAdvanced {
    static async fromData(templateData, action) {
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
        const placementType = action.data.flags?.[MODULE_NAME]?.[CONSTS.flags.placementType];

        const tokenId = templateData.flags?.[MODULE_NAME]?.tokenId;
        const token = canvas.tokens.placeables.find((x) => x.id === tokenId);

        let abilityCls;
        switch (type) {
            case 'circle':
                switch (placementType) {
                    case CONSTS.placement.circle.self:
                        abilityCls = !!token ? game[MODULE_NAME].AbilityTemplateCircleSelf : game[MODULE_NAME].AbilityTemplateCircleGrid;
                        break;
                    case CONSTS.placement.circle.splash:
                        abilityCls = game[MODULE_NAME].AbilityTemplateCircleSplash;
                        break;
                    case CONSTS.placement.useSystem:
                        abilityCls = game[MODULE_NAME].AbilityTemplateCircleAnywhere;
                        break;
                    case CONSTS.placement.circle.grid:
                    default:
                        abilityCls = game[MODULE_NAME].AbilityTemplateCircleGrid;
                        break;
                }
                break;
            case 'cone':
                switch (placementType) {
                    case CONSTS.placement.cone.selectTargetSquare:
                        abilityCls = game[MODULE_NAME].AbilityTemplateConeTarget;
                        break;
                    case CONSTS.placement.cone.self:
                    default:
                        abilityCls = game[MODULE_NAME].AbilityTemplateConeSelf;
                        break;
                }
                break;
        }

        const thisTemplate = new abilityCls(template);
        await thisTemplate.initializePlacement(action.parent);

        return thisTemplate;
    }

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

    targetIfEnabled() {
        if (Settings.target) {
            const targets = this.getTokensWithin();
            const ids = targets.map((t) => t.id);
            game.user.updateTokenTargets(ids);
        }
    }
}
