import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabaseServer';

// POST /api/credit-cards
// Issues a new credit-card (row in credit_cards) **and** spins up a companion
// account so that spending can be tracked like any other account.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, type, limit, name } = body;

    if (!user_id || !type || !limit || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const maskedNumber = `•••• ${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: card, error: cardErr } = await supabaseAdmin
      .from('credit_cards')
      .insert({
        user_id,
        name,
        type,
        limit,
        balance: 0,
        available: limit,
        number: maskedNumber,
        issuedDate: new Date().toISOString(),
      })
      .select()
      .single();

    if (cardErr) {
      return NextResponse.json({ error: cardErr.message }, { status: 500 });
    }

    const { error: accErr } = await supabaseAdmin
      .from('accounts')
      .insert({
        user_id,
        name: `${type} Credit Card`,
        number: maskedNumber,
        type: 'Credit Card',
        balance: 0,
        creditLimit: limit,
      });

    if (accErr) {
      return NextResponse.json({ error: accErr.message }, { status: 500 });
    }

    return NextResponse.json(card, { status: 201 });
  } catch (err) {
    console.error('Credit card API error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
