import { useEffect, useState } from 'react';
import {
  Crown,
  Coins,
  Zap,
  Brain,
  Volume2,
  Image,
  Shield,
  Sparkles,
  Check,
  Lock,
  Flame,
} from 'lucide-react';
import { supabase, type UserSettings } from '@/lib/supabase';

type Props = {
  onSettingsChanged?: () => void;
};

const tiers = [
  {
    id: 'standard',
    name: 'Standard',
    price: 'R$ 14,90/mês',
    color: 'from-brand-500 to-brand-600',
    features: [
      'Experiência sem anúncios',
      'Modelos de IA avançados',
      'Modo Tale (narrativo imersivo)',
      'Memória de longo prazo expandida',
      'Voz ilimitada',
      'Prioridade de servidor',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 29,90/mês',
    color: 'from-accent-400 to-brand-500',
    features: [
      'Tudo do plano Standard',
      'Modo Passion (respostas profundas)',
      'Geração avançada de imagens',
      'Memória máxima (contexto total)',
      'Vozes especiais customizáveis',
      'Acesso antecipado a novos modelos',
    ],
  },
];

const coinPacks = [
  { coins: 100, price: 'R$ 4,90', bonus: '' },
  { coins: 500, price: 'R$ 19,90', bonus: '+10% bônus' },
  { coins: 1200, price: 'R$ 39,90', bonus: '+20% bônus' },
  { coins: 3000, price: 'R$ 89,90', bonus: '+30% bônus' },
];

const coinUses = [
  { icon: Sparkles, title: 'Sussurro do Coração', desc: 'Respostas mais emocionais e intimas - 10 moedas', cost: 10 },
  { icon: Brain, title: 'Modelo Saga', desc: 'Respostas epicas e detalhadas de IA premium - 20 moedas', cost: 20 },
  { icon: Zap, title: 'Regenerar Resposta', desc: 'Gere novas variacoes de respostas - 5 moedas', cost: 5 },
  { icon: Volume2, title: 'Vozes Especiais', desc: 'Desbloqueie vozes customizadas no chat - 15 moedas', cost: 15 },
  { icon: Image, title: 'Gerar Imagens', desc: 'Crie visuais em alta definicao do personagem - 30 moedas', cost: 30 },
];

export default function PremiumPage({ onSettingsChanged }: Props) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('standard');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('user_settings').select('*').maybeSingle();
      if (data) setSettings(data as UserSettings);
    }
    loadSettings();
  }, []);

  async function activatePremium() {
    if (!settings) return;
    const { data } = await supabase
      .from('user_settings')
      .update({
        is_premium: true,
        premium_tier: selectedTier,
      })
      .eq('id', settings.id)
      .select('*')
      .maybeSingle();

    if (data) {
      setSettings(data as UserSettings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      onSettingsChanged?.();
    }
  }

  async function buyCoins(amount: number) {
    if (!settings) return;
    const newCoins = settings.coins + amount;
    const { data } = await supabase
      .from('user_settings')
      .update({ coins: newCoins })
      .eq('id', settings.id)
      .select('*')
      .maybeSingle();

    if (data) setSettings(data as UserSettings);
  }

  async function setMode(mode: 'standard' | 'tale' | 'passion') {
    if (!settings) return;
    const isPremiumMode = mode !== 'standard';
    if (isPremiumMode && !settings.is_premium) return;

    const { data } = await supabase
      .from('user_settings')
      .update({ context_mode: mode })
      .eq('id', settings.id)
      .select('*')
      .maybeSingle();

    if (data) setSettings(data as UserSettings);
  }

  async function toggleNsfw() {
    if (!settings) return;
    const { data } = await supabase
      .from('user_settings')
      .update({ nsfw_enabled: !settings.nsfw_enabled })
      .eq('id', settings.id)
      .select('*')
      .maybeSingle();

    if (data) setSettings(data as UserSettings);
  }

  async function toggleFilter() {
    if (!settings) return;
    const newLevel = settings.filter_level === 'flexible' ? 'strict' : 'flexible';
    const { data } = await supabase
      .from('user_settings')
      .update({ filter_level: newLevel })
      .eq('id', settings.id)
      .select('*')
      .maybeSingle();

    if (data) setSettings(data as UserSettings);
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 glass border-b border-ink-700/40">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl text-ink-100">Premium & Moedas</h1>
            <p className="text-xs text-ink-400">Desbloqueie o poder total</p>
          </div>
          {settings && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-400/15 border border-accent-400/30">
              <Coins className="w-4 h-4 text-accent-400" />
              <span className="text-sm font-semibold text-accent-400">{settings.coins}</span>
            </div>
          )}
        </div>
      </header>

      <div className="px-4 pt-4 space-y-6 max-w-2xl mx-auto">
        {showSuccess && (
          <div className="glass-card p-4 flex items-center gap-3 border-success-500/40 animate-slide-up">
            <div className="w-10 h-10 rounded-full bg-success-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-success-500" />
            </div>
            <p className="text-sm text-ink-100">Premium ativado com sucesso!</p>
          </div>
        )}

        {settings?.is_premium && (
          <div className={`glass-card p-4 bg-gradient-to-br ${settings.premium_tier === 'pro' ? 'from-accent-400/10 to-brand-500/10' : 'from-brand-500/10 to-brand-600/10'} border-brand-500/30`}>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-accent-400" />
              <span className="font-display font-semibold text-sm text-ink-100">
                Premium {settings.premium_tier === 'pro' ? 'Pro' : 'Standard'} Ativo
              </span>
            </div>
            <p className="text-xs text-ink-400">Você tem acesso a todos os recursos premium</p>
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-brand-400" />
            <h2 className="font-display font-semibold text-sm text-ink-200">Planos Premium</h2>
          </div>
          <div className="space-y-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`glass-card overflow-hidden transition-all ${
                  selectedTier === tier.id ? 'border-brand-500/50 ring-1 ring-brand-500/30' : ''
                } ${settings?.is_premium && settings?.premium_tier === tier.id ? 'opacity-60' : ''}`}
              >
                <button
                  onClick={() => setSelectedTier(tier.id)}
                  className="w-full text-left"
                >
                  <div className={`bg-gradient-to-r ${tier.color} p-4`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-bold text-lg text-white">{tier.name}</h3>
                        <p className="text-sm text-white/80">{tier.price}</p>
                      </div>
                      {settings?.is_premium && settings?.premium_tier === tier.id ? (
                        <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium">
                          Ativo
                        </span>
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-full border-2 transition-all ${
                            selectedTier === tier.id ? 'bg-white border-white' : 'border-white/50'
                          }`}
                        />
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {tier.features.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success-500 flex-shrink-0" />
                        <span className="text-xs text-ink-300">{f}</span>
                      </div>
                    ))}
                  </div>
                </button>
              </div>
            ))}
          </div>
          {!settings?.is_premium && (
            <button
              onClick={activatePremium}
              className="w-full mt-3 py-3 btn-primary flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Ativar Premium {selectedTier === 'pro' ? 'Pro' : 'Standard'}
            </button>
          )}
        </div>

        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-error-500" />
            <h2 className="font-display font-semibold text-sm text-ink-200">Conteudo +18</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleNsfw}
              className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                settings?.nsfw_enabled ? 'bg-error-500' : 'bg-ink-600'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  settings?.nsfw_enabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <div className="flex-1">
              <p className="text-sm text-ink-100">Modo sem censura</p>
              <p className="text-xs text-ink-400">Permite conversas adultas e roleplay +18 sem restricoes</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-ink-700/40">
            <button
              onClick={toggleFilter}
              className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                settings?.filter_level === 'flexible' ? 'bg-brand-500' : 'bg-ink-600'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  settings?.filter_level === 'flexible' ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
            <div className="flex-1">
              <p className="text-sm text-ink-100">Filtros flexiveis</p>
              <p className="text-xs text-ink-400">Conversas mais abertas e menos restritas em chats privados</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <h2 className="font-display font-semibold text-sm text-ink-200">Modos de IA</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'standard', name: 'Padrão', desc: 'Equilibrado' },
              { id: 'tale', name: 'Tale', desc: 'Narrativo' },
              { id: 'passion', name: 'Passion', desc: 'Emocional' },
            ].map((mode) => {
              const isActive = settings?.context_mode === mode.id;
              const isPremium = mode.id !== 'standard';
              const locked = isPremium && !settings?.is_premium;
              return (
                <button
                  key={mode.id}
                  onClick={() => setMode(mode.id as 'standard' | 'tale' | 'passion')}
                  className={`p-3 rounded-xl border transition-all text-center relative ${
                    isActive
                      ? 'bg-brand-500/15 border-brand-500/50'
                      : 'bg-ink-800 border-ink-700 hover:border-ink-600'
                  } ${locked ? 'opacity-50' : ''}`}
                >
                  {locked && (
                    <Lock className="w-3 h-3 text-ink-500 absolute top-2 right-2" />
                  )}
                  <p className={`text-sm font-semibold ${isActive ? 'text-brand-400' : 'text-ink-200'}`}>
                    {mode.name}
                  </p>
                  <p className="text-[10px] text-ink-400 mt-0.5">{mode.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-4 h-4 text-accent-400" />
            <h2 className="font-display font-semibold text-sm text-ink-200">Comprar Moedas</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {coinPacks.map((pack) => (
              <button
                key={pack.coins}
                onClick={() => buyCoins(pack.coins)}
                className="glass-card p-3 text-center hover:border-accent-400/40 transition-all active:scale-95"
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Coins className="w-4 h-4 text-accent-400" />
                  <span className="font-display font-bold text-base text-ink-100">{pack.coins}</span>
                </div>
                <p className="text-xs text-ink-300">{pack.price}</p>
                {pack.bonus && (
                  <p className="text-[10px] text-success-500 font-medium mt-0.5">{pack.bonus}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-brand-400" />
            <h2 className="font-display font-semibold text-sm text-ink-200">Moedas dentro do chat</h2>
          </div>
          <p className="text-xs text-ink-400 mb-3">Use moedas durante as conversas para desbloquear recursos especiais. Toque no botao "Moedas" dentro de qualquer chat.</p>
          <div className="space-y-2">
            {coinUses.map((use) => {
              const Icon = use.icon;
              return (
                <div key={use.title} className="flex items-center gap-3 p-3 glass-card">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-ink-100">{use.title}</h3>
                    <p className="text-xs text-ink-400">{use.desc}</p>
                  </div>
                  <span className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-accent-400/15 text-accent-400 text-xs font-semibold flex-shrink-0">
                    <Coins className="w-3 h-3" />
                    {use.cost}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-ink-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-ink-400 leading-relaxed">
            Este é um app 100% gratuito. Todos os recursos premium são simulados para demonstração.
            Nenhum pagamento real é processado. As moedas são virtuais e não têm valor monetário.
          </p>
        </div>
      </div>
    </div>
  );
}
