import { CONSTS, MODULE_NAME } from '../../consts';
import { ifDebug, localize } from '../utils';

export class CirclePlacement {
    // emanation or burst "centered on you" spreads from edge - not center

    constructor(itemPf) {
        this.itemPf = itemPf;
    }

    _placementTypes = {
        [CONSTS.placement.circle.grid]: {
            key: CONSTS.placement.circle.grid,
            label: localize('templates.circle.placement.grid.label'),
        },
        [CONSTS.placement.circle.self]: {
            key: CONSTS.placement.circle.self,
            label: localize('templates.circle.placement.self.label'),
        },
        [CONSTS.placement.circle.splash]: {
            key: CONSTS.placement.circle.splash,
            label: localize('templates.circle.placement.splash.label'),
        },
        [CONSTS.placement.useSystem]: {
            key: CONSTS.placement.useSystem,
            label: localize('templates.placement.useSystem.label'),
        },
    };

    async showPlacementMenu() {
        const areaType = this._getAreaType();
        const currentPlacementType = this._getPlacementType();
        const movesWithToken = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.circle.movesWithToken);
        const deleteAtTurnEnd = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.exireAtTurnEnd);
        const ignoreRange = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.ignoreRange);
        const ok = localize("ok");

        const dialogResult = await warpgate.menu({
            inputs: [
                { type: 'info', label: localize('templates.placement.selection.label', { itemType: this.itemPf.type }) },
                { type: 'radio', label: this._placementTypes[CONSTS.placement.circle.grid].label, options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.circle.grid].key] },
                { type: 'radio', label: this._placementTypes[CONSTS.placement.circle.self].label, options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.circle.self].key] },
                { type: 'radio', label: this._placementTypes[CONSTS.placement.circle.splash].label, options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.circle.splash].key] },
                { type: 'radio', label: this._placementTypes[CONSTS.placement.useSystem].label, options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.useSystem].key] },
                { type: 'info', label: '<hr style="width: 100%;" />' },
                { type: 'info', label: localize('templates.circle.placement.type.label') },
                { type: 'radio', label: localize('templates.circle.placement.type.burst'), options: ['areaType', areaType === 'burst'] },
                { type: 'radio', label: localize('templates.circle.placement.type.emanation'), options: ['areaType', areaType === 'emanation'] },
                { type: 'radio', label: localize('templates.circle.placement.type.spread'), options: ['areaType', areaType === 'spread'] },
                { type: 'checkbox', label: localize('templates.deleteAtTurnEnd'), options: !!deleteAtTurnEnd },
                { type: 'checkbox', label: localize('templates.ignoreRange'), options: !!ignoreRange },
                { type: 'checkbox', label: localize('templates.circle.placement.attachToToken'), options: !!movesWithToken },
            ],
            buttons: [
                {
                    label: ok,
                    value: ok,
                },
                {
                    label: localize('cancel')
                },
            ],
        }, {
            title: localize('templates.modalTitle', { itemName: this.itemPf.data.name }),
        });

        ifDebug(() => console.log('circle dialogResult', dialogResult));

        const { buttons: confirmed } = dialogResult;

        if (confirmed) {
            const [_, grid, self, splash, useDefault, __, ___, burstResult, emanationResult, spreadResult, deleteAtTurnEndResult, ignoreRangeResult, movesWithTokenResult] = dialogResult.inputs;
            const chosenPlacement = this._getPlacementForLabel(grid || self || splash || useDefault);
            const chosenAreaType = (burstResult && CONSTS.areaType.burst)
                || (spreadResult && CONSTS.areaType.spread)
                || (emanationResult && CONSTS.areaType.emanation)
                || '';
            const flags = {
                [MODULE_NAME]: {
                    [CONSTS.flags.placementType]: chosenPlacement,
                    [CONSTS.flags.circle.areaType]: chosenAreaType,
                    [CONSTS.flags.circle.movesWithToken]: !!movesWithTokenResult,
                    [CONSTS.flags.exireAtTurnEnd]: !!deleteAtTurnEndResult,
                    [CONSTS.flags.ignoreRange]: !!ignoreRangeResult,
                }
            };
            await this.itemPf.update({ flags });
        }

        return !!confirmed;
    }

    _getAreaType = () => {
        const areaType = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.circle.areaType);
        if (areaType) {
            return areaType;
        }

        // todo extract these to either a language or a game setting to handle localized terms
        const spellArea = this.itemPf.data.data.spellArea?.toLowerCase() ?? '';
        if (spellArea.includes('emanat') || spellArea.includes(localize('templates.circle.placement.type.emanation').toLowerCase())) {
            return CONSTS.areaType.emanation;
        }
        else if (spellArea.includes('spread') || spellArea.includes(localize('templates.circle.placement.type.spread').toLowerCase())) {
            return CONSTS.areaType.spread;
        }

        return CONSTS.areaType.burst;
    };

    _getPlacementForLabel = (label) => {
        for (const placementTypeKey in this._placementTypes) {
            const placement = this._placementTypes[placementTypeKey];
            if (placement.label === label) {
                return placement.key;
            }
        }
        return this._placementTypes[CONSTS.placement.circle.grid].key;
    };

    _getPlacementType = () => {
        const placementType = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.placementType);
        return placementType || this._placementTypes[CONSTS.placement.circle.grid].key;
    };
}
