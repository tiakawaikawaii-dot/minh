import { useEffect, useState } from 'react';
import { User, Plus, Trash2, X, Check } from 'lucide-react';
import { supabase, type Persona } from '@/lib/supabase';
import AvatarPicker from '@/components/AvatarPicker';

const defaultAvatar = 'https://images.pexels.com/photos/20140722/pexels-photo-20140722.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPersonas();
  }, []);

  async function fetchPersonas() {
    setLoading(true);
    const { data } = await supabase.from('personas').select('*').order('created_at', { ascending: false });
    setPersonas(data || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const { data } = await supabase
      .from('personas')
      .insert({
        name: name.trim(),
        avatar_url: avatarUrl,
        description: description.trim(),
      })
      .select('*')
      .maybeSingle();

    if (data) {
      setPersonas((prev) => [data, ...prev]);
      setName('');
      setDescription('');
      setAvatarUrl(defaultAvatar);
      setShowForm(false);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from('personas').delete().eq('id', id);
    setPersonas((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 glass border-b border-ink-700/40">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl text-ink-100">Personas</h1>
            <p className="text-xs text-ink-400">Perfis para interpretar</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="p-2 rounded-xl bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-all"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="px-4 pt-4 max-w-2xl mx-auto">
        {showForm && (
          <div className="glass-card p-4 mb-4 space-y-4 animate-slide-up">
            <div>
              <label className="text-xs font-medium text-ink-300 mb-2 block">Avatar</label>
              <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-300 mb-1.5 block">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Aventureiro, Detetive, Estudante..."
                className="w-full px-4 py-2.5 input-field text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-300 mb-1.5 block">Descricao</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Quem e esta persona? Como ela se comporta?"
                rows={2}
                className="w-full px-4 py-2.5 input-field text-sm resize-none"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="w-full py-2.5 btn-primary flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Check className="w-4 h-4" />
              Salvar Persona
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 glass-card">
                <div className="w-12 h-12 rounded-xl bg-ink-800 animate-pulse-soft" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 bg-ink-800 rounded animate-pulse-soft" />
                  <div className="h-2.5 w-2/3 bg-ink-800 rounded animate-pulse-soft" />
                </div>
              </div>
            ))}
          </div>
        ) : personas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <User className="w-12 h-12 text-ink-600 mb-3" />
            <p className="text-ink-400 text-sm mb-1">Nenhuma persona criada</p>
            <p className="text-ink-500 text-xs">Crie personas para interpretar diferentes personagens</p>
          </div>
        ) : (
          <div className="space-y-2">
            {personas.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 glass-card group hover:border-brand-500/30 transition-all"
              >
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-ink-700 flex items-center justify-center">
                    <User className="w-6 h-6 text-ink-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-sm text-ink-100 truncate">{p.name}</h3>
                  <p className="text-xs text-ink-400 truncate">{p.description || 'Sem descricao'}</p>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 rounded-lg text-ink-500 hover:text-error-500 hover:bg-error-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
