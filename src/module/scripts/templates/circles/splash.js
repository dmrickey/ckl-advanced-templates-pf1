import { AbilityTemplateAdvanced } from '../ability-template';

export class CircleSplash extends AbilityTemplateAdvanced {
    /** @override */
    get _snapMode() {
        const { x, y } = canvas.mousePosition;
        const found = !!canvas.tokens.placeables.map(x => x.bounds).find(b => b.contains(x, y));
        return found ? CONST.GRID_SNAPPING_MODES.CENTER : CONST.GRID_SNAPPING_MODES.VERTEX;
    }

    #originalDistance = undefined;
    /** */
    async _onMove(event) {
        if (!canvas.scene.grid.isSquare && !this._isDrag) {
            if (this.#originalDistance === undefined) {
                this.#originalDistance = this.document.distance;
            }

            const { x, y } = canvas.mousePosition;
            const found = !!canvas.tokens.placeables.map(x => x.bounds).find(b => b.contains(x, y));
            if (found) {
                this.document.distance = this.#originalDistance + 5;
            }
            else {
                this.document.distance = this.#originalDistance;
            }
        }
        await super._onMove(event);
    }
}
