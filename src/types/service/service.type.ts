import type { SystemModule } from '../systemModule/system-module.type';

export default interface Service {
  uuid: string;
  name: string;
  description?: string;
  price: string;
  systemModule: SystemModule;
}
