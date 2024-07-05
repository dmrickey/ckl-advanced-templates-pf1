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
 * @param {[HTMLElement]} jq jquery
 * @param {*} _options unused
 */
const injectTemplateSelector = async (sheet, [html], _options) => {
    if (typeof sheet?._templateSettings?.$destroy === 'function') {
        sheet._templateSettings.$destroy();
    }

    const action = sheet.action;
    const type = action?.data.measureTemplate?.type;

    const templateGroupOptions = html.querySelector('div[data-tab=misc]');

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

        // remove system's default color and texture options since I replace them within my mod
        // simply hiding causes multiple inputs with the same `name` property and breaks the data
        html.querySelector('input[name="measureTemplate.color"]')?.parentElement?.parentElement?.remove();
        html.querySelector('input[name="measureTemplate.texture"]')?.parentElement?.parentElement?.remove();

        const sibling = html.querySelector('.tab[data-tab=misc] .form-group.stacked');
        sheet._templateSettings = injected(templateGroupOptions, sibling, action);
    }
}

const destroyTemplateSelector = (sheet, ...args) => {
    if (typeof sheet?._templateSettings?.$destroy === 'function') {
        sheet._templateSettings.$destroy();
    }
}

export {
    injectTemplateSelector,
    destroyTemplateSelector,
}
