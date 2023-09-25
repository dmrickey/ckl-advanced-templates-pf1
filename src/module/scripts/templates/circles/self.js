import { AbilityTemplateAdvanced } from '../ability-template';
import { getToken, ifDebug } from '../../utils';

export class CircleSelf extends AbilityTemplateAdvanced {
    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

        await new Promise(r => setTimeout(r, 100));
        super.targetIfEnabled();

        return true;
    }

    /** @override */
    async initializePlacement(itemPf) {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

        const token = getToken(itemPf) || { center: { x: 0, y: 0 } };
        const { x, y } = token.center;
        this.document.x = x;
        this.document.y = y;
        return true;
    }
}
