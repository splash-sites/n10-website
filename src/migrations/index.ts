import * as migration_20261020_134725_initial from './20261020_134725_initial';
import * as migration_20261023_182947_storage_object_key from './20261023_182947_storage_object_key';

export const migrations = [
  {
    up: migration_20261020_134725_initial.up,
    down: migration_20261020_134725_initial.down,
    name: '20261020_134725_initial',
  },
  {
    up: migration_20261023_182947_storage_object_key.up,
    down: migration_20261023_182947_storage_object_key.down,
    name: '20261023_182947_storage_object_key'
  },
];
