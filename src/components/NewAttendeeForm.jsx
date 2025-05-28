import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function NewAttendeeForm() {
  const [form, setForm] = useState({ name: '', in_community: false });

  async function handleSubmit(e) {
    e.preventDefault();
    const { error } = await supabase
      .from('attendees')
      .insert({
        name: form.name,
        event_added: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        in_community: form.in_community,
      })
      .select();            // returns the newly-created row :contentReference[oaicite:0]{index=0}
    if (error) alert(error.message);
    else setForm({ name: '', in_community: false });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
      <input
        required
        placeholder="Full name"
        className="w-full p-2 border rounded"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={form.in_community}
          onChange={e => setForm({ ...form, in_community: e.target.checked })}
        />
        <span>Already in community</span>
      </label>
      <button className="px-4 py-2 rounded bg-indigo-600 text-white">Save</button>
    </form>
  );
}
