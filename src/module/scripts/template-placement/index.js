import ifDebug from '../utils/if-debug';
import createCone from './cones';
import createCircle from './circles';
import { MODULE_NAME } from '../../consts';
import { hideControlIconKey } from '../measured-template-pf-advanced';
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

    const windows = Object.values(ui.windows).filter((x) => !!x.minimize && !x._minimized);
    await Promise.all(windows.map((x) => x.minimize()));

    const type = this.data.data.measureTemplate.type;

    const templateData = {
        _id: randomID(16),
        distance: _getSize(this, shared) || 5,
        t: type,
        // flags: { [MODULE_NAME]: { [hideControlIconKey]: true } }, // don't think I need this anymore
        user: game.userId,
        fillColor: this.data.data.measureTemplate?.overrideColor
            ? this.data.data.measureTemplate.customColor
            : game.user.color,
        texture: this.data.data.measureTemplate?.overrideTexture
            ? this.data.data.measureTemplate.customTexture
            : null,
        itemId: this.id,
        tokenId: getToken(this)?.id,
    };

    // let template;
    // switch (type) {
    //     case 'cone':
    //         template = await createCone(this, shared, templateData, async () => await wrapped(shared));
    //         break;
    //     case 'circle':
    //         template = await createCircle(this, shared, templateData, async () => await wrapped(shared));
    //         break;
    //     default:
    //         ifDebug(() => console.log(`Passing template type '${type}' to system`));
    //         template = await wrapped(shared);
    //         break;
    // }

    const template = game[MODULE_NAME].AbilityTemplateAdvanced.fromData(templateData, this);
    if (!template) {
        return { result: false };
    }

    const result = template.drawPreview();

    if (!template.result) {
        // todo read from game setting to see if the user wants it to re-expand when cast
        await Promise.all(windows.map((x) => x.maximize()));
        return result;
    }

    shared.template = await result.place();

    // probably not necessary since I don't think I need to hide the control icon on ability templates
    await shared.template.update({ flags: { [MODULE_NAME]: { [hideControlIconKey]: false } } });

    return result;
}

export default promptMeasureTemplate;

const _getSize = (itemPf, shared) => typeof itemPf.data.data.measureTemplate.size === 'string'
    ? RollPF.safeTotal(itemPf.data.data.measureTemplate.size, shared.rollData)
    : game.pf1.utils.convertDistance(itemPf.data.data.measureTemplate.size)[0];

const hasTemplatePermission = () => game.permissions.TEMPLATE_CREATE.includes(game.user.role);
