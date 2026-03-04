import { query } from '@/lib/db';

interface Faq {
  id: number;
  category: string;
  question: string;
  answer: string;
  language: string;
  active: boolean;
}

async function getFaqs(): Promise<Faq[]> {
  try {
    const res = await query<Faq>(
      `SELECT id, category, question, answer, language, active
       FROM faqs
       ORDER BY category, id`
    );
    return res.rows;
  } catch {
    return [];
  }
}

export default async function FaqsPage() {
  const faqs = await getFaqs();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">常見問題管理</h1>
        <a
          href="/api/faqs/seed"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
        >
          匯入預設 FAQ
        </a>
      </div>

      {faqs.length === 0 ? (
        <p className="text-gray-500">尚無 FAQ。請點擊「匯入預設 FAQ」載入中文範本。</p>
      ) : (
        <div className="space-y-4">
          {faqs.map(faq => (
            <div key={faq.id} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${faq.active ? 'border-indigo-400' : 'border-gray-200 opacity-60'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                  {faq.category}
                </span>
                <span className="text-xs text-gray-400">{faq.language}</span>
                {!faq.active && (
                  <span className="text-xs text-red-400 font-medium">已停用</span>
                )}
              </div>
              <p className="font-medium text-gray-800">{faq.question}</p>
              <p className="mt-1 text-sm text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
