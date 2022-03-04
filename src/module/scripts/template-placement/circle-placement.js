import { CONSTS, MODULE_NAME } from '../../consts';
import { ifDebug } from '../utils';

export class CirclePlacement {
    // emanation or burst "centered on you" spreads from edge - not center

    constructor(itemPf) {
        this.itemPf = itemPf;
    }

    _placementTypes = {
        [CONSTS.placement.circle.grid]: {
            key: CONSTS.placement.circle.grid,
            label: 'Select Grid Placement',
        },
        [CONSTS.placement.circle.self]: {
            key: CONSTS.placement.circle.self,
            label: 'Centered on You',
        },
        [CONSTS.placement.useSystem]: {
            key: CONSTS.placement.useSystem,
            label: 'Use System Default',
        },
    };

    async showPlacementMenu() {
        const areaType = this._getAreaType();
        const currentPlacementType = this._getPlacementType();
        const movesWithToken = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.circle.movesWithToken);

        const ok = 'Ok';

        const dialogResult = await warpgate.menu({
            inputs: [
                { type: 'info', label: `Select placement type for this ${this.itemPf.type}` },
                { type: 'radio', label: this._placementTypes[CONSTS.placement.circle.grid].label, options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.circle.grid].key] },
                { type: 'radio', label: this._placementTypes[CONSTS.placement.circle.self].label, options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.circle.self].key] },
                { type: 'radio', label: this._placementTypes[CONSTS.placement.useSystem].label, options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.useSystem].key] },
                { type: 'info', label: '<hr style="width: 100%;" />' },
                { type: 'info', label: 'Select effect type' },
                { type: 'radio', label: 'Burst', options: ['areaType', areaType === 'burst'] },
                { type: 'radio', label: 'Spread', options: ['areaType', areaType === 'spread'] },
                { type: 'radio', label: 'Emanation', options: ['areaType', areaType === 'emanation'] },
                // { type: 'checkbox', label: 'Attach to Token', options: !!movesWithToken }, // todo
            ],
            buttons: [
                {
                    label: ok,
                    value: ok,
                },
                {
                    label: 'Cancel'
                },
            ],
        }, {
            title: `${this.itemPf.data.name} Template`,
        });

        ifDebug(() => console.log('circle dialogResult', dialogResult));

        const { buttons: confirmed } = dialogResult;

        if (confirmed) {
            const [_, grid, self, useDefault, __, ___, burstResult, spreadResult, emanationResult, movesWithTokenResult] = dialogResult.inputs;
            const chosenPlacement = this._getPlacementForLabel(grid || self || useDefault);
            const flags = {
                [MODULE_NAME]: {
                    [CONSTS.flags.placementType]: chosenPlacement,
                    [CONSTS.flags.circle.areaType]: (burstResult || spreadResult || emanationResult || '').toLowerCase(),
                    [CONSTS.flags.circle.movesWithToken]: !!movesWithTokenResult,
                }
            };
            await this.itemPf.update({ flags });
        }

        return !!confirmed;
    }

    _getPlacementForLabel = (label) => {
        for (const placementTypeKey in this._placementTypes) {
            const placement = this._placementTypes[placementTypeKey];
            if (placement.label === label) {
                return placement.key;
            }
        }
        return this._placementTypes[CONSTS.placement.circle.grid].key;
    };

    _getAreaType = () => {
        let areaType = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.circle.areaType);
        if (areaType) {
            return areaType;
        }

        // todo extract these to either a language or a game setting to handle localized terms
        const spellArea = this.itemPf.data.data.spellArea?.toLowerCase() ?? '';
        areaType = 'burst';
        if (spellArea.includes('emanat')) {
            areaType = 'emanation';
        }
        else if (spellArea.includes('spread')) {
            areaType = 'spread';
        }

        return areaType;
    };

    _getPlacementType = () => {
        const placementType = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.placementType);
        return placementType || this._placementTypes[CONSTS.placement.circle.grid].key;
    };
}
