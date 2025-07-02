import { supabase } from '../../../lib/supabaseClient';

export async function POST(req) {
  try {
    const body = await req.json();
    const { from, to, amount, method, ifsc } = body;
    // 1. Debit from 'from' account
    const { data: fromAcc, error: fromErr } = await supabase
      .from('accounts')
      .select('*')
      .eq('number', from)
      .single();
    if (fromErr || !fromAcc) return new Response(JSON.stringify({ error: 'Invalid sender account' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    if (fromAcc.balance < amount) return new Response(JSON.stringify({ error: 'Insufficient funds' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    // 2. Credit to 'to' account
    const { data: toAcc, error: toErr } = await supabase
      .from('accounts')
      .select('*')
      .eq('number', to)
      .single();
    if (toErr || !toAcc) return new Response(JSON.stringify({ error: 'Invalid recipient account' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    // 3. Update balances
    await supabase.from('accounts').update({ balance: fromAcc.balance - amount }).eq('number', from);
    await supabase.from('accounts').update({ balance: toAcc.balance + amount }).eq('number', to);
    // 4. Insert transactions
    await supabase.from('transactions').insert([
      { account: from, amount: -amount, type: 'Debit', status: 'Completed', description: `Transfer to ${to}`, date: new Date().toISOString().slice(0,10) },
      { account: to, amount: amount, type: 'Credit', status: 'Completed', description: `Transfer from ${from}`, date: new Date().toISOString().slice(0,10) },
    ]);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
