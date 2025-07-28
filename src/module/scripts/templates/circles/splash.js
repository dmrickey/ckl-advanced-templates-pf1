import { AbilityTemplateAdvanced } from '../ability-template';

export class CircleSplash extends AbilityTemplateAdvanced {
    /** @override */
    get _snapMode() {
        const boundsContains = (bounds, point) =>
            bounds.left <= point.x
            && point.x <= bounds.right
            && bounds.top <= point.y
            && point.y <= bounds.bottom;
        const found = !!canvas.tokens.placeables.map(x => x.bounds).find(b => boundsContains(b, canvas.mousePosition));
        return found ? CONST.GRID_SNAPPING_MODES.CENTER : CONST.GRID_SNAPPING_MODES.VERTEX;
    }
}
