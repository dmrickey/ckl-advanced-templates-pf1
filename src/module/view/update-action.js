import { ifDebug } from "../scripts/utils";

const updateAction = async (action, updates) => {
    ifDebug(() => console.log("Applying updates:", updates));
    await action.update(updates.data, { render: false });
}

export {
    updateAction
}
