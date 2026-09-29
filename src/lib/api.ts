import { supabase } from './supabase';
import type { Link, Click, Folder, NewLinkInput } from './types';
import { generateShortCode, isExpired } from './shortener';
import { detectDeviceInfo, detectCountry, getReferrer } from './analytics';

function uniqueCode(length = 6): string {
  let code = generateShortCode(length);
  return code;
}

export async function createLink(input: NewLinkInput): Promise<Link> {
  const { data, error } = await supabase
    .from('links')
    .insert({
      original_url: input.original_url,
      short_code: input.short_code,
      title: input.title || null,
      folder_id: input.folder_id || null,
      tags: input.tags || [],
      password_hash: input.password_hash || null,
      expires_at: input.expires_at || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Link;
}

export async function getLinks(): Promise<Link[]> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Link[];
}

export async function updateLink(id: string, updates: Partial<Link>): Promise<Link> {
  const { data, error } = await supabase
    .from('links')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Link;
}

export async function deleteLink(id: string): Promise<void> {
  const { error } = await supabase.from('links').delete().eq('id', id);
  if (error) throw error;
}

export async function getLinkByCode(code: string): Promise<Link | null> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('short_code', code)
    .maybeSingle();

  if (error) throw error;
  return data as Link | null;
}

export async function recordClick(linkId: string): Promise<void> {
  const info = detectDeviceInfo();
  const { error } = await supabase.from('clicks').insert({
    link_id: linkId,
    device: info.device,
    browser: info.browser,
    os: info.os,
    country: detectCountry(),
    referrer: getReferrer(),
  });
  if (error) {
    // Non-fatal: don't block the redirect
    console.warn('Failed to record click:', error.message);
  }
}

export async function incrementClickCount(code: string): Promise<void> {
  const { error } = await supabase.rpc('increment_clicks', { target_code: code });
  if (error) console.warn('Failed to increment clicks:', error.message);
}

export async function getClicks(linkId: string): Promise<Click[]> {
  const { data, error } = await supabase
    .from('clicks')
    .select('*')
    .eq('link_id', linkId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as Click[];
}

export async function getAllClicksForUser(linkIds: string[]): Promise<Click[]> {
  if (linkIds.length === 0) return [];
  const { data, error } = await supabase
    .from('clicks')
    .select('*')
    .in('link_id', linkIds)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as Click[];
}

export async function createFolder(name: string): Promise<Folder> {
  const { data, error } = await supabase
    .from('folders')
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return data as Folder;
}

export async function getFolders(): Promise<Folder[]> {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []) as Folder[];
}

export async function deleteFolder(id: string): Promise<void> {
  const { error } = await supabase.from('folders').delete().eq('id', id);
  if (error) throw error;
}

export { uniqueCode, isExpired };
