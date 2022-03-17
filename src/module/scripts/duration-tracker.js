import { CONSTS, MODULE_NAME } from "../consts";

class DurationTracker {
    static endOfTurn = 'endOfTurn';

    static endOfTurnExpirations = [];

    static endOfTurnCallback(callback) {
        DurationTracker.endOfTurnExpirations.push(callback);
    }

    static async expireAll() {
        for (const e of DurationTracker.endOfTurnExpirations) {
            try {
                await e();
            }
            catch {
                // don't really care
            }
        }
        DurationTracker.endOfTurnExpirations = [];

        await DurationTracker.removeEndOfTurnTemplates();
    }

    static async removeEndOfTurnTemplates() {
        const templateIds = canvas.templates.placeables
            .filter((t) => !!t.data.flags?.[MODULE_NAME]?.[CONSTS.flags.exireAtTurnEnd])
            .map((t) => t.id);

        if (templateIds.length) {
            await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", templateIds);
        }
    }

    static init() {
        Hooks.on('deleteCombat', async (_combat) => {
            warpgate.plugin.queueUpdate(() => DurationTracker.expireAll());
        });

        Hooks.on('updateCombat', async (combat, changed) => {
            if (!('turn' in changed || 'round' in changed) && changed.round !== 1
                || game.combats.get(combat.id).data.combatants.size === 0
            ) {
                return;
            }

            warpgate.plugin.queueUpdate(() => DurationTracker.expireAll());
        });

        Hooks.on('updateWorldTime', async (_worldTime, delta) => {
            if (delta) {
                warpgate.plugin.queueUpdate(() => DurationTracker.expireAll());
            }
        });
    }
}

export { DurationTracker };
