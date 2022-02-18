import { CirclePlacement } from './circle-placement';

const createCircle = async (itemPf, shared, options, wrapped) => {
    const circlePlacement = new CirclePlacement(itemPf);

    let template = await circlePlacement.createCurrentTemplate(options, wrapped);

    while (!template) {
        const result = await circlePlacement.showPlacementMenu();

        if (result) {
            template = await circlePlacement.createCurrentTemplate(options, wrapped);
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

export default createCircle;
