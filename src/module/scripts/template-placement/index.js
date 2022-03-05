import ifDebug from '../utils/if-debug';
import { CONSTS, MODULE_NAME } from '../../consts';
import { getToken } from '../utils';

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

    if (this.getFlag(MODULE_NAME, CONSTS.flags.placementType) === CONSTS.placement.useSystem) {
        return wrapped(shared);
    }

    const windows = Object.values(ui.windows).filter((x) => !!x.minimize && !x._minimized);
    await Promise.all(windows.map((x) => x.minimize()));

    const type = this.data.data.measureTemplate.type;
    const token = getToken(this) || {};
    const icon = this.data.img === 'systems/pf1/icons/misc/magic-swirl.png' ? undefined : this.data.img;
    const { minRange, maxRange } = this;

    const templateData = {
        _id: randomID(16),
        distance: _getSize(this, shared) || 5,
        t: type,
        flags: {
            [MODULE_NAME]: {
                ...this.data.flags[MODULE_NAME],
                icon,
                maxRange,
                minRange,
                tokenId: token?.id,
            },
        },
        user: game.userId,
        fillColor: this.data.data.measureTemplate?.overrideColor
            ? this.data.data.measureTemplate.customColor
            : game.user.color,
        texture: this.data.data.measureTemplate?.overrideTexture
            ? this.data.data.measureTemplate.customTexture
            : null,
    };

    const template = await game[MODULE_NAME].AbilityTemplateAdvanced.fromData(templateData, this);
    if (!template) {
        return { result: false };
    }

    const result = await template.drawPreview();

    if (!result.result) {
        // todo read from game setting to see if the user wants it to re-expand when cast
        await Promise.all(windows.map((x) => x.maximize()));
        return result;
    }

    shared.template = await result.place();

    return result;
}

export default promptMeasureTemplate;

const _getSize = (itemPf, shared) => typeof itemPf.data.data.measureTemplate.size === 'string'
    ? RollPF.safeTotal(itemPf.data.data.measureTemplate.size, shared.rollData)
    : game.pf1.utils.convertDistance(itemPf.data.data.measureTemplate.size)[0];

const hasTemplatePermission = () => game.permissions.TEMPLATE_CREATE.includes(game.user.role);
