import { CONSTS, MODULE_NAME } from '../../consts';
import { getToken, ifDebug } from '../utils';
import { Settings } from '../../settings';
import { calculateExpiration } from './calculate-expiration';

/**
 * Common logic and switch statement for placing all templates
 *
 * @param {object} shared The shared context passed between different functions when executing an Attack
 *
 * @returns {object} The template creation data
 */
async function promptMeasureTemplate() {
    ifDebug(() => console.log('promptMeasureTemplate', this));

    // return success early if user isn't allowed to place templates
    if (!hasTemplatePermission()) {
        return {
            delete: () => { },
            place: () => { },
            result: true,
        };
    }

    const type = this.shared.action.data.measureTemplate.type;

    const actor = this.item?.parentActor;
    const token = getToken(this.item) || {};
    const icon = this.shared.action.data.img === 'systems/pf1/icons/misc/magic-swirl.png' ? this.item.img : this.shared.action.data.img;
    const { maxRange, minRange } = this.shared.action;
    const flags = this.shared.action.data.flags?.[MODULE_NAME] || {};
    let distance = _getSize(this.shared) || 5;

    const expirationTime = calculateExpiration(actor, flags);

    const templateData = {
        _id: randomID(16),
        distance,
        t: type,
        flags: {
            [MODULE_NAME]: {
                ...flags,
                [CONSTS.flags.circle.movesWithToken]: flags[CONSTS.flags.placementType] == CONSTS.placement.circle.self && !!flags[CONSTS.flags.circle.movesWithToken],
                [CONSTS.flags.expirationTime]: expirationTime,
                baseDistance: distance,
                icon,
                itemId: this.item?.id,
                maxRange,
                minRange,
                tokenId: token?.id,
            },
        },
        user: game.userId,
        fillColor: this.shared.action.data.measureTemplate?.overrideColor
            ? this.shared.action.data.measureTemplate.customColor
            : game.user.color,
        texture: this.shared.action.data.measureTemplate?.overrideTexture
            ? this.shared.action.data.measureTemplate.customTexture
            : null,
    };

    if (['ray', 'line'].includes(type)) {
        templateData.width = flags[CONSTS.flags.line.widthOverride] && flags[CONSTS.flags.line.width] || Settings.defaultLineWidth;
    }

    const windows = Object.values(ui.windows).filter((x) => !!x.minimize && !x._minimized);
    await Promise.all(windows.map((x) => x.minimize()));

    const template = await game.modules.get(MODULE_NAME).api.AbilityTemplateAdvanced.fromData(templateData, this.shared.action);
    if (!template) {
        return { result: false };
    }

    const result = await template.drawPreview();

    if (!result.result) {
        await Promise.all(windows.map((x) => x.maximize()));
        return result;
    }

    if (Settings.reExpand) {
        await Promise.all(windows.map((x) => x.maximize()));
    }

    this.shared.template = await result.place();

    return result;
}

export default promptMeasureTemplate;

const _getSize = (shared) => pf1.utils.convertDistance(RollPF.safeTotal(shared.action.data.measureTemplate.size, shared.rollData))[0];

const hasTemplatePermission = () => game.permissions.TEMPLATE_CREATE.includes(game.user.role);
