import { useState } from 'react';
import { Sparkles, X, Check, Flame } from 'lucide-react';
import { supabase, type Character } from '@/lib/supabase';
import AvatarPicker from '@/components/AvatarPicker';

type Props = {
  onCreated: (character: Character) => void;
};

const categories = ['Romance', 'Aventura', 'Fantasia', 'Mistério', 'Sci-Fi', 'Original', 'NSFW'];

const defaultAvatar = 'https://images.pexels.com/photos/20198788/pexels-photo-20198788.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export default function CreatePage({ onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [greeting, setGreeting] = useState('');
  const [personality, setPersonality] = useState('');
  const [scenario, setScenario] = useState('');
  const [category, setCategory] = useState('Original');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);
  const [isNsfw, setIsNsfw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim()) return;

    setSaving(true);
    const { data, error } = await supabase
      .from('characters')
      .insert({
        name: name.trim(),
        avatar_url: avatarUrl,
        description: description.trim(),
        greeting: greeting.trim() || `Ola! Eu sou ${name.trim()}. Prazer em te conhecer!`,
        personality: personality.trim(),
        scenario: scenario.trim(),
        category,
        tags,
        creator: 'Voce',
        is_public: true,
        is_nsfw: isNsfw || category === 'NSFW',
        chat_count: 0,
        like_count: 0,
      })
      .select('*')
      .maybeSingle();

    setSaving(false);

    if (data && !error) {
      setSaved(true);
      setTimeout(() => {
        onCreated(data);
        setName('');
        setDescription('');
        setGreeting('');
        setPersonality('');
        setScenario('');
        setTags([]);
        setIsNsfw(false);
        setAvatarUrl(defaultAvatar);
        setSaved(false);
      }, 1200);
    }
  };

  const canSave = name.trim() && description.trim() && !saving;

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 glass border-b border-ink-700/40">
        <div className="px-4 pt-4 pb-3">
          <h1 className="font-display font-bold text-xl text-ink-100">Criar Personagem</h1>
          <p className="text-xs text-ink-400">De vida a um novo personagem virtual</p>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-5 max-w-2xl mx-auto">
        <div className="glass-card p-4">
          <label className="text-xs font-medium text-ink-300 mb-2 block">Avatar</label>
          <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-300 mb-1.5 block">Nome *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Luna Noir"
            className="w-full px-4 py-2.5 input-field text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-300 mb-1.5 block">Descricao *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Uma breve descricao do personagem..."
            rows={2}
            className="w-full px-4 py-2.5 input-field text-sm resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-300 mb-1.5 block">Saudacao</label>
          <textarea
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            placeholder="A primeira mensagem do personagem..."
            rows={3}
            className="w-full px-4 py-2.5 input-field text-sm resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-300 mb-1.5 block">Personalidade</label>
          <textarea
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            placeholder="Tracos de personalidade, historia de fundo, tom de voz..."
            rows={3}
            className="w-full px-4 py-2.5 input-field text-sm resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-300 mb-1.5 block">Cenario</label>
          <textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="Contexto do roleplay, mundo, situacao inicial..."
            rows={2}
            className="w-full px-4 py-2.5 input-field text-sm resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-ink-300 mb-1.5 block">Categoria</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  if (cat === 'NSFW') setIsNsfw(true);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  category === cat
                    ? cat === 'NSFW'
                      ? 'bg-error-500 text-white'
                      : 'bg-brand-500 text-white'
                    : 'bg-ink-800 text-ink-300 hover:bg-ink-700'
                }`}
              >
                {cat === 'NSFW' && <Flame className="w-3 h-3" />}
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-ink-300 mb-1.5 block">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Adicionar tag..."
              className="flex-1 px-4 py-2 input-field text-sm"
            />
            <button
              onClick={addTag}
              className="px-4 py-2 bg-ink-700 hover:bg-ink-600 rounded-xl text-sm text-ink-200 transition-all"
            >
              Adicionar
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-400 text-xs font-medium"
                >
                  {t}
                  <button onClick={() => removeTag(t)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 p-3 glass-card">
          <button
            onClick={() => setIsNsfw(!isNsfw)}
            className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${
              isNsfw ? 'bg-error-500' : 'bg-ink-600'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                isNsfw ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
          <div>
            <p className="text-sm font-medium text-ink-100 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-error-500" />
              Conteudo +18 / NSFW
            </p>
            <p className="text-xs text-ink-400">Marca este personagem como adulto</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full py-3 btn-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Sparkles className="w-5 h-5 animate-pulse-soft" />
              Criando...
            </>
          ) : saved ? (
            <>
              <Check className="w-5 h-5" />
              Personagem criado!
            </>
          ) : (
            'Criar Personagem'
          )}
        </button>
      </div>
    </div>
  );
}
