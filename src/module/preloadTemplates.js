/**
 * Preloads templates
 *
 * @returns {object} preloaded templates
 */
export async function preloadTemplates() {
    const templatePaths = [
        // Add paths to "modules/ckl-advanced-templates-pf1/templates"
    ];

    return loadTemplates(templatePaths);
}
