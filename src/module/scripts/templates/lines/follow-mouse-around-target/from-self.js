import { getToken, ifDebug } from '../../../utils';
import { AbilityTemplateLineTargetBase } from './base';

export class LineFromSelf extends AbilityTemplateLineTargetBase {
    /** @override */
    async initializePlacement(itemPf) {
        ifDebug(() => console.log(`inside ${this.constructor.name} - ${this.initializePlacement.name}`));

        const token = getToken(itemPf);
        const width = Math.max(Math.round(token.document.width), 1);
        const height = Math.max(Math.round(token.document.height), 1);
        return await super.initializeLineData(token.center, width, height);
    }
}
