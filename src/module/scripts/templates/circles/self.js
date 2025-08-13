import { AbilityTemplateAdvanced } from '../ability-template';
import { ifDebug } from '../../utils';

export class CircleSelf extends AbilityTemplateAdvanced {
    /** @override */
    initializeVariables() {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializeVariables.name}`));

        const { x, y } = this.token?.getCenterPoint() ?? { center: { x: 0, y: 0 } };
        this.document.x = x;
        this.document.y = y;
        return true;
    }

    /** @override */
    drawPreview() {
        return this.templateResult;
    }
}
