import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabaseServer';

// POST /api/transactions
// Creates a new transaction and automatically updates the corresponding
// account balance in a single call so the client does **NOT** have to issue
// multiple requests.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      account_id,
      type, // 'credit' | 'debit'
      amount,
      description,
      category = 'General',
      status = 'completed',
      date = new Date().toISOString(),
    } = body;

    if (!account_id || !amount || !type) {
      return NextResponse.json(
        { error: 'account_id, amount and type are required fields.' },
        { status: 400 },
      );
    }

    // 1. Fetch the account so we know the current balance & number.
    const { data: account, error: accountErr } = await supabaseAdmin
      .from('accounts')
      .select('id,balance,number')
      .eq('id', account_id)
      .single();

    if (accountErr || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // 2. Calculate updated balance.
    const newBalance =
      type === 'credit' ? account.balance + amount : account.balance - amount;

    // You could wrap the following two mutations in a Postgres transaction using
    // RPC if strict atomicity is required. For most hobby projects the two-step
    // approach shown below is sufficient.

    // 3. Insert the transaction row.
    const { data: txn, error: txnErr } = await supabaseAdmin
      .from('transactions')
      .insert({
        account_id,
        account: account.number,
        amount,
        description,
        type,
        date,
        status,
        category,
        reference: `TXN${Date.now()}`,
      })
      .select()
      .single();

    if (txnErr) {
      return NextResponse.json(
        { error: 'Failed to insert transaction', details: txnErr.message },
        { status: 500 },
      );
    }

    // 4. Update the account balance
    const { error: balanceErr } = await supabaseAdmin
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', account_id);

    if (balanceErr) {
      return NextResponse.json(
        { error: 'Transaction saved but failed to update balance', details: balanceErr.message },
        { status: 500 },
      );
    }

    return NextResponse.json(txn, { status: 201 });
  } catch (err: any) {
    console.error('Transaction API error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
