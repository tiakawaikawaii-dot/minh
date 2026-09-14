import { useEffect, useState, useCallback } from 'react';
import { Search, TrendingUp, Sparkles, Filter } from 'lucide-react';
import { supabase, type Character } from '@/lib/supabase';
import CharacterCard from '@/components/CharacterCard';

type Props = {
  onCharacterClick: (character: Character) => void;
};

const categories = ['Todos', 'Romance', 'Aventura', 'Fantasia', 'Mistério', 'Sci-Fi', 'NSFW'];

export default function DiscoverPage({ onCharacterClick }: Props) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);

  const fetchCharacters = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('characters').select('*').eq('is_public', true);

    if (category !== 'Todos') {
      query = query.eq('category', category);
    }

    if (search.trim()) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`
      );
    }

    query = query.order('chat_count', { ascending: false }).limit(50);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching characters:', error);
    } else {
      setCharacters(data || []);
    }
    setLoading(false);
  }, [search, category]);

  useEffect(() => {
    const timeout = setTimeout(fetchCharacters, 300);
    return () => clearTimeout(timeout);
  }, [fetchCharacters]);

  const trending = characters.slice(0, 4);
  const rest = characters.slice(4);

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 glass border-b border-ink-700/40">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="font-display font-bold text-xl text-ink-100">Explorar</h1>
              <p className="text-xs text-ink-400">Descubra personagens incríveis</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-all ${
                showFilters ? 'bg-brand-500/20 text-brand-400' : 'text-ink-400 hover:text-ink-200 hover:bg-ink-700/50'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar personagens..."
              className="w-full pl-10 pr-4 py-2.5 input-field text-sm"
            />
          </div>
          {showFilters && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 animate-slide-up">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    category === cat
                      ? 'bg-brand-500 text-white'
                      : 'bg-ink-800 text-ink-300 hover:bg-ink-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="px-4 pt-4 max-w-2xl mx-auto">
        {!search && category === 'Todos' && trending.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <h2 className="font-display font-semibold text-sm text-ink-200">Em Alta</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {trending.map((c) => (
                <CharacterCard key={c.id} character={c} onClick={onCharacterClick} />
              ))}
            </div>
          </>
        )}

        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-accent-400" />
          <h2 className="font-display font-semibold text-sm text-ink-200">
            {search || category !== 'Todos' ? 'Resultados' : 'Todos os Personagens'}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-ink-800 animate-pulse-soft" />
            ))}
          </div>
        ) : (search || category !== 'Todos' ? characters : rest).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-12 h-12 text-ink-600 mb-3" />
            <p className="text-ink-400 text-sm">Nenhum personagem encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {(search || category !== 'Todos' ? characters : rest).map((c) => (
              <CharacterCard key={c.id} character={c} onClick={onCharacterClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
