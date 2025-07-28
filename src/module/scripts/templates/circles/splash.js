import { AbilityTemplateAdvanced } from '../ability-template';

export class CircleSplash extends AbilityTemplateAdvanced {
    /** @override */
    get _snapMode() {
        const { x, y } = canvas.mousePosition;
        const found = !!canvas.tokens.placeables.map(x => x.bounds).find(b => b.contains(x, y));
        return found ? CONST.GRID_SNAPPING_MODES.CENTER : CONST.GRID_SNAPPING_MODES.VERTEX;
    }
}
