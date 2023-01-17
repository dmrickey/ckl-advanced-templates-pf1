import { CONSTS, MODULE_NAME } from "../consts";
import { ifDebug } from "./utils";

const deleteTemplatesForToken = async (token) => {
    const templateIds = _getTemplateIdsForToken(token);
    if (templateIds.length) {
        ifDebug(() => console.log(`Deleting templates for token (${token.id})`, templateIds));
        await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", templateIds);
    }
};

const moveTemplatesToToken = async (token) => {
    const templateIds = _getTemplateIdsForToken(token);
    if (templateIds.length) {
        ifDebug(() => console.log(`Moving templates for token (${token.id})`, templateIds));
        const updates = templateIds.map((id) => ({ _id: id, ...token.object.center }));
        await canvas.scene.updateEmbeddedDocuments("MeasuredTemplate", updates);
    }
};

const _getTemplateIdsForToken = (token) => canvas.templates.placeables
    .filter((t) => !!t.document.flags?.[MODULE_NAME]?.[CONSTS.flags.circle.movesWithToken])
    .filter((t) => t.document.flags?.[MODULE_NAME]?.tokenId === token.id)
    .map((t) => t.id);

export {
    deleteTemplatesForToken,
    moveTemplatesToToken,
};
