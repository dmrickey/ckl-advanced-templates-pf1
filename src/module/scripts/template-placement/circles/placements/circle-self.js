import { MODULE_NAME } from '../../../../consts';
import { getToken, ifDebug } from '../../../utils';

/**
 * Template that is automatically placed centered on the caster
 *
 * @param {object} options Template creation data
 *
 * @param {ItemPF} itemPf The pathfinder Item that the template was created from
 *
 * @returns {object} The created template
 */
export default async function (options, itemPf) {
    const token = getToken(itemPf);
    ifDebug(() => console.log('inside _placeCircleSelf'));

    let templateData = mergeObject(options, token?.center, { recursive: true });
    templateData = mergeObject(templateData, { flags: { [MODULE_NAME]: { ...itemPf.data.flags[MODULE_NAME], ...{ tokenId: token?.id } } } }, { recursive: true });
    console.log(templateData);

    const template = (await canvas.scene.createEmbeddedDocuments('MeasuredTemplate', [templateData]))[0];

    game.user.updateTokenTargets();

    return template;
}
