import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(templates);
  }

  if (req.method === 'POST') {
    const { id, title, content } = req.body;
    const { data, error } = await supabase
      .from('templates')
      .insert([{ id, title, content }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
