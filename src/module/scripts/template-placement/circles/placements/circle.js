import { targetTokens } from '../../../utils';
import { ifDebug } from '../../../utils';

/**
 * For placing a circle at the cursor at a grid intersection
 *
 * @param {object} options Template creation data
 * @returns {object} The created template
 */
export default async function (options) {
    ifDebug(() => console.log('inside _placeCircleSelf'));

    const mouse = canvas.app.renderer.plugins.interaction.mouse;
    const position = mouse.getLocalPosition(canvas.app.stage);
    const templateData = mergeObject(options, position, { recursive: true });

    game.user.updateTokenTargets();

    let template = (await canvas.scene.createEmbeddedDocuments('MeasuredTemplate', [templateData]))[0];

    const updateTemplateLocation = async (crosshairs) => {
        while (crosshairs.inFlight) {
            await warpgate.wait(100);

            if (template.data.x === crosshairs.center.x && template.data.y === crosshairs.center.y) {
                continue;
            }

            template = await template.update(crosshairs.center);
            targetTokens(template);
        }
    };

    const targetConfig = {
        drawIcon: false,
        drawOutline: false,
        interval: 1,
    };
    const crosshairs = await warpgate.crosshairs.show(
        targetConfig,
        {
            show: updateTemplateLocation
        }
    );

    if (crosshairs.cancelled) {
        await template.delete();
        game.user.updateTokenTargets();
        return;
    }

    return template;
};
