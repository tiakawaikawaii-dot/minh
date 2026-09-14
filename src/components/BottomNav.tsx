import { Compass, MessageCircle, Plus, User, Crown } from 'lucide-react';

export type Page = 'discover' | 'chats' | 'create' | 'personas' | 'premium';

type Props = {
  current: Page;
  onNavigate: (page: Page) => void;
};

export default function BottomNav({ current, onNavigate }: Props) {
  const items: { id: Page; icon: typeof Compass; label: string }[] = [
    { id: 'discover', icon: Compass, label: 'Explorar' },
    { id: 'chats', icon: MessageCircle, label: 'Chats' },
    { id: 'create', icon: Plus, label: 'Criar' },
    { id: 'personas', icon: User, label: 'Personas' },
    { id: 'premium', icon: Crown, label: 'Premium' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-ink-700/60">
      <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.id;
          const isCreate = item.id === 'create';

          if (isCreate) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center justify-center gap-0.5 -mt-4"
              >
                <div className="w-12 h-12 rounded-full bg-brand-500 hover:bg-brand-600 active:scale-90 transition-all flex items-center justify-center shadow-lg shadow-brand-500/30">
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-medium text-ink-300">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive ? 'text-brand-400' : 'text-ink-400 hover:text-ink-200'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
