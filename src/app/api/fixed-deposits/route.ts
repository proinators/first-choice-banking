import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabaseServer';

// POST /api/fixed-deposits
// Creates a new Fixed Deposit, deducts the amount from the source account and
// records a debit transaction – all handled on the server so the client remains
// simple.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      accountNumber,
      amount,
      tenure,
      interestRate,
      interestPayout,
      startDate,
      maturityDate,
      nominee,
      // The caller should already be authenticated; their user_id will be
      // injected via Row Level Security policies. Nevertheless you may also
      // accept it here if you want explicit control.
      user_id,
    } = body;

    if (!accountNumber || !amount || !tenure) {
      return NextResponse.json(
        { error: 'accountNumber, amount and tenure are required.' },
        { status: 400 },
      );
    }

    // 1. Pull the source account (we search by account number because that is
    // what the UI sends us)
    const { data: account, error: accErr } = await supabaseAdmin
      .from('accounts')
      .select('id,balance,user_id')
      .eq('number', accountNumber)
      .single();

    if (accErr || !account) {
      return NextResponse.json({ error: 'Source account not found' }, { status: 404 });
    }

    // 2. Ensure sufficient balance
    if (account.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // 3. Create FD row
    const fdNumber = `FD${Date.now().toString().slice(-6)}`;
    const { data: fd, error: fdErr } = await supabaseAdmin
      .from('fixed_deposits')
      .insert({
        accountNumber,
        amount,
        tenure,
        interestRate,
        interestPayout,
        startDate,
        maturityDate,
        nominee,
        user_id: user_id || account.user_id,
        fdNumber,
        status: 'active',
      })
      .select()
      .single();

    if (fdErr) {
      return NextResponse.json(
        { error: 'Failed to create fixed deposit', details: fdErr.message },
        { status: 500 },
      );
    }

    // 4. Record debit transaction & update balance ATOMICALLY
    const newBalance = account.balance - amount;

    // Ideally run in a Postgres transaction or use Supabase RLS + "rpc".
    const [{ error: balErr }, { error: txnErr }] = await Promise.all([
      supabaseAdmin
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', account.id),
      supabaseAdmin
        .from('transactions')
        .insert({
          account_id: account.id,
          account: accountNumber,
          amount,
          description: `Fixed Deposit - ${fdNumber}`,
          type: 'debit',
          date: new Date().toISOString(),
          status: 'completed',
          category: 'Fixed Deposit',
          reference: `TXN${Date.now()}`,
        }),
    ]);

    if (balErr || txnErr) {
      return NextResponse.json(
        { error: 'FD created but failed bookkeeping', balErr, txnErr },
        { status: 500 },
      );
    }

    return NextResponse.json(fd, { status: 201 });
  } catch (err: any) {
    console.error('FD API error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
