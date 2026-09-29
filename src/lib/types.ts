export interface Link {
  id: string;
  user_id: string;
  original_url: string;
  short_code: string;
  title: string | null;
  folder_id: string | null;
  tags: string[];
  password_hash: string | null;
  expires_at: string | null;
  is_active: boolean;
  clicks_count: number;
  created_at: string;
  updated_at: string;
}

export interface Click {
  id: string;
  link_id: string;
  ip_hash: string | null;
  country: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  created_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'admin';
}

export interface NewLinkInput {
  original_url: string;
  short_code: string;
  title?: string;
  folder_id?: string | null;
  tags?: string[];
  password_hash?: string | null;
  expires_at?: string | null;
}
