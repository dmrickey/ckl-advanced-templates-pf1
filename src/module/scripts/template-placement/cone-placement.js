import { CONSTS, MODULE_NAME } from '../../consts';
import { ifDebug, localize, localizeF } from '../utils';

export class ConePlacement {
    constructor(itemPf) {
        this.itemPf = itemPf;
    }

    _placementTypes = {
        [CONSTS.placement.cone.self]: {
            key: CONSTS.placement.cone.self,
            label: localize('templates.cone.placement.self.label'),
        },
        [CONSTS.placement.cone.selectTargetSquare]: {
            key: CONSTS.placement.cone.selectTargetSquare,
            label: localize('templates.cone.placement.selectTargetSquare.label'),
        },
        [CONSTS.placement.useSystem]: {
            key: CONSTS.placement.useSystem,
            label: localize('templates.placement.useSystem.label'),
        },
    };

    /**
     * Shows the menu, saves the result, then returns the result
     *
     * @returns {bool} True if a placement type was selected, false if it was canceled.
     */
    async showPlacementMenu() {
        const currentPlacementType = this._getPlacementType();
        const deleteAtTurnEnd = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.exireAtTurnEnd);
        const ok = localize('ok');

        const dialogResult = await warpgate.menu({
            inputs: [
                { type: 'info', label: localizeF('templates.placement.selection.label', { itemType: this.itemPf.type }) },
                { type: 'radio', label: this._placementTypes[CONSTS.placement.cone.self].label, options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.cone.self].key] },
                { type: 'radio', label: this._placementTypes[CONSTS.placement.cone.selectTargetSquare].label, options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.cone.selectTargetSquare].key] },
                { type: 'radio', label: this._placementTypes[CONSTS.placement.useSystem].label, options: ['placementType', currentPlacementType === this._placementTypes[CONSTS.placement.useSystem].key] },
                { type: 'checkbox', label: localize('templates.deleteAtTurnEnd'), options: !!deleteAtTurnEnd },
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
            title: localizeF('templates.modalTitle', { itemName: this.itemPf.data.name }),
        });

        ifDebug(() => console.log('cone dialogResult', dialogResult));

        const { buttons: confirmed } = dialogResult;

        if (confirmed) {
            const [_, self, selectTargetSquare, useSystem, deleteAtTurnEndResult] = dialogResult.inputs;
            const chosenPlacement = this._getPlacementForLabel(selectTargetSquare || self || useSystem);
            const flags = {
                [MODULE_NAME]: {
                    [CONSTS.flags.placementType]: chosenPlacement,
                    [CONSTS.flags.exireAtTurnEnd]: !!deleteAtTurnEndResult,
                }
            };
            await this.itemPf.update({ flags });
        }

        return !!confirmed;
    }

    _getSize() {
        const rollData = this.itemPf.actor._rollData;
        return typeof this.itemPf.data.data.measureTemplate.size === 'string'
            ? RollPF.safeTotal(this.itemPf.data.data.measureTemplate.size, rollData)
            : game.pf1.utils.convertDistance(this.itemPf.data.data.measureTemplate.size)[0];
    }

    _getPlacementForLabel = (label) => {
        for (const placementTypeKey in this._placementTypes) {
            const placement = this._placementTypes[placementTypeKey];
            if (placement.label === label) {
                return placement.key;
            }
        }
        return this._placementTypes[CONSTS.placement.cone.self].key;
    };

    _getPlacementType = () => {
        const placementType = this.itemPf.getFlag(MODULE_NAME, CONSTS.flags.placementType);
        return placementType || this._placementTypes[CONSTS.placement.cone.self].key;
    };
}
