import { Settings } from '../../settings';
import * as v1 from './migrate-v1';

const currentMigrationVersion = 1;

export default async () => {
    const current = Settings.migrationVersion || 0;

    if (current < 1) {
        await v1.migrateGameItem();
        await v1.migratePacks();
        await v1.migrateWorldActors();
        await v1.migrateSyntheticActors();
        Settings.migrationVersion = currentMigrationVersion;
    }
}
