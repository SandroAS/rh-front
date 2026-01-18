import type JobPositionSimple from '../jobPosition/job-position-simple.type';

export interface UserAvatar {
  uuid: string;
  name: string;
  email: string;
  profile_img_url?: string | null;
  jobPosition?: JobPositionSimple;
}