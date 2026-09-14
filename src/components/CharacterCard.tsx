import { MessageSquare, Heart } from 'lucide-react';
import type { Character } from '@/lib/supabase';

type Props = {
  character: Character;
  onClick: (character: Character) => void;
  compact?: boolean;
};

export default function CharacterCard({ character, onClick, compact = false }: Props) {
  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  if (compact) {
    return (
      <button
        onClick={() => onClick(character)}
        className="flex items-center gap-3 w-full p-3 glass-card hover:border-brand-500/40 transition-all duration-200 text-left group"
      >
        <img
          src={character.avatar_url}
          alt={character.name}
          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-semibold text-sm text-ink-100 truncate group-hover:text-brand-400 transition-colors">
            {character.name}
          </h3>
          <p className="text-xs text-ink-400 truncate">{character.category}</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-400 flex-shrink-0">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {formatCount(character.chat_count)}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick(character)}
      className="group relative overflow-hidden glass-card hover:border-brand-500/40 transition-all duration-300 text-left animate-fade-in"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={character.avatar_url}
          alt={character.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 rounded-full bg-ink-950/70 backdrop-blur-sm text-[10px] font-medium text-ink-200 border border-ink-600/40">
            {character.category}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-display font-semibold text-base text-white mb-1 truncate">
            {character.name}
          </h3>
          <p className="text-xs text-ink-300 line-clamp-2 mb-2">{character.description}</p>
          <div className="flex items-center gap-3 text-[11px] text-ink-300">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {formatCount(character.chat_count)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {formatCount(character.like_count)}
            </span>
            <span className="text-ink-400 ml-auto truncate">por {character.creator}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
