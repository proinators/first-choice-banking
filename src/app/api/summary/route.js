import { supabase } from '../../../lib/supabaseClient';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const account_number = searchParams.get('account_number');
  if (!account_number) {
    return new Response(JSON.stringify({ error: 'Missing account_number' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Get accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_account_number', account_number);

  // Get credit cards
  const { data: credit_cards } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('user_account_number', account_number);

  // Get FDs
  const { data: fixed_deposits } = await supabase
    .from('fixed_deposits')
    .select('*')
    .eq('user_account_number', account_number);

  return new Response(
    JSON.stringify({ accounts, credit_cards, fixed_deposits }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
