import { CONSTS, MODULE_NAME } from "../consts";
import { ifDebug } from "./utils";

const deleteTemplatesForToken = async (tokenId) => {
    const templateIds = _getTemplateIdsForToken(tokenId);
    if (templateIds.length) {
        ifDebug(() => console.log(`Deleting templates for token (${tokenId})`, templateIds));
        await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", templateIds);
    }
};

const moveTemplatesToToken = async ({ id, x, y }) => {
    const templateIds = _getTemplateIdsForToken(id);
    if (templateIds.length) {
        ifDebug(() => console.log(`Moving templates for token (${id})`, templateIds));
        const updates = templateIds.map((templateId) => ({ _id: templateId, x, y }));
        await canvas.scene.updateEmbeddedDocuments("MeasuredTemplate", updates);
    }
};

const getTemplatesAttachedToToken = (tokenId) => canvas.templates.placeables
    .filter((t) => !!t.document.flags?.[MODULE_NAME]?.[CONSTS.flags.circle.movesWithToken])
    .filter((t) => t.document.flags?.[MODULE_NAME]?.tokenId === tokenId);

const _getTemplateIdsForToken = (tokenId) => getTemplatesAttachedToToken(tokenId)
    .map((t) => t.id);

export {
    deleteTemplatesForToken,
    getTemplatesAttachedToToken,
    moveTemplatesToToken,
};
