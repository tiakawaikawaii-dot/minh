import { useState, useEffect } from 'react';
import BottomNav, { type Page } from '@/components/BottomNav';
import AgeGate from '@/components/AgeGate';
import DiscoverPage from '@/pages/DiscoverPage';
import ChatsPage from '@/pages/ChatsPage';
import ChatPage from '@/pages/ChatPage';
import CreatePage from '@/pages/CreatePage';
import PersonasPage from '@/pages/PersonasPage';
import PremiumPage from '@/pages/PremiumPage';
import { supabase, type Character, Chat } from '@/lib/supabase';

export default function App() {
  const [page, setPage] = useState<Page>('discover');
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [inChat, setInChat] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('polybuzz_age_verified');
    if (stored === 'true') {
      setAgeVerified(true);
    }
  }, []);

  const handleAgeVerify = async () => {
    setAgeVerified(true);
    sessionStorage.setItem('polybuzz_age_verified', 'true');
    const { data } = await supabase.from('user_settings').select('*').maybeSingle();
    if (data && !data.age_verified) {
      await supabase.from('user_settings').update({ age_verified: true }).eq('id', data.id);
    }
  };

  const handleCharacterClick = (character: Character) => {
    setActiveCharacter(character);
    setActiveChat(null);
    setInChat(true);
  };

  const handleChatClick = (chat: Chat, character: Character) => {
    setActiveChat(chat);
    setActiveCharacter(character);
    setInChat(true);
  };

  const handleBackFromChat = () => {
    setInChat(false);
    setActiveChat(null);
    setActiveCharacter(null);
  };

  const handleChatCreated = (chat: Chat) => {
    setActiveChat(chat);
  };

  const handleCharacterCreated = (character: Character) => {
    setPage('discover');
    handleCharacterClick(character);
  };

  const handleBranch = (branchedChat: Chat) => {
    setActiveChat(branchedChat);
  };

  if (!ageVerified) {
    return <AgeGate onVerify={handleAgeVerify} />;
  }

  if (inChat && activeCharacter) {
    return (
      <ChatPage
        chat={activeChat}
        character={activeCharacter}
        onBack={handleBackFromChat}
        onChatCreated={handleChatCreated}
        onBranch={handleBranch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-ink-950">
      {page === 'discover' && <DiscoverPage onCharacterClick={handleCharacterClick} />}
      {page === 'chats' && <ChatsPage onChatClick={handleChatClick} />}
      {page === 'create' && <CreatePage onCreated={handleCharacterCreated} />}
      {page === 'personas' && <PersonasPage />}
      {page === 'premium' && <PremiumPage />}
      <BottomNav current={page} onNavigate={setPage} />
    </div>
  );
}
