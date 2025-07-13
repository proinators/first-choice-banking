import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabaseServer';

/*
 POST /api/transfer
 Body: {
   from_account_id: string,
   to_account_number: string,
   amount: number,
   remarks?: string
 }
*/
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from_account_id, to_account_number, amount, remarks = '' } = body;

    if (!from_account_id || !to_account_number || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    // Get source account
    const { data: fromAcc, error: fromErr } = await supabaseAdmin
      .from('accounts')
      .select('id,balance,number,user_id')
      .eq('id', from_account_id)
      .single();
    if (fromErr || !fromAcc) return NextResponse.json({ error: 'Source account not found' }, { status: 404 });

    // Ensure sufficient balance
    if (fromAcc.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Get destination account by number
    const { data: toAcc, error: toErr } = await supabaseAdmin
      .from('accounts')
      .select('id,balance,number,user_id')
      .eq('number', to_account_number)
      .single();
    if (toErr || !toAcc) return NextResponse.json({ error: 'Destination account not found' }, { status: 404 });

    // Compute new balances
    const newFromBal = fromAcc.balance - amount;
    const newToBal = toAcc.balance + amount;

    const reference = `TXN${Date.now()}`;
    console.log(reference);
    console.log("transactiondone");
    // Perform updates in parallel (ideally use an RPC for atomicity)
    const [{ error: upFromErr }, { error: upToErr }, { error: insErr }] = await Promise.all([
      supabaseAdmin.from('accounts').update({ balance: newFromBal }).eq('id', fromAcc.id),
      supabaseAdmin.from('accounts').update({ balance: newToBal }).eq('id', toAcc.id),
      supabaseAdmin.from('transactions').insert([
        {
          account_id: fromAcc.id,
          account: fromAcc.number,
          amount,
          description: `Transfer to ${toAcc.number}${remarks ? ' - ' + remarks : ''}`,
          type: 'debit',
          date: new Date().toISOString(),
          status: 'completed',
          category: 'Transfer',
          reference,
        },
        {
          account_id: toAcc.id,
          account: toAcc.number,
          amount,
          description: `Transfer from ${fromAcc.number}${remarks ? ' - ' + remarks : ''}`,
          type: 'credit',
          date: new Date().toISOString(),
          status: 'completed',
          category: 'Transfer',
          reference,
        },
      ]),
    ]);

    if (upFromErr || upToErr || insErr) {
      console.log(upFromErr, upToErr, insErr);
      return NextResponse.json({ error: 'Failed to complete transfer' }, { status: 500 });
    }

    return NextResponse.json({ reference, newFromBal, newToBal }, { status: 201 });
  } catch (err) {
    console.error('Transfer API error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
