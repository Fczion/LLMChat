import { supabase } from '../lib/supabase';

interface UserLoginData {
  google_id: string;
  email: string;
  full_name: string | null;
  given_name: string | null;
  family_name: string | null;
  photo_url: string | null;
  id_token: string | null;
}

/**
 * Records a user login to Supabase.
 * - Inserts a new row in `user_logins` table (login event)
 * - Creates or updates the user in `users` table (unique user tracking)
 */
export async function recordLogin(userData: UserLoginData): Promise<void> {
  const now = new Date().toISOString();

  // 1. Insert into user_logins (login event)
  const { error: loginError } = await supabase
    .from('user_logins')
    .insert({
      google_id: userData.google_id,
      email: userData.email,
      full_name: userData.full_name,
      given_name: userData.given_name,
      family_name: userData.family_name,
      photo_url: userData.photo_url,
      id_token: userData.id_token,
      login_timestamp: now,
    });

  if (loginError) {
    console.error('Failed to record login event:', loginError);
    throw loginError;
  }

  // 2. Upsert into users table (create or update user)
  const { data: existingUser } = await supabase
    .from('users')
    .select('login_count')
    .eq('google_id', userData.google_id)
    .single();

  if (existingUser) {
    // User exists - update last_login and increment count
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email: userData.email,
        full_name: userData.full_name,
        given_name: userData.given_name,
        family_name: userData.family_name,
        photo_url: userData.photo_url,
        last_login_at: now,
        login_count: existingUser.login_count + 1,
        updated_at: now,
      })
      .eq('google_id', userData.google_id);

    if (updateError) {
      console.error('Failed to update user:', updateError);
      throw updateError;
    }
  } else {
    // New user - insert
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        google_id: userData.google_id,
        email: userData.email,
        full_name: userData.full_name,
        given_name: userData.given_name,
        family_name: userData.family_name,
        photo_url: userData.photo_url,
        first_login_at: now,
        last_login_at: now,
        login_count: 1,
      });

    if (insertError) {
      console.error('Failed to create user:', insertError);
      throw insertError;
    }
  }
}
