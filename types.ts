export interface DiaryEntry {
  id: string; // Will be a UUID from Supabase
  date: string; // ISO string
  title: string;
  content: string;
  owner_id: string;
  created_at: string;
  tags?: string[];
  mood?: string;
}

export interface Profile {
  id: string;
  salt: string;
  key_check_value: string;
  key_check_iv: string;
}

export type ViewState = 
  | { view: 'list' }
  | { view: 'entry'; id: string }
  | { view: 'edit'; id: string }
  | { view: 'new' }
  | { view: 'calendar' };