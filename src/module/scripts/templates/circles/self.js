import { AbilityTemplateAdvanced } from '../ability-template';
import { ifDebug } from '../../utils';

export class CircleSelf extends AbilityTemplateAdvanced {
    /** @override */
    async commitPreview() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.commitPreview.name}`));

        await new Promise(r => setTimeout(r, 100));
        super.targetIfEnabled();

        return true;
    }

    /** @override */
    async initializeVariables() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializeVariables.name}`));

        const token = this.token || { center: { x: 0, y: 0 } };
        const { x, y } = token.center;
        this.document.x = x;
        this.document.y = y;
        return true;
    }
}
