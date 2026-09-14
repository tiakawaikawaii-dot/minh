import { useEffect, useState, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Send,
  RotateCcw,
  MoreVertical,
  Volume2,
  Trash2,
  Sparkles,
  Coins,
  GitBranch,
  Heart,
  Brain,
  Image as ImageIcon,
  X,
  Check,
  Lock,
} from 'lucide-react';
import { supabase, type Chat, type Character, type Message, type UserSettings } from '@/lib/supabase';
import {
  generateCharacterResponse,
  generateSagaResponse,
  generateWhisperResponse,
  generateImagePrompt,
} from '@/lib/ai';

type Props = {
  chat: Chat | null;
  character: Character;
  onBack: () => void;
  onChatCreated?: (chat: Chat) => void;
  onBranch?: (chat: Chat) => void;
};

type CoinAction = 'whisper' | 'saga' | 'regenerate' | 'voice' | 'image';

const COIN_COSTS: Record<CoinAction, number> = {
  whisper: 10,
  saga: 20,
  regenerate: 5,
  voice: 15,
  image: 30,
};

const COIN_LABELS: Record<CoinAction, string> = {
  whisper: 'Sussurro do Coracao',
  saga: 'Modelo Saga',
  regenerate: 'Regenerar Resposta',
  voice: 'Voz Especial',
  image: 'Gerar Imagem',
};

