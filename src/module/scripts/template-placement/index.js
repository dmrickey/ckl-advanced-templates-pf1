import ifDebug from '../utils/if-debug';
import createCone from './cones';
import createCircle from './circles';
import { MODULE_NAME } from '../../consts';
import { hideControlIconKey } from '../measured-template-pf-advanced';

/**
 * Common logic and switch statement for placing all templates
 *
 * @param {function} wrapped The base `promptMeasureTemplate`
 * @param {object} shared The shared context passed between different functions when executing an Attack
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

    const windows = Object.values(ui.windows).filter(x => !!x.minimize && !x._minimized);
    await Promise.all(windows.map(x => x.minimize()));

    const type = this.data.data.measureTemplate.type;

    const options = {
        distance: _getSize(this, shared),
        t: type,
        flags: { [MODULE_NAME]: { [hideControlIconKey]: true } },
        user: game.userId,
    }

    if (this.data.data.measureTemplate?.overrideColor) {
        options.fillColor = this.data.data.measureTemplate.customColor;
    }
    else {
        options.fillColor = game.user.color;
    }

    if (this.data.data.measureTemplate?.overrideTexture) {
        options.texture = this.data.data.measureTemplate.customTexture;
    }

    let template;
    switch (type) {
        case 'cone':
            template = await createCone(this, shared, options, async () => await wrapped(shared));
            break;
        case 'circle':
            template = await createCircle(this, shared, options, async () => await wrapped(shared));
            break;
        default:
            ifDebug(() => console.log(`Passing template type '${type}' to system`));
            template = await wrapped(shared);
            break;
    }

    await Promise.all(windows.map(x => x.maximize()));

    if (template.result) {
        await shared.template.update({ flags: { [MODULE_NAME]: { [hideControlIconKey]: false } } })
    }

    return template;
}

export default promptMeasureTemplate;

const _getSize = (itemPf, shared) => typeof itemPf.data.data.measureTemplate.size === 'string'
    ? RollPF.safeTotal(itemPf.data.data.measureTemplate.size, shared.rollData)
    : game.pf1.utils.convertDistance(itemPf.data.data.measureTemplate.size)[0];

const hasTemplatePermission = () => game.permissions.TEMPLATE_CREATE.includes(game.user.role);
