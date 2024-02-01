import { CONSTS, MODULE_NAME } from "../consts";

class DurationTracker {
    static isExpired = (templatePlaceable) => {
        const now = game.time.worldTime;
        const { combat } = game;

        const expiration = templatePlaceable.document.flags?.[MODULE_NAME]?.[CONSTS.flags.expirationTime]?.at;
        if (!expiration) {
            return false;
        }

        if (combat?.combatant?.initiative !== null) {
            const initiative = templatePlaceable.document.flags?.[MODULE_NAME]?.[CONSTS.flags.expirationTime]?.initiative || 0;

            return expiration === now
                ? initiative >= combat.combatant.initiative
                : expiration < now;
        }

        return expiration <= now;
    };

    static async removeExpiredTemplates() {
        const templateIds = canvas.templates.placeables
            .filter(DurationTracker.isExpired)
            .map((t) => t.id);

        if (templateIds.length) {
            await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", templateIds);
        }
    }

    static init() {
        Hooks.on('deleteCombat', async (_combat) => {
            warpgate.plugin.queueUpdate(() => DurationTracker.removeExpiredTemplates());
        });

        Hooks.on('updateCombat', async (combat, changed) => {
            if (
                // if going from "beginnging of combat" to "first round of combat"
                !('turn' in changed || 'round' in changed) && changed.round !== 1
                // if there are no combatants.. double check how this behaves and whether or not I need it
                || !game.combats.get(combat.id).combatants.size
            ) {
                return;
            }

            warpgate.plugin.queueUpdate(() => DurationTracker.removeExpiredTemplates());
        });

        Hooks.on('updateWorldTime', async (_worldTime, delta) => {
            if (delta) {
                warpgate.plugin.queueUpdate(() => DurationTracker.removeExpiredTemplates());
            }
        });
    }
}

export { DurationTracker };
