import { supabase } from '../../../lib/supabaseClient';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const account_number = searchParams.get('account_number');
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const date = searchParams.get('date');

  let query = supabase.from('transactions').select('*');
  if (account_number) query = query.eq('account', account_number);
  if (type && type !== 'All') query = query.eq('type', type);
  if (status && status !== 'All') query = query.eq('status', status);
  if (date) query = query.eq('date', date);
  const { data, error } = await query.order('date', { ascending: false });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return new Response(JSON.stringify({ transactions: data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
