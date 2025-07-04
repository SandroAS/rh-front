import type { AccountTrial } from '../account/account-trial.type';
import type { SystemModule } from '../systemModule/system-module.type';

export interface UserAccount {
  uuid: string;
  last_trial_id?: number;
  lastTrial?: AccountTrial;
  systemModules: SystemModule[];
}
