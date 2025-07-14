import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Ignore the error if it's because no user was found (PGRST116), which is expected.
    if (existingUserError && existingUserError.code !== 'PGRST116') {
        console.error('Error checking for existing user:', existingUserError);
        return NextResponse.json({ error: 'Error checking for existing user' }, { status: 500 });
    }

    // Insert new user into the database with plain text password
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email,
        password, // Storing password in plain text as requested
        full_name: fullName,
      })
      .select('id, email, full_name, created_at')
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return NextResponse.json({ error: 'Could not create user' }, { status: 500 });
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
