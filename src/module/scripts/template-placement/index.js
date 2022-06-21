import ifDebug from '../utils/if-debug';
import { CONSTS, MODULE_NAME } from '../../consts';
import { getToken } from '../utils';
import { Settings } from '../../settings';

/**
 * Common logic and switch statement for placing all templates
 *
 * @param {Function} wrapped The base `promptMeasureTemplate`
 *
 * @param {object} shared The shared context passed between different functions when executing an Attack
 *
 * @returns {object} The template creation data
 */
async function promptMeasureTemplate(wrapped, shared) {
    ifDebug(() => console.log('promptMeasureTemplate', this, shared));

    // return success early if user isn't allowed to place templates
    if (!hasTemplatePermission()) {
        return {
            delete: () => { },
            place: () => { },
            result: true,
        };
    }

    const type = shared.action.data.measureTemplate.type;

    const token = getToken(this) || {};
    const icon = shared.action.data.img === 'systems/pf1/icons/misc/magic-swirl.png' ? undefined : shared.action.data.img;
    const { minRange, maxRange } = shared.action;

    const templateData = {
        _id: randomID(16),
        distance: _getSize(shared) || 5,
        t: type,
        flags: {
            [MODULE_NAME]: {
                ...shared.action.data.flags?.[MODULE_NAME],
                icon,
                maxRange,
                minRange,
                tokenId: token?.id,
            },
        },
        user: game.userId,
        fillColor: shared.action.data.measureTemplate?.overrideColor
            ? shared.action.data.measureTemplate.customColor
            : game.user.color,
        texture: shared.action.data.measureTemplate?.overrideTexture
            ? shared.action.data.measureTemplate.customTexture
            : null,
    };

    if (!['cone', 'circle'].includes(type)
        || (type === 'cone' && shared.action.data.flags[MODULE_NAME]?.[CONSTS.flags.placementType] === CONSTS.placement.useSystem)
    ) {
        const wrappedResult = await wrapped(shared);
        if (shared.template) {
            await shared.template.update({ flags: templateData.flags });
        }
        return wrappedResult;
    }

    const windows = Object.values(ui.windows).filter((x) => !!x.minimize && !x._minimized);
    await Promise.all(windows.map((x) => x.minimize()));

    const template = await game[MODULE_NAME].AbilityTemplateAdvanced.fromData(templateData, shared.action);
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

    shared.template = await result.place();

    return result;
}

export default promptMeasureTemplate;

const _getSize = (shared) => typeof shared.action.data.measureTemplate.size === 'string'
    ? RollPF.safeTotal(shared.action.data.measureTemplate.size, shared.rollData)
    : game.pf1.utils.convertDistance(shared.action.data.measureTemplate.size)[0];

const hasTemplatePermission = () => game.permissions.TEMPLATE_CREATE.includes(game.user.role);
