import { isFirstGM } from '../utils';
import { log } from './migration-log';
import { Settings } from '../../settings';
import * as v1 from './migrate-v1';
import * as v2 from './migrate-v2';

const currentMigrationVersion = 2;

export default async () => {
    if (!isFirstGM()) {
        return;
    }

    const current = Settings.migrationVersion || 0;

    if (current !== currentMigrationVersion) {
        log('Starting overall migration');
    }

    if (current < 1) {
        log('Starting first migration');
        await v1.migrateGameItem();
        await v1.migratePacks();
        await v1.migrateWorldActors();
        await v1.migrateSyntheticActors();
    }

    if (current < 2) {
        log('Starting second migration');
        await v2.migrateV2();
    }

    if (current !== currentMigrationVersion) {
        log('Finalized migration');
    }

    Settings.migrationVersion = currentMigrationVersion;
}
