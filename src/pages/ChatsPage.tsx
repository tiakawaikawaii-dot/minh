import { useEffect, useState } from 'react';
import { MessageCircle, Trash2, Search } from 'lucide-react';
import { supabase, type Chat, type Character, type Message } from '@/lib/supabase';

type Props = {
  onChatClick: (chat: Chat, character: Character) => void;
};

type ChatWithMeta = Chat & {
  character?: Character;
  lastMessage?: Message;
};

export default function ChatsPage({ onChatClick }: Props) {
  const [chats, setChats] = useState<ChatWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchChats() {
      setLoading(true);
      const { data: chatData, error } = await supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error || !chatData) {
        setLoading(false);
        return;
      }

      const enriched = await Promise.all(
        chatData.map(async (chat) => {
          const { data: char } = await supabase
            .from('characters')
            .select('*')
            .eq('id', chat.character_id)
            .maybeSingle();

          const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...chat,
            character: char || undefined,
            lastMessage: msgs && msgs.length > 0 ? msgs[0] : undefined,
          };
        })
      );

      setChats(enriched);
      setLoading(false);
    }

    fetchChats();
  }, []);

  const handleDelete = async (chatId: string) => {
    await supabase.from('messages').delete().eq('chat_id', chatId);
    await supabase.from('chats').delete().eq('id', chatId);
    setChats((prev) => prev.filter((c) => c.id !== chatId));
  };

  const filtered = chats.filter((c) =>
    c.character?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 glass border-b border-ink-700/40">
        <div className="px-4 pt-4 pb-3">
          <h1 className="font-display font-bold text-xl text-ink-100 mb-3">Conversas</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversas..."
              className="w-full pl-10 pr-4 py-2.5 input-field text-sm"
            />
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 glass-card">
                <div className="w-12 h-12 rounded-xl bg-ink-800 animate-pulse-soft" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 bg-ink-800 rounded animate-pulse-soft" />
                  <div className="h-2.5 w-2/3 bg-ink-800 rounded animate-pulse-soft" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MessageCircle className="w-12 h-12 text-ink-600 mb-3" />
            <p className="text-ink-400 text-sm mb-1">Nenhuma conversa ainda</p>
            <p className="text-ink-500 text-xs">Explore personagens e comece a conversar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center gap-3 p-3 glass-card hover:border-brand-500/30 transition-all duration-200 group cursor-pointer"
                onClick={() => chat.character && onChatClick(chat, chat.character)}
              >
                <img
                  src={chat.character?.avatar_url}
                  alt={chat.character?.name || ''}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-sm text-ink-100 truncate">
                    {chat.character?.name || 'Personagem'}
                  </h3>
                  <p className="text-xs text-ink-400 truncate">
                    {chat.lastMessage
                      ? chat.lastMessage.role === 'user'
                        ? `Você: ${chat.lastMessage.content}`
                        : chat.lastMessage.content
                      : chat.character?.greeting}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(chat.id);
                  }}
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
