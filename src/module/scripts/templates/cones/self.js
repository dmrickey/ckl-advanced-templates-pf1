import { AbilityTemplateConeBase } from "./base";
import { getToken, ifDebug } from '../../utils';

export class AbilityTemplateConeSelf extends AbilityTemplateConeBase {
    /** @override */
    async initializePlacement(itemPf) {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

        const token = getToken(itemPf);
        await super.initializeConeData(token);
    }
}
