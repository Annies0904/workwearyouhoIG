import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(
      `SELECT id, category, question, answer, language, active, created_at, updated_at
       FROM faqs ORDER BY category, id`
    );
    return NextResponse.json(res.rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category = 'general', question, answer, language = 'zh' } = body;
    if (!question || !answer) {
      return NextResponse.json({ error: 'question and answer are required' }, { status: 400 });
    }
    const res = await query(
      `INSERT INTO faqs (category, question, answer, language)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [category, question, answer, language]
    );
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
