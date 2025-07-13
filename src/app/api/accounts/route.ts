import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabaseServer';

// POST /api/accounts
// Creates a new bank account for the authenticated user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, name, type, initialDeposit = 0 } = body;

    if (!user_id || !name || !type) {
      return NextResponse.json({ error: 'user_id, name and type are required' }, { status: 400 });
    }

    const accountNumber = `${Math.floor(1000000000 + Math.random() * 9000000000)}`; // pseudo random 10-digit

    const { data: account, error } = await supabaseAdmin
      .from('accounts')
      .insert({
        user_id,
        name,
        type,
        number: accountNumber,
        balance: initialDeposit,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If there is an initial deposit create a credit transaction
    if (initialDeposit > 0) {
      await supabaseAdmin.from('transactions').insert({
        account_id: account.id,
        account: account.number,
        amount: initialDeposit,
        description: 'Initial deposit',
        type: 'credit',
        date: new Date().toISOString(),
        status: 'completed',
        category: 'Deposit',
        reference: `TXN${Date.now()}`,
      });
    }

    return NextResponse.json(account, { status: 201 });
  } catch (err) {
    console.error('Create account error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
