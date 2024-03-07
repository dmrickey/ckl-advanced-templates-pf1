import { CONSTS, MODULE_NAME } from "../../consts";
import { log } from './migration-log';

const migrateItem = async (item) => {
    for (const action of item.actions ?? []) {
        if (action.data.flags?.[MODULE_NAME]) {
            await action.update({
                flags:
                {
                    [MODULE_NAME]: {
                        '-=expireAtTurnEnd': null,
                        '-=exireAtTurnEnd': null,
                        [CONSTS.flags.deletion]: !!action.data.flags[MODULE_NAME]?.expireAtTurnEnd
                            ? [CONSTS.deletionOptions.endOfTurn]
                            : [CONSTS.deletionOptions.doNotDelete],
                    }
                }
            });
        }
    }
};

const migrateGameItems = async () => {
    log('migrating game items');

    for (const item of game.items) {
        if (item.data.flags[MODULE_NAME] && item.data.data.actions?.length) {
            await migrateItem(item);
        }
    }

    log('...finished migrating game items');
};

const migratePacks = async () => {
    log('migrating unlocked packs');

    for (const pack of game.packs.filter(x => x.documentName === "Item" && !x.locked)) {
        const docs = await pack.getDocuments();
        for (const item of docs) {
            await migrateItem(item);
        }
    }

    log('...finished migrating unlocked packs');
};

const migrateWorldActors = async () => {
    log('migrating world actors');

    for (const actor of game.actors) {
        if (actor.data.items?.size) {
            for (const item of actor.data.items) {
                await migrateItem(item);
            }
        }
    }

    log('...migrating world actors');
};

const migrateSyntheticActors = async () => {
    log('migrating synthetic actors');

    const synthetics = [...game.scenes].flatMap(s => s.tokens.filter(t => !t.isLinked));
    for (const synthetic of synthetics.filter(s => s.data.actorData?.items?.length)) {
        for (const item of synthetic.actor?.data?.items?.filter(i => i.data.flags?.[MODULE_NAME] && i.data.data.actions?.length) ?? []) {
            await migrateItem(item);
        }
    }

    log('...finished migrating synthetic actors');
};

export const migrateV2 = async () => {
    await migrateGameItems();
    await migratePacks();
    await migrateWorldActors();
    await migrateSyntheticActors();
}
