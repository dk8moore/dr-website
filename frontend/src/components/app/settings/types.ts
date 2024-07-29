export type SettingsTab = 'Profile' | 'Account' | 'Security';

export interface UserProfile {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  birth_date: string;
  phone_number: string;
  address: string;
  profile_picture: string | null;
}
