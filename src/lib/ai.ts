import type { Character, Message } from './supabase';
import { supabase } from './supabase';

type ResponseMode = 'standard' | 'tale' | 'passion';

interface ChatAIBody {
  character: {
    name: string;
    description: string;
    greeting: string;
    personality: string;
    scenario: string;
    category: string;
    tags: string[];
  };
  messages: { role: 'user' | 'character'; content: string }[];
  mode: string;
  nsfw_enabled: boolean;
  action?: string;
}

async function callChatAI(body: ChatAIBody): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('chat-ai', {
      body,
    });

    if (error) throw error;
    if (data && typeof data.response === 'string') return data.response;
    throw new Error('Invalid response');
  } catch {
    // Fallback: simple contextual response
    return fallbackResponse(body);
  }
}

function fallbackResponse(body: ChatAIBody): string {
  const lastUserMsg = body.messages.filter(m => m.role === 'user').pop();
  const userText = lastUserMsg ? lastUserMsg.content : '';
  const name = body.character.name;
  return `*Considero o que voce disse com atencao.* "${userText}" *Faco uma pausa.* "Sabe, eu gosto de como voce pensa. Me conta mais sobre isso."`;
}

export async function generateCharacterResponse(
  character: Character,
  messages: Message[],
  mode: ResponseMode = 'standard',
  nsfwEnabled: boolean = true
): Promise<string> {
  const chatMessages = messages.map(m => ({ role: m.role, content: m.content }));

  return callChatAI({
    character: {
      name: character.name,
      description: character.description,
      greeting: character.greeting,
      personality: character.personality,
      scenario: character.scenario,
      category: character.category,
      tags: character.tags,
    },
    messages: chatMessages,
    mode,
    nsfw_enabled: nsfwEnabled,
  });
}

export function generateGreeting(character: Character): string {
  return character.greeting;
}

export async function generateSagaResponse(
  character: Character,
  messages: Message[]
): Promise<string> {
  const chatMessages = messages.map(m => ({ role: m.role, content: m.content }));

  return callChatAI({
    character: {
      name: character.name,
      description: character.description,
      greeting: character.greeting,
      personality: character.personality,
      scenario: character.scenario,
      category: character.category,
      tags: character.tags,
    },
    messages: chatMessages,
    mode: 'standard',
    nsfw_enabled: true,
    action: 'saga',
  });
}

export async function generateWhisperResponse(
  character: Character,
  messages: Message[]
): Promise<string> {
  const chatMessages = messages.map(m => ({ role: m.role, content: m.content }));

  return callChatAI({
    character: {
      name: character.name,
      description: character.description,
      greeting: character.greeting,
      personality: character.personality,
      scenario: character.scenario,
      category: character.category,
      tags: character.tags,
    },
    messages: chatMessages,
    mode: 'standard',
    nsfw_enabled: true,
    action: 'whisper',
  });
}

export function generateImagePrompt(character: Character): string {
  const prompts: Record<string, string> = {
    'Misterio': `${character.name} em um beco escuro, luz dramatica, atmosfera noir, estilo cinematografico`,
    'Romance': `${character.name} sob a luz dourada do por do sol, expressao suave e calorosa, estilo romantico`,
    'Aventura': `${character.name} em uma paisagem epica de montanhas e florestas, pose heroica, estilo fantasia`,
    'Fantasia': `${character.name} em um castelo antigo com luz magica, armadura ornamentada, estilo epico`,
    'Sci-Fi': `${character.name} em uma nave futurista com hologramas, iluminacao neon, estilo cyberpunk`,
    'NSFW': `${character.name} em um ambiente intimo, luz sensual e dramatica, posicao provocante, estilo artistico`,
    'Original': `${character.name} em um retrato artistico, luz dramatica, composicao elegante`,
  };
  return prompts[character.category] || prompts['Original'];
}
