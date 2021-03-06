import {
    showConeSettings,
    showCircleSettings
} from '../../view/show-template-settings';
import { localize } from '../utils';
import template from './template.js';

/**
 * Adds advanced template options button to abilities with configured templates (that are supported)
 *
 * @param {*} sheet The actor sheet
 *
 * @param {*} jq jquery
 *
 * @param {*} _options unused
 */
export default async function (sheet, jq, _options) {
    const action = sheet.action;
    const type = action?.data.measureTemplate?.type;
    if (!['circle', 'cone'].includes(type)) {
        return;
    }

    const templateGroupOptions = jq[0].querySelector('input[name="measureTemplate.overrideTexture"]')?.parentElement.parentElement;

    if (templateGroupOptions) {
        const div = document.createElement('div');
        div.innerHTML = template;

        const button = div.querySelector('button');
        button.innerText = localize('templates.chooseOptions');
        button.addEventListener('click',
            async () => {
                switch (type) {
                    case 'circle':
                        {
                            showCircleSettings(action);
                        }
                        break;
                    case 'cone':
                        {
                            showConeSettings(action);
                        }
                        break;
                }
            });

        templateGroupOptions.after(div.firstElementChild);
    }
}
