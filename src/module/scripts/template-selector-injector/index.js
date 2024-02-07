import {
    showConeSettings,
    showCircleSettings,
    showLineSettings,
    showRectSettings
} from '../../view/show-template-settings';

/**
 * Adds advanced template options button to abilities with configured templates (that are supported)
 *
 * @param {*} sheet The actor sheet
 * @param {*} jq jquery
 * @param {*} _options unused
 */
const injectTemplateSelector = async (sheet, jq, _options) => {
    const action = sheet.action;
    const type = action?.data.measureTemplate?.type;

    const templateGroupOptions = jq[0].querySelector('div[data-tab=misc]');

    if (templateGroupOptions) {
        const injected = (() => {
            switch (type) {
                case 'circle':
                    return showCircleSettings;
                case 'cone':
                    return showConeSettings;
                case 'ray':
                case 'line':
                    return showLineSettings;
                case 'rect':
                    return showRectSettings;
            }
        })();

        if (!injected) {
            return;
        }

        // hide system's default color and texture options
        jq.find('input[name="measureTemplate.overrideColor"]')?.parent()?.remove();
        jq.find('input[name="measureTemplate.overrideTexture"]')?.parent()?.remove();
        jq.find('input[name="measureTemplate.customColor"]')?.parent()?.parent()?.remove();
        jq.find('input[name="measureTemplate.customTexture"]')?.parent()?.parent()?.remove();

        const sibling = jq[0].querySelector('.tab[data-tab=misc] .form-group.stacked');
        sheet._templateSettings = injected(templateGroupOptions, sibling, action);
    }
}

const turnOffTemplateSelector = (sheet, ...args) => {
    if (typeof sheet?._templateSettings?.$destroy === 'function') {
        sheet._templateSettings.$destroy();
    }
}

export {
    injectTemplateSelector,
    turnOffTemplateSelector,
}
