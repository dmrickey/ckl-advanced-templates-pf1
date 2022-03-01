import ifDebug from '../utils/if-debug';
import createCone from './cones';
import createCircle from './circles';
import { MODULE_NAME } from '../../consts';
import { hideControlIconKey } from '../measured-template-pf-advanced';

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
        distance: _getSize(this, shared) || 5,
        t: type,
        flags: { [MODULE_NAME]: { [hideControlIconKey]: true } },
        user: game.userId,
        _id: randomID(16),
        fillColor: this.data.data.measureTemplate?.overrideColor
            ? this.data.data.measureTemplate.customColor
            : templateData.fillColor = game.user.color,
        texture: this.data.data.measureTemplate?.overrideTexture
            ? templateData.texture = this.data.data.measureTemplate.customTexture
            : null,
        // todo add token id and/or actor id
    };

    let template;
    switch (type) {
        case 'cone':
            template = await createCone(this, shared, templateData, async () => await wrapped(shared));
            break;
        case 'circle':
            template = await createCircle(this, shared, templateData, async () => await wrapped(shared));
            break;
        default:
            ifDebug(() => console.log(`Passing template type '${type}' to system`));
            template = await wrapped(shared);
            break;
    }

    // todo read from game setting
    // eslint-disable-next-line
    if (false) {
        await Promise.all(windows.map((x) => x.maximize()));
    }

    if (template.result) {
        await shared.template.update({ flags: { [MODULE_NAME]: { [hideControlIconKey]: false } } });
    }

    return template;
}

export default promptMeasureTemplate;

const _getSize = (itemPf, shared) => typeof itemPf.data.data.measureTemplate.size === 'string'
    ? RollPF.safeTotal(itemPf.data.data.measureTemplate.size, shared.rollData)
    : game.pf1.utils.convertDistance(itemPf.data.data.measureTemplate.size)[0];

const hasTemplatePermission = () => game.permissions.TEMPLATE_CREATE.includes(game.user.role);
