import { CONSTS, MODULE_NAME } from "../consts";
import { isFirstGM } from "./utils";

class DurationTracker {
    static isExpired = (templatePlaceable) => {
        const now = game.time.worldTime;
        const { combat } = game;

        const { at, initiative } = templatePlaceable.document.flags?.[MODULE_NAME]?.[CONSTS.flags.expirationTime] || {};

        if (!at) {
            return false;
        }

        const currentInitiative = combat?.combatant?.initiative;
        if (currentInitiative || currentInitiative === 0) {
            return at === now
                ? (initiative || 0) >= currentInitiative
                : at < now;
        }

        return at <= now;
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
            if (!isFirstGM()) {
                return;
            }

            warpgate.plugin.queueUpdate(() => DurationTracker.removeExpiredTemplates());
        });

        Hooks.on('updateCombat', async (combat, changed) => {
            if (!isFirstGM()) {
                return;
            }

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
            if (!isFirstGM()) {
                return;
            }

            if (delta) {
                warpgate.plugin.queueUpdate(() => DurationTracker.removeExpiredTemplates());
            }
        });
    }
}

export { DurationTracker };
