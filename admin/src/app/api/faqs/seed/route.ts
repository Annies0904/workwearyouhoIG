import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import faqs from '../../../../../../locales/zh/faq.json';

export async function GET() {
  try {
    for (const faq of faqs) {
      await query(
        `INSERT INTO faqs (category, question, answer, language)
         VALUES ($1, $2, $3, 'zh')
         ON CONFLICT (question, language) DO NOTHING`,
        [faq.category, faq.question, faq.answer]
      );
    }
    return NextResponse.json({ seeded: faqs.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
