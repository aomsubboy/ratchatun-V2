import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { internal_code, pin } = await req.json();
    if (!internal_code || !pin) {
      return NextResponse.json({ ok: false, error: 'MISSING_FIELDS' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('app_user')
      .select('id, role, first_name, last_name, pin_hash, facility_id, unit_id, is_active')
      .eq('internal_code', internal_code)
      .maybeSingle();

    if (error) throw error;
    if (!data || !data.is_active) {
      return NextResponse.json({ ok: false, error: 'USER_NOT_FOUND_OR_INACTIVE' }, { status: 404 });
    }

    if (!data.pin_hash) {
      return NextResponse.json({ ok: false, error: 'NO_PIN_SET' }, { status: 403 });
    }

    const pinOk = await bcrypt.compare(String(pin), data.pin_hash);
    if (!pinOk) {
      return NextResponse.json({ ok: false, error: 'INVALID_PIN' }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: data.id,
        name: `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim(),
        role: data.role,
        facility_id: data.facility_id,
        unit_id: data.unit_id
      }
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: 'SERVER_ERROR' }, { status: 500 });
  }
}
