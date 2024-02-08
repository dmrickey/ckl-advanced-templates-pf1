import CircleSettings from './circle-settings.svelte';
import ConeSettings from './cone-settings.svelte';
import LineSettings from './line-settings.svelte';
import RectSettings from './rect-settings.svelte';
import TemplateSettings from './template-settings.svelte';

const _show = (parent, sibling, app, action = {}) => {
    return new TemplateSettings({
        target: parent,
        anchor: sibling,
        props: { action, TemplateApplication: app },
    });
}

const showCircleSettings = (parent, sibling, action = {}) => _show(parent, sibling, CircleSettings, action);
const showConeSettings = (parent, sibling, action = {}) => _show(parent, sibling, ConeSettings, action);
const showLineSettings = (parent, sibling, action = {}) => _show(parent, sibling, LineSettings, action);
const showRectSettings = (parent, sibling, action = {}) => _show(parent, sibling, RectSettings, action);

export {
    showCircleSettings,
    showConeSettings,
    showLineSettings,
    showRectSettings,
};
