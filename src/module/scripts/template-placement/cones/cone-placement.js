import { MODULE_NAME } from '../../../consts';
import * as create from './placements';

export class ConePlacement {
    static placementKey = 'conePlacement';

    constructor(itemPf) {
        this.itemPf = itemPf;
    }

    placementTypes = {
        use15: {
            key: 'use15',
            label: `Use Standard 15' Cone`,
            func: async (options, token) => await create.createCone15(options, token),
        },
        useDefault: {
            key: 'useDefault',
            label: 'Use System Default',
            func: async (_options, _token, wrapped) => {
                const defaultTemplateResult = await wrapped();
                if (defaultTemplateResult.result) {
                    return defaultTemplateResult;
                }
            }
        },
        useAlternate: {
            key: 'useAlternate',
            label: `Use Alternate 15' Cone`,
            func: async (options, token) => await create.createConeOtherDistance(options, token),
        },
        selectSource: {
            key: 'selectSource',
            label: 'Select Source Square',
            func: async (options) => await create.createCone(options),
        },

        // if no flag is set
        [undefined]: {
            func: async (options, token) => await create.createCone(options, token),
        },
    };

    async createCurrentTemplate(options, token, wrapped) {
        const getHandler = (key) => this.placementTypes[key] || this.placementTypes[undefined];
        const handler = getHandler(this.itemPf.getFlag(MODULE_NAME, ConePlacement.placementKey));
        return await handler.func(options, token, wrapped);
    }

    /**
     * Shows the menu, saves the result, then returns the result
     *
     * @param {*} is15Feet If the cone is 15 or not
     *
     * @returns {bool} True if a placement type was selected, false if it was canceled.
     */
    async showPlacementMenu(is15Feet) {
        const makeButton = ({ key: value, label }) => ({ label, value });

        const buttons = [
            makeButton(this.placementTypes.selectSource),
            makeButton(this.placementTypes.useDefault),
            {
                label: 'Cancel'
            },
        ];
        if (is15Feet) {
            buttons.unshift(makeButton(this.placementTypes.useAlternate));
            buttons.unshift(makeButton(this.placementTypes.use15));
        }

        const dialogResult = await warpgate.menu({
            inputs: [{ type: 'info', label: `Select placement type for this ${this.itemPf.type}` }],
            buttons,
        }, {
            title: `${this.itemPf.data.name} Template`,
        });

        const { buttons: placementType } = dialogResult;

        if (placementType) {
            await this.itemPf.setFlag(MODULE_NAME, ConePlacement.placementKey, placementType);
        }

        return !!placementType;
    }
}
