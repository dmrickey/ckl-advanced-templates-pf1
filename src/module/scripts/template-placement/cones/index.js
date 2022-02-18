
import { getToken } from '../../utils';
import { ConePlacement } from './cone-placement';

const createCone = async (itemPf, shared, options, wrapped) => {
    const token = getToken(itemPf);
    const conePlacment = new ConePlacement(itemPf);

    let template = await conePlacment.createCurrentTemplate(options, token, wrapped);

    while (!template) {
        const result = await conePlacment.showPlacementMenu(options.distance === 15);

        if (result) {
            template = await conePlacment.createCurrentTemplate(options, token, wrapped);
        }
        else {
            return { result: false };
        }
    }

    // because wrapped is called so deeply, checking a shared variable to see if wrapped was called or if custom placement was called
    if (shared.template) {
        return template;
    }

    shared.template = template;
    return {
        delete: () => template.delete(),
        place: () => { },
        result: true,
    };
};

export default createCone;
