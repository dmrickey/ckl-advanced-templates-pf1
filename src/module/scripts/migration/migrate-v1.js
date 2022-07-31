import { CONSTS, MODULE_NAME } from "../../consts";

const log = msg => console.log(`${MODULE_NAME} - ${msg}`);

// if I ever need to do a v2, the "get action and update" methods are all exactly the same, so call a single method next time

export const migrateGameItem = async () => {
    log('migrating game items');

    for (const item of game.items) {
        if (item.data.flags[MODULE_NAME] && item.data.data.actions?.length) {
            const action = item.actions.entries().next().value[1];

            await action.update({
                flags:
                {
                    [MODULE_NAME]: {
                        ...item.data.flags[MODULE_NAME],
                        [CONSTS.flags.expireAtTurnEnd]: item.data.flags[MODULE_NAME].exireAtTurnEnd
                    }
                }
            });
        }
    }

    log('...finished migrating game items');
};

export const migratePacks = async () => {
    log('migrating unlocked packs');

    for (const pack of game.packs.filter(x => x.documentName === "Item" && !x.locked)) {
        const docs = await pack.getDocuments();
        for (const doc of docs) {
            if (doc.data.flags[MODULE_NAME] && doc.data.data.actions?.length) {
                const action = doc.actions.entries().next().value[1];

                await action.update({
                    flags: {
                        [MODULE_NAME]: {
                            ...doc.data.flags[MODULE_NAME],
                            [CONSTS.flags.expireAtTurnEnd]: doc.data.flags[MODULE_NAME].exireAtTurnEnd
                        }
                    }
                });
            }
        }
    }

    log('...finished migrating unlocked packs');
};

export const migrateWorldActors = async () => {
    log('migrating world actors');

    for (const actor of game.actors) {
        if (actor.data.items?.size) {
            for (const item of actor.data.items) {
                if (item.data.flags[MODULE_NAME] && item.data.data.actions?.length) {
                    const action = item.actions.entries().next().value[1];

                    await action.update({
                        flags: {
                            [MODULE_NAME]: {
                                ...item.data.flags[MODULE_NAME],
                                [CONSTS.flags.expireAtTurnEnd]: item.data.flags[MODULE_NAME].exireAtTurnEnd
                            }
                        }
                    });
                }
            }
        }
    }

    log('...migrating world actors');
};

export const migrateSyntheticActors = async () => {
    log('migrating synthetic actors');

    const synthetics = [...game.scenes].flatMap(s => s.tokens.filter(t => !t.isLinked));
    for (const synthetic of synthetics.filter(s => s.data.actorData?.items?.length)) {
        for (const item of synthetic.actor?.data?.items?.filter(i => i.data.flags?.[MODULE_NAME] && i.data.data.actions?.length)) {
            const action = item.actions.entries().next().value[1];

            await action.update({
                flags: {
                    [MODULE_NAME]: {
                        ...item.data.flags[MODULE_NAME],
                        [CONSTS.flags.expireAtTurnEnd]: item.data.flags[MODULE_NAME].exireAtTurnEnd
                    }
                }
            });
        }
    }

    log('...finished migrating synthetic actors');
};