export default function ChatPage({ chat, character, onBack, onChatCreated, onBranch }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(chat);
  const [showMenu, setShowMenu] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [showCoinBar, setShowCoinBar] = useState(false);
  const [coinAction, setCoinAction] = useState<CoinAction | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [voicePlaying, setVoicePlaying] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamingRef = useRef<number | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('user_settings').select('*').maybeSingle();
      if (data) setSettings(data as UserSettings);
    }
    loadSettings();
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const spendCoins = useCallback(async (amount: number): Promise<boolean> => {
    if (!settings) return false;
    if (settings.coins < amount) {
      showToast(`Moedas insuficientes! Voce tem ${settings.coins}, precisa ${amount}.`);
      return false;
    }
    const newCoins = settings.coins - amount;
    const { data } = await supabase
      .from('user_settings')
      .update({ coins: newCoins })
      .eq('id', settings.id)
      .select('*')
      .maybeSingle();
    if (data) {
      setSettings(data as UserSettings);
      return true;
    }
    return false;
  }, [settings, showToast]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, streamingText, scrollToBottom]);

  useEffect(() => {
    async function loadMessages() {
      if (!currentChat) {
        setMessages([]);
        const fakeGreeting: Message = {
          id: 'temp-greeting',
          chat_id: '',
          role: 'character',
          content: character.greeting,
          created_at: new Date().toISOString(),
        };
        setMessages([fakeGreeting]);
        return;
      }
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', currentChat.id)
        .order('created_at', { ascending: true });
      if (data && data.length > 0) {
        setMessages(data);
      } else {
        const greeting: Message = {
          id: 'temp-greeting',
          chat_id: currentChat.id,
          role: 'character',
          content: character.greeting,
          created_at: new Date().toISOString(),
        };
        setMessages([greeting]);
      }
    }
    loadMessages();
  }, [currentChat, character]);

  const ensureChat = async (): Promise<Chat> => {
    if (currentChat) return currentChat;
    const { data, error } = await supabase
      .from('chats')
      .insert({
        character_id: character.id,
        title: character.name,
        persona_name: 'Eu',
      })
      .select('*')
      .maybeSingle();
    if (data) {
      setCurrentChat(data);
      onChatCreated?.(data);
      if (messages.length > 0 && messages[0].id === 'temp-greeting') {
        await supabase.from('messages').insert({
          chat_id: data.id,
          role: 'character',
          content: messages[0].content,
        });
      }
      await supabase
        .from('characters')
        .update({ chat_count: character.chat_count + 1 })
        .eq('id', character.id);
      return data;
    }
    throw error;
  };

  const streamResponse = (response: string, chat: Chat, isRegen = false) => {
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      i += 3;
      setStreamingText(response.slice(0, i));
      if (i >= response.length) {
        clearInterval(interval);
        streamingRef.current = null;
        supabase
          .from('messages')
          .insert({
            chat_id: chat.id,
            role: 'character',
            content: response,
          })
          .select('*')
          .maybeSingle()
          .then(({ data: savedCharMsg }) => {
            const charMsg: Message = savedCharMsg || {
              id: 'temp-' + Date.now(),
              chat_id: chat.id,
              role: 'character',
              content: response,
              created_at: new Date().toISOString(),
            };
            if (isRegen) {
              setMessages((prev) => [...prev, charMsg]);
            } else {
              setMessages((prev) => [...prev, charMsg]);
            }
            setStreamingText('');
            setIsTyping(false);
            setCoinAction(null);
          });
      }
    }, 20);
    streamingRef.current = interval as unknown as number;
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMessage = input.trim();
    setInput('');
    const chat = await ensureChat();
    const { data: savedUserMsg } = await supabase
      .from('messages')
      .insert({ chat_id: chat.id, role: 'user', content: userMessage })
      .select('*')
      .maybeSingle();
    const userMsg: Message = savedUserMsg || {
      id: 'temp-' + Date.now(),
      chat_id: chat.id,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    await supabase.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', chat.id);
    setIsTyping(true);
    const allMessages = [...messages, userMsg];
    const mode = settings?.context_mode || 'standard';
    const nsfw = settings?.nsfw_enabled ?? true;
    const response = await generateCharacterResponse(character, allMessages, mode, nsfw);
    streamResponse(response, chat);
  };

  const handleRegenerate = async () => {
    if (isTyping || messages.length < 2) return;
    const lastCharMsg = messages[messages.length - 1];
    if (lastCharMsg.role !== 'character') return;

    const ok = await spendCoins(COIN_COSTS.regenerate);
    if (!ok) return;

    await supabase.from('messages').delete().eq('id', lastCharMsg.id);
    setMessages((prev) => prev.slice(0, -1));
    setIsTyping(true);
    const mode = settings?.context_mode || 'standard';
    const nsfw = settings?.nsfw_enabled ?? true;
    const response = await generateCharacterResponse(character, messages.slice(0, -1), mode, nsfw);
    if (currentChat) {
      streamResponse(response, currentChat, true);
    } else {
      const chat = await ensureChat();
      streamResponse(response, chat, true);
    }
  };

  const handleCoinAction = async (action: CoinAction) => {
    setShowCoinBar(false);
    if (isTyping) return;

    const ok = await spendCoins(COIN_COSTS[action]);
    if (!ok) return;

    setCoinAction(action);

    if (action === 'regenerate') {
      await handleRegenerate();
      return;
    }

    if (action === 'whisper') {
      const chat = currentChat || (await ensureChat());
      setIsTyping(true);
      const response = await generateWhisperResponse(character, messages);
      streamResponse(response, chat);
      showToast(`${COIN_LABELS.whisper} ativado! -${COIN_COSTS.whisper} moedas`);
      return;
    }

    if (action === 'saga') {
      const chat = currentChat || (await ensureChat());
      setIsTyping(true);
      const response = await generateSagaResponse(character, messages);
      streamResponse(response, chat);
      showToast(`${COIN_LABELS.saga} ativado! -${COIN_COSTS.saga} moedas`);
      return;
    }

    if (action === 'voice') {
      showToast(`${COIN_LABELS.voice} ativada! -${COIN_COSTS.voice} moedas`);
      const lastCharMsg = messages[messages.length - 1];
      if (lastCharMsg && lastCharMsg.role === 'character') {
        setVoicePlaying(lastCharMsg.id);
        setTimeout(() => setVoicePlaying(null), 3000);
      }
      setCoinAction(null);
      return;
    }

    if (action === 'image') {
      showToast(`${COIN_LABELS.image} gerando... -${COIN_COSTS.image} moedas`);
      setGeneratedImage(generateImagePrompt(character));
      setCoinAction(null);
      return;
    }
  };

  const handleBranch = async () => {
    if (!currentChat) {
      showToast('Inicie a conversa antes de ramificar.');
      return;
    }
    const lastMsg = messages[messages.length - 1];
    const branchPoint = lastMsg?.id || null;

    const { data, error } = await supabase
      .from('chats')
      .insert({
        character_id: character.id,
        title: `${character.name} (Ramificacao)`,
        persona_name: 'Eu',
        branch_from_id: currentChat.id,
        branch_from_message_id: branchPoint,
      })
      .select('*')
      .maybeSingle();

    if (data && !error) {
      const msgsToCopy = branchPoint
        ? messages.slice(0, messages.findIndex((m) => m.id === branchPoint) + 1)
        : messages;

      for (const msg of msgsToCopy) {
        if (msg.id === 'temp-greeting') continue;
        await supabase.from('messages').insert({
          chat_id: data.id,
          role: msg.role,
          content: msg.content,
        });
      }

      showToast('Conversa ramificada com sucesso!');
      onBranch?.(data);
    }
  };

  const handleClearChat = async () => {
    if (!currentChat) return;
    await supabase.from('messages').delete().eq('chat_id', currentChat.id);
    setMessages([{
      id: 'temp-greeting',
      chat_id: currentChat.id,
      role: 'character',
      content: character.greeting,
      created_at: new Date().toISOString(),
    }]);
    setShowMenu(false);
  };

  const formatMessage = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return <span key={i} className="italic text-ink-300">{part.slice(1, -1)}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const coinActions: { id: CoinAction; icon: typeof Heart; label: string; cost: number }[] = [
    { id: 'whisper', icon: Heart, label: 'Sussurro', cost: COIN_COSTS.whisper },
    { id: 'saga', icon: Brain, label: 'Saga', cost: COIN_COSTS.saga },
    { id: 'regenerate', icon: RotateCcw, label: 'Regenerar', cost: COIN_COSTS.regenerate },
    { id: 'voice', icon: Volume2, label: 'Voz', cost: COIN_COSTS.voice },
    { id: 'image', icon: ImageIcon, label: 'Imagem', cost: COIN_COSTS.image },
  ];

  return (
    <div className="fixed inset-0 flex flex-col bg-ink-950">
      <header className="flex items-center gap-2 sm:gap-3 px-3 py-3 glass border-b border-ink-700/40 z-20">
        <button onClick={onBack} className="p-2 rounded-xl btn-ghost">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <img src={character.avatar_url} alt={character.name} className="w-9 h-9 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-semibold text-sm text-ink-100 truncate">{character.name}</h2>
          <p className="text-[11px] text-ink-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse-soft" />
            {settings?.context_mode === 'tale' ? 'Modo Tale' : settings?.context_mode === 'passion' ? 'Modo Passion' : 'Padrao'}
            {coinAction && <span className="text-brand-400 ml-1">- {COIN_LABELS[coinAction]}</span>}
          </p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent-400/15 border border-accent-400/30">
          <Coins className="w-3.5 h-3.5 text-accent-400" />
          <span className="text-xs font-semibold text-accent-400">{settings?.coins ?? 0}</span>
        </div>
        <button onClick={handleBranch} className="p-2 rounded-xl btn-ghost" title="Ramificar conversa">
          <GitBranch className="w-5 h-5" />
        </button>
        <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-xl btn-ghost relative">
          <MoreVertical className="w-5 h-5" />
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 glass rounded-xl border border-ink-600/40 py-1 z-30 animate-fade-in">
              <button
                onClick={handleClearChat}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-ink-300 hover:text-error-500 hover:bg-error-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Limpar conversa
              </button>
            </div>
          )}
        </button>
      </header>

      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 glass rounded-full border border-brand-500/40 text-sm text-ink-100 animate-slide-up whitespace-nowrap">
          {toast}
        </div>
      )}

      {generatedImage && (
        <div className="fixed inset-0 z-40 bg-ink-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setGeneratedImage(null)}>
          <div className="glass-card p-4 max-w-sm w-full animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-sm text-ink-100">Imagem Gerada</h3>
              <button onClick={() => setGeneratedImage(null)} className="p-1 rounded-lg btn-ghost">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-square rounded-xl overflow-hidden bg-ink-800 mb-3 relative">
              <img src={character.avatar_url} alt="Generated" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-[10px] text-ink-300 leading-tight">{generatedImage}</p>
              </div>
            </div>
            <p className="text-xs text-ink-400 text-center">Imagem de {character.name} gerada com sucesso!</p>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll px-3 sm:px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'character' && (
              <img src={character.avatar_url} alt={character.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
            )}
            <div className={`max-w-[80%] sm:max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-brand-500 text-white rounded-tr-md'
                : 'bg-ink-800 text-ink-100 rounded-tl-md border border-ink-700/40'
            }`}>
              {formatMessage(msg.content)}
              {msg.role === 'character' && voicePlaying === msg.id && (
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-ink-700/40">
                  <Volume2 className="w-3.5 h-3.5 text-brand-400 animate-pulse-soft" />
                  <span className="text-[10px] text-brand-400">Reproduzindo voz especial...</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5 animate-slide-up">
            <img src={character.avatar_url} alt={character.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
            <div className="bg-ink-800 border border-ink-700/40 rounded-2xl rounded-tl-md px-4 py-3">
              {streamingText ? (
                <p className="text-sm leading-relaxed text-ink-100">
                  {formatMessage(streamingText)}
                  <span className="inline-block w-0.5 h-4 bg-brand-400 ml-0.5 animate-pulse-soft align-middle" />
                </p>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="typing-dot animate-bounce-dot" style={{ animationDelay: '0s' }} />
                  <span className="typing-dot animate-bounce-dot" style={{ animationDelay: '0.2s' }} />
                  <span className="typing-dot animate-bounce-dot" style={{ animationDelay: '0.4s' }} />
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showCoinBar && (
        <div className="px-3 sm:px-4 py-2 glass border-t border-ink-700/40 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-300">Gastar moedas</span>
            <button onClick={() => setShowCoinBar(false)} className="p-1 rounded-lg btn-ghost">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {coinActions.map((act) => {
              const Icon = act.icon;
              const canAfford = (settings?.coins ?? 0) >= act.cost;
              return (
                <button
                  key={act.id}
                  onClick={() => handleCoinAction(act.id)}
                  disabled={!canAfford || isTyping}
                  className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border transition-all flex-shrink-0 ${
                    canAfford
                      ? 'bg-ink-800 border-ink-600 hover:border-brand-500/50 hover:bg-ink-700'
                      : 'bg-ink-800/50 border-ink-700 opacity-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${canAfford ? 'text-brand-400' : 'text-ink-500'}`} />
                  <span className="text-[10px] text-ink-200 whitespace-nowrap">{act.label}</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-accent-400 font-medium">
                    <Coins className="w-2.5 h-2.5" />
                    {act.cost}
                  </span>
                  {!canAfford && <Lock className="w-2.5 h-2.5 text-ink-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-3 py-2.5 glass border-t border-ink-700/40 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
        {messages.length > 1 && !isTyping && messages[messages.length - 1].role === 'character' && !showCoinBar && (
          <div className="flex justify-center gap-2 mb-2">
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink-800 hover:bg-ink-700 text-ink-300 text-xs font-medium transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Regenerar
              <span className="flex items-center gap-0.5 text-accent-400">
                <Coins className="w-2.5 h-2.5" />
                {COIN_COSTS.regenerate}
              </span>
            </button>
            <button
              onClick={() => setShowCoinBar(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/15 hover:bg-brand-500/25 text-brand-400 text-xs font-medium transition-all"
            >
              <Coins className="w-3 h-3" />
              Moedas
            </button>
          </div>
        )}
        {messages.length <= 1 && !showCoinBar && (
          <div className="flex justify-center mb-2">
            <button
              onClick={() => setShowCoinBar(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/15 hover:bg-brand-500/25 text-brand-400 text-xs font-medium transition-all"
            >
              <Coins className="w-3 h-3" />
              Usar moedas
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Mensagem para ${character.name}...`}
              rows={1}
              className="w-full px-4 py-2.5 input-field text-sm resize-none max-h-32"
              style={{ minHeight: '42px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-90 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isTyping ? <Sparkles className="w-5 h-5 text-white animate-pulse-soft" /> : <Send className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}
