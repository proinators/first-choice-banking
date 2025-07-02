// File: /src/app/api/auth/login/route.js
import { supabase } from '../../../../lib/supabaseClient';

export async function POST(req) {
  try {
    const { account, password } = await req.json();
    console.log('Login attempt for account:', account);

    // Find user by account number
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('account_number', account)
      .single();

    
    if (error || !user) {
      console.log('User not found or error:', error);
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For demo: compare plaintext (replace with hashed check in prod)
    if (user.password !== password) {
      console.log('Invalid password');
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return user data (excluding password)
    const { password: _, ...userData } = user;
    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}