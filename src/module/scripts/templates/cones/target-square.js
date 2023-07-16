import { ifDebug } from '../../utils';
import { AbilityTemplateConeBase } from './base';

export class AbilityTemplateConeTarget extends AbilityTemplateConeBase {
    /** @override */
    async initializePlacement(_itemPf) {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

        await super.initializeConeData();
    }
}
