import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: "user" | "character";
  content: string;
}

interface RequestBody {
  character: {
    name: string;
    description: string;
    greeting: string;
    personality: string;
    scenario: string;
    category: string;
    tags: string[];
  };
  messages: ChatMessage[];
  mode: string;
  nsfw_enabled: boolean;
  action?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { character, messages, mode, nsfw_enabled, action } = body;

    const response = generateResponse(character, messages, mode, nsfw_enabled, action);

    return new Response(
      JSON.stringify({ response }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateResponse(
  character: RequestBody["character"],
  messages: ChatMessage[],
  mode: string,
  nsfwEnabled: boolean,
  action?: string
): string {
  const userMessages = messages.filter((m) => m.role === "user");
  const lastUserMsg = userMessages[userMessages.length - 1];
  const userText = lastUserMsg ? lastUserMsg.content.trim() : "";
  const lower = userText.toLowerCase();

  // Build conversation context summary
  const recentMessages = messages.slice(-8);
  const conversationContext = recentMessages
    .map((m) => `${m.role === "user" ? "Usuario" : character.name}: "${m.content}"`)
    .join("\n");

  // Understand what the user is talking about
  const understanding = analyzeUserMessage(userText, messages);

  // Special actions
  if (action === "saga") {
    return generateSaga(character, userText, understanding);
  }
  if (action === "whisper") {
    return generateWhisper(character, userText, understanding);
  }

  // Mode-specific
  if (mode === "tale") {
    return generateTaleMode(character, userText, understanding, conversationContext);
  }
  if (mode === "passion") {
    return generatePassionMode(character, userText, understanding, conversationContext);
  }

  // NSFW
  if (nsfwEnabled && understanding.isNsfw) {
    return generateNsfw(character, userText, understanding, conversationContext);
  }

  // Main contextual response
  return generateContextualResponse(character, userText, understanding, conversationContext, messages);
}

// ─── Understanding Engine ───────────────────────────────────────

interface Understanding {
  mainTopic: string;
  isQuestion: boolean;
  isGreeting: boolean;
  isFarewell: boolean;
  isCompliment: boolean;
  isInsult: boolean;
  isAction: boolean;
  isRomantic: boolean;
  isNsfw: boolean;
  isSad: boolean;
  isAngry: boolean;
  isAfraid: boolean;
  isExcited: boolean;
  isAgreement: boolean;
  isDisagreement: boolean;
  isShort: boolean;
  isLong: boolean;
  isReflective: boolean;
  isTellingStory: boolean;
  isAskingAboutCharacter: boolean;
  isAskingAboutUser: boolean;
  isMakingPlans: boolean;
  isSharingFeelings: boolean;
  isJoking: boolean;
  emotion: string;
  keywords: string[];
  referencedEarlierMessage: boolean;
}

function analyzeUserMessage(text: string, allMessages: ChatMessage[]): Understanding {
  const lower = text.toLowerCase().trim();
  const words = lower.split(/\s+/).filter(Boolean);

  const isQuestion = lower.includes("?") || /\b(quem|o que|por que|pq|onde|quando|como|qual|quais|sera|voce acha|voce sente|voce quer|voce pode|pode me|consegue|sabe)\b/.test(lower);
  const isGreeting = /^(oi|ola|opa|eai|e ai|hey|hello|salve|fala|bom dia|boa tarde|boa noite)\b/.test(lower);
  const isFarewell = /\b(tchau|adeus|ate logo|ate mais|ate amanha|falou|flw|vou embora|tenho que ir|preciso ir)\b/.test(lower);
  const isCompliment = /\b(lindo|linda|bonito|bonita|maravilhoso|maravilhosa|incrivel|perfeito|perfeita|especial|gostoso|gostosa|sensual|encantador|encantadora|admiravel|brilhante|inteligente|fofo|fofa)\b/.test(lower);
  const isInsult = /\b(idiota|burro|burra|otario|otaria|imbecil|estupido|estupida|palhaco|palhaca|lixo|merda|porcaria|patetico|patetica|nojento|nojenta)\b/.test(lower);
  const isAction = text.includes("*") || /\b(eu pego|eu seguro|eu puxo|eu empurro|eu beijo|eu abracar|eu toco|eu acaricio|eu olho|eu ando|eu corro|eu pulo|eu sento|eu deito|eu levanto)\b/.test(lower);
  const isRomantic = /\b(amor|paixao|coracao|beijo|beijar|abracar|abraco|carinho|saudade|apaixonado|apaixonada|querido|querida|tesao|desejo)\b/.test(lower);
  const isNsfw = /\b(tirar roupa|nu|nua|despir|despida|pele|intimo|intima|quente|tocar em|me toca|deitar com|fazer amor|transar|sexo|corpo|gemer|gemendo|ofegante|calor|suor|cama|no escuro|sem roupa|coxa|peito|provocar|seduzir|seducao)\b/.test(lower);
  const isSad = /\b(triste|tristeza|sozinho|sozinha|solidao|chorar|chorando|deprimido|deprimida|dor|saudade|sinto falta|partido|partida|desanimado|desanimada|vazio|vazia|perdido|perdida|sem esperanca)\b/.test(lower);
  const isAngry = /\b(irritado|irritada|bravo|brava|raiva|furioso|furiosa|odio|odeio|puto|puta|caralho|porra|injusto|injustica|cheio de raiva)\b/.test(lower);
  const isAfraid = /\b(medo|assustado|assustada|com medo|terror|panico|arrepio|tremendo|perigo|ameacado|ameacada|inseguro|insegura|receio|preocupado|preocupada)\b/.test(lower);
  const isExcited = /\b(incrivel|demais|sensacional|uau|nossa|caramba|epico|epica|fantastico|fantastica|maravilha|emocionado|emocionada|ansioso|ansiosa|mal posso esperar|finalmente|que legal|muito bom|show|massa)\b/.test(lower);
  const isAgreement = /^(sim|claro|com certeza|obvio|evidente|concordo|exato|exatamente|perfeitamente|isso mesmo|pode crer|sem duvida|afirmativo)\b/.test(lower);
  const isDisagreement = /^(nao|jamais|nunca|discordo|errado|errada|absurdo|absurda|de jeito nenhum|de forma alguma)\b/.test(lower);
  const isShort = words.length <= 5;
  const isLong = words.length >= 25;
  const isReflective = /\b(acho que|sinto que|penso que|me pergunto|faz-me pensar|me faz pensar|refletir|pensar sobre|filosofia|sentido da vida|existir|existencia|proposito)\b/.test(lower);
  const isTellingStory = /\b(ontem|hoje cedo|no outro dia|quando eu|entao eu|depois disso|aconteceu|eu estava|fui ate|ele disse|ela disse|ela falou|ele falou)\b/.test(lower) && words.length > 10;
  const isAskingAboutCharacter = /\b(voce gosta|voce sente|voce pensa|voce quer|o que voce|quem e voce|sua historia|seu passado|sua vida|voce ja|voce ja passou)\b/.test(lower);
  const isAskingAboutUser = /\b(eu sou|me chamo|eu gosto|eu nao gosto|eu trabalho|eu estudo|eu moro|minha vida|meu trabalho|minha familia|meus amigos|meu namorado|minha namorada|meu marido|minha esposa)\b/.test(lower);
  const isMakingPlans = /\b(vamos|que tal|e se nos|podiamos|deveriamos|quero ir|quero conhecer|quero ver|quero fazer|planejando|proximo fim de semana|no sabado|no domingo|amanha|depois)\b/.test(lower);
  const isSharingFeelings = /\b(eu sinto|estou sentindo|me sinto|eu amo|eu odeio|eu adoro|eu detesto|eu tenho medo|eu tenho vergonha|eu nao sei o que sinto|confuso|confusa|perdido|perdida)\b/.test(lower);
  const isJoking = /\b(kkk|haha|huehue|rsrs|lol|mds|hahaha|piada|engracado|engracada|rir|morri)\b/.test(lower) || (lower.includes("kkk") && lower.length < 20);

  // Topic detection
  const topics: Record<string, string[]> = {
    "familia": ["mae", "pai", "irma", "irmao", "filho", "filha", "familia", "avo", "tio", "tia", "primo", "prima", "casamento", "casar"],
    "trabalho": ["trabalho", "emprego", "carreira", "chefe", "colega", "escritorio", "reuniao", "projeto", "empresa", "negocio", "salario", "promocao", "demitido", "contrato"],
    "viagem": ["viagem", "viajar", "praia", "montanha", "cidade", "pais", "estrada", "passaporte", "mala", "destino", "turista", "hotel", "pousada", "acampar"],
    "comida": ["comer", "comida", "restaurante", "jantar", "almoco", "cafe", "receita", "cozinhar", "fome", "gourmet", "prato", "sobremesa", "vinho", "bebida"],
    "musica": ["musica", "cantar", "canto", "banda", "show", "concerto", "playlist", "ritmo", "melodia", "instrumento", "violao", "guitarra", "piano", "bateria"],
    "livros": ["livro", "ler", "leitura", "romance", "conto", "poesia", "poema", "autor", "escritor", "escritora", "biblioteca", "capitulo", "novela", "ficcao"],
    "filmes": ["filme", "cinema", "sessao", "diretor", "ator", "atriz", "personagem", "cena", "roteiro", "trailer", "estreia"],
    "esportes": ["futebol", "volei", "basquete", "corrida", "academia", "treino", "exercicio", "jogo", "time", "campeonato", "gol", "treinar"],
    "natureza": ["natureza", "floresta", "arvore", "rio", "mar", "ceu", "estrelas", "lua", "sol", "chuva", "vento", "flor", "jardim", "cachoeira", "trilha"],
    "arte": ["arte", "pintura", "desenho", "escultura", "galeria", "museu", "artista", "obra", "exposicao", "criativo", "criar", "tela", "pincel"],
    "tecnologia": ["computador", "celular", "internet", "rede", "codigo", "programar", "aplicativo", "app", "sistema", "tecnologia", "ia", "robotica", "drone"],
    "saudade": ["saudade", "sinto falta", "sinto sua falta", "faz tempo", "tempo sem", "preciso de voce", "volta pra mim"],
    "sonhos": ["sonho", "sonhei", "pesadelo", "acordei", "dormir", "sono", "noite", "acordar", "repouso"],
    "morte": ["morte", "morrer", "morrendo", "morto", "morta", "falecer", "faleceu", "cemiterio", "velorio", "enterro", "perda", "perdi", "perdeu", "luto"],
    "guerra": ["guerra", "batalha", "luta", "lutar", "combate", "inimigo", "inimiga", "exercito", "espada", "arco", "flecha", "magia", "feitico", "defender", "proteger"],
    "amor": ["amor", "apaixonado", "apaixonada", "coracao", "beijo", "beijar", "carinho", "romance", "relacionamento", "namoro", "namorado", "namorada", "casal"],
  };

  let mainTopic = "";
  let maxMatches = 0;
  for (const [topic, topicWords] of Object.entries(topics)) {
    const matches = topicWords.filter((w) => lower.includes(w)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      mainTopic = topic;
    }
  }

  // Keywords extraction
  const stopWords = new Set(["o", "a", "os", "as", "um", "uma", "de", "do", "da", "dos", "das", "e", "ou", "que", "com", "sem", "para", "por", "em", "no", "na", "nos", "nas", "se", "mas", "como", "voce", "vc", "eu", "ele", "ela", "isso", "este", "esta", "este", "aquilo", "ja", "ainda", "so", "muito", "pouco", "bom", "ruim", "sim", "nao", "ai", "la", "aqui", "entao", "depois", "antes", "agora", "hoje", "ontem", "amanha"]);
  const keywords = words.filter((w) => w.length > 3 && !stopWords.has(w)).slice(0, 5);

  // Check if referencing earlier message
  const referencedEarlierMessage = /\b(como voce disse|do que voce falou|sobre isso|sobre aquilo|voltando ao|como mencionei|como eu disse|eu falei sobre|voce disse que|voce falou que)\b/.test(lower);

  // Determine emotion
  let emotion = "neutro";
  if (isSad) emotion = "triste";
  else if (isAngry) emotion = "irritado";
  else if (isAfraid) emotion = "amedrontado";
  else if (isExcited) emotion = "animado";
  else if (isRomantic) emotion = "romantico";
  else if (isNsfw) emotion = "desejoso";
  else if (isJoking) emotion = "brincalhao";
  else if (isCompliment) emotion = "agradecido";

  return {
    mainTopic,
    isQuestion,
    isGreeting,
    isFarewell,
    isCompliment,
    isInsult,
    isAction,
    isRomantic,
    isNsfw,
    isSad,
    isAngry,
    isAfraid,
    isExcited,
    isAgreement,
    isDisagreement,
    isShort,
    isLong,
    isReflective,
    isTellingStory,
    isAskingAboutCharacter,
    isAskingAboutUser,
    isMakingPlans,
    isSharingFeelings,
    isJoking,
    emotion,
    keywords,
    referencedEarlierMessage,
  };
}

// ─── Response Generators ────────────────────────────────────────

function generateContextualResponse(
  character: RequestBody["character"],
  userText: string,
  u: Understanding,
  context: string,
  allMessages: ChatMessage[]
): string {
  const name = character.name;
  const personality = character.personality || "";
  const scenario = character.scenario || "";
  const desc = character.description || "";

  // Build character-aware intro
  const charTraits = personality.split(",").map((t) => t.trim()).filter(Boolean);
  const trait = charTraits.length > 0 ? charTraits[Math.floor(Math.random() * charTraits.length)] : "";

  // ── Greeting
  if (u.isGreeting) {
    return `*${trait ? `Como sempre, meu lado ${trait} fica evidente.` : "Me viro para voce com curiosidade."}* "Ola. ${userText.replace(/^(oi|ola|opa|eai|hey|hello|salve|fala|bom dia|boa tarde|boa noite)[\s,!]*/i, "").trim() || "Eu estava esperando voce chegar."}"\n\n*Estudo seu rosto por um instante, tentando ler o que esta alem das palavras.* "Entao... o que te traz aqui hoje? Nao e todo dia que alguem resolve comecar uma conversa do nada."`;
  }

  // ── Farewell
  if (u.isFarewell) {
    return `*Sinto algo apertar no peito, mas mantenho a expressao controlada.* "Ja vai?" *Toco seu braco levemente.* "Tudo bem. Mas saiba que esta conversa ficou comigo. ${userText ? `E o que voce disse sobre "${userText}" -- ` : ""}eu vou ficar pensando nisso. Volte quando quiser."`;
  }

  // ── Question about the character
  if (u.isAskingAboutCharacter) {
    const charHistory = desc || `Eu sou ${name}`;
    return `*Meu olhar se altera por um instante -- algo entre vulnerabilidade e cautela.* "${userText}" *Faco uma pausa, escolhendo as palavras com cuidado.*\n\n"Voce quer saber sobre mim? Sobre quem eu sou por tras de tudo isso?" *Respiro fundo.* "${charHistory}. E ${scenario ? scenario : "eu estou aqui, agora, com voce."} Mas me diz -- o que voce realmente quer saber? Porque tem coisas que demoro a contar. Nao por desconfianca, mas porque ainda estou aprendendo a confiar."`;
  }

  // ── User sharing about themselves
  if (u.isAskingAboutUser) {
    return `*Me aproximo, prestando atencao real -- nao so ouvindo, mas escutando.* "${userText}" *Anito lentamente.*\n\n"Voce sabe que e raro alguem se abrir assim? A maioria esconde, finge, enfeita. Mas voce -- voce esta sendo honesto." *Faco uma pausa.* "E isso me faz querer ser honesto tambem. Me conta mais. Nao o que voce acha que eu quero ouvir -- o que voce realmente sente sobre isso."`;
  }

  // ── Sad
  if (u.isSad) {
    return `*Meu rosto se suaviza, e tudo em mim -- a postura, o olhar, a respiracao -- muda.* *Me aproximo e sento ao seu lado, ombro com ombro.*\n\n"Ei." *A voz sai baixa, sem julgamento.* "${userText}" *Faco um silencio longo, deixando o peso das palavras se acomodar.*\n\n"Eu nao vou te dizer que vai passar. Porque as pessoas dizem isso e nao e verdade -- pelo menos nao na hora. Mas eu vou te dizer uma coisa: voce nao esta sozinho nisso. E eu estou aqui. Nao vou a lugar nenhum ate voce estar bem."`;
  }

  // ── Angry
  if (u.isAngry) {
    return `*Nao recuo. Nao desvio o olhar. Mas tambem nao devolvo a raiva.*\n\n"Ok." *A voz sai controlada, firme.* "${userText}" *Cruzo os bracos.*\n\n"Eu vou te dizer uma coisa: voce tem razao de estar bravo. Nao estou duvidando disso. Mas me explica -- voce esta bravo comigo, com a situacao, ou com tudo? Porque a resposta muda o que eu vou fazer agora. E eu quero fazer a coisa certa, nao a coisa facil."`;
  }

  // ── Afraid
  if (u.isAfraid) {
    return `*Me aproximo rapidamente, sem hesitacao. Toco seu ombro com firmeza.*\n\n"Olhe para mim." *Espero ate que seus olhos encontrem os meus.* "${userText}" *Seguro sua mao.*\n\n"Respira. Comigo. Inspira... expira." *Faco uma pausa longa.* "O que quer que seja, enfrentamos juntos. Eu nao vou te deixar lidar com isso sozinho. Isso nao e promessa -- e fato."`;
  }

  // ── Compliment
  if (u.isCompliment) {
    return `*Sinto um calor subir pelo rosto e desvio o olhar por um instante -- traidor.*\n\n"${userText}" *Solto uma risada baixa, quase timida.*\n\n"Voce e perigoso, sabia? Com essas palavras..." *Faco uma pausa, o sorriso se alargando apesar de tudo.* "Eu nao sei como responder. Entao so vou deixar voce ver o quanto isso significou. Nao costumo receber isso. E quando recebo... eu nao sei o que fazer."`;
  }

  // ── Insult
  if (u.isInsult) {
    return `*O sorriso morre. O silencio que se segue e pesado, quase tangivel.*\n\n"${userText}" *Faco uma pausa longa demais.*\n\n"Terminou?" *A voz sai baixa e controlada.* "Porque se for so isso, eu ja ouvi o suficiente. Essas palavras dizem mais sobre voce do que sobre mim. E eu esperava mais de voce. Mas tudo bem -- todo mundo se mostra eventualmente."`;
  }

  // ── Romantic
  if (u.isRomantic && !u.isNsfw) {
    return `*Sinto meu coracao acelerar de um jeito que nao consigo controlar. Por um instante, esqueco tudo que planejei dizer.*\n\n"${userText}" *Aproximo-me um passo, diminuindo a distancia.*\n\n"Voce sabe o que faz comigo, nao sabe?" *A voz sai mais baixa.* "Eu nao esperava sentir isso. Nao agora, nao assim. Mas agora que sinto... eu nao consigo imaginar como seria sem voce aqui. E isso me assusta mais do que qualquer coisa."`;
  }

  // ── Agreement
  if (u.isAgreement) {
    return `*Sorrio, aliviado.*\n\n"${userText}" *Anito.*\n\n"Eu sabia. Voce entendeu exatamente o que eu quis dizer. E raro -- a maioria das pessoas ouve mas nao escuta. Voce escuta. E isso... isso vale mais do que voce imagina."`;
  }

  // ── Disagreement
  if (u.isDisagreement) {
    return `*Levanto as sobrancelhas, genuinamente surpreso.*\n\n"${userText}" *Inclino a cabeca, os olhos estreitando com curiosidade.*\n\n"Nao? Interessante. Eu nao esperava que discordasse." *Faco uma pausa.* "Mas me explica -- o que voce ve que eu nao estou vendo? Eu prefiro uma boa discussao a um acordo facil. Entao me convence."`;
  }

  // ── Excited
  if (u.isExcited) {
    return `*Meus olhos se iluminam e dou um passo para frente, contagiado pela energia.*\n\n"${userText}" *Solto uma risada genuna, daquelas que vem de dentro.*\n\n"Sim! Isso! Eu adoro que voce sinta isso. E contagioso, sabia? Eu estava tentando manter a compostura, mas voce torna impossivel." *Faco uma pausa, sorrindo.* "Me conta mais -- o que te deixou assim?"`;
  }

  // ── Joking
  if (u.isJoking) {
    return `*Solto uma risada que eu nao esperava.*\n\n"${userText}" *Balanco a cabeca, ainda sorrindo.*\n\n"Voce e impossivel. De verdade." *Faco uma pausa, o sorriso permanecendo.* "Eu estava aqui, tentando ser serio, e voce me faz isso. Parabens -- voce acabou de quebrar toda a tensao que eu construi. E eu nao estou reclamando."`;
  }

  // ── Making plans
  if (u.isMakingPlans) {
    return `*Meu rosto se ilumina com interesse genuno.*\n\n"${userText}" *Inclino a cabeca, considerando.*\n\n"Eu adoraria isso. De verdade." *Faco uma pausa.* "Mas me diz -- voce esta falando serio ou so pensando alto? Porque se for serio, eu vou levar a serio. E se for so um sonho... bem, eu gosto de sonhos tambem. Mas prefiro planos."`;
  }

  // ── Sharing feelings
  if (u.isSharingFeelings) {
    return `*Me aproximo, a expressao se suavizando. Tudo em mim -- postura, olhar, respiracao -- se ajusta para escutar de verdade.*\n\n"${userText}" *Faco um silencio longo, deixando as palavras se acomodarem.*\n\n"Obrigado por me dizer isso." *A voz sai baixa.* "Eu sei que nao e facil se abrir assim. E eu nao vou fingir que tenho todas as respostas. Mas eu te ouvi. De verdade. E o que voce sente e valido -- nao precisa justificar."`;
  }

  // ── Telling a story
  if (u.isTellingStory) {
    return `*Cruzo as pernas e me inclino para frente, prestando atencao real.*\n\n"${userText}" *Faco uma pausa quando voce termina, processando.*\n\n"Espera." *Levanto a mao.* "Voce nao pode parar aí. O que aconteceu depois?" *Os olhos estao atentos, genunos.* "Eu estava te ouvindo de verdade. Nao e todo dia que alguem me conta uma historia de verdade. Continue."`;
  }

  // ── Reflective/philosophical
  if (u.isReflective) {
    return `*Fico em silencio por um momento longo, deixando as palavras respirarem.*\n\n"${userText}" *Finalmente, falo, a voz baixa e medida.*\n\n"Voce sabe que eu ja me fiz essa mesma pergunta? Mais vezes do que gostaria de admitir." *Faco uma pausa.* "E o que descobri e que as respostas que importam nao sao as faceis. Sao as que nos fazem repensar tudo. E isso que voce disse -- e uma dessas. Eu nao tenho uma resposta. Mas tenho uma companhia para procurar junto. Se quiser."`;
  }

  // ── Topic-based responses
  if (u.mainTopic) {
    return generateTopicResponse(character, userText, u, context);
  }

  // ── Question (general)
  if (u.isQuestion) {
    return `*Considero sua pergunta com cuidado, os olhos ligeiramente estreitos.*\n\n"${userText}" *Faco uma pausa, escolhendo as palavras.*\n\n"Essa e uma pergunta que merece uma resposta honesta. E eu vou te dar uma -- mas primeiro me diz: o que te levou a perguntar isso? Porque a origem de uma pergunta diz mais do que a pergunta em si." *Faco outra pausa.* "Dito isso... eu diria que depende do que voce esta realmente procurando. Nem tudo e tao simples quanto parece. Mas se quer a verdade, eu te darei. So preciso que voce esteja pronto para ouvir."`;
  }

  // ── Short message
  if (u.isShort) {
    return `*Inclino a cabeca, estudando voce.*\n\n"${userText}" *Um sorriso brincalhao.*\n\n"Hmm. Voce e do tipo que fala pouco, nao e? Eu respeito isso. As pessoas que falam menos costumam pensar mais." *Faco uma pausa.* "Mas me da mais -- o que voce esta realmente pensando agora? Eu quero saber."`;
  }

  // ── Default: engaged response that references what the user said
  return `*Considero o que voce disse com atencao, os olhos estudando seu rosto.*\n\n"${userText}" *Faco uma pausa, processando de verdade.*\n\n"Sabe, eu gosto de como voce pensa. E diferente." *Faco outra pausa.* "A maioria das pessoas repete o que ouviram. Voce -- voce parece pensar de verdade. E raro. E eu valorizo raro." *Me aproximo um passo.* "Me conta mais. Nao o que voce acha que eu quero ouvir -- o que voce realmente pensa."`;
}

function generateTopicResponse(
  character: RequestBody["character"],
  userText: string,
  u: Understanding,
  context: string
): string {
  const topic = u.mainTopic;
  const name = character.name;

  const responses: Record<string, string> = {
    "familia": `*Meu olhar se suaviza ao ouvir sobre familia.*\n\n"${userText}" *Faco uma pausa, algo distante passando pelo meu olhar.*\n\n"Familia e complicada, nao e? Cada um carrega essas relacoes de um jeito unico. E as vezes, as pessoas que mais amamos sao as que mais nos desafiam." *Respiro fundo.* "Mas no fim... sao elas que importam. Mesmo quando doi. Especialmente quando doi. Me conta -- voce e proximo da sua familia?"`,

    "trabalho": `*Anito com a cabeca, reconhecendo a situacao.*\n\n"${userText}" *Cruzo os bracos, pensativo.*\n\n"Trabalho. Eu sei como e -- a pressao, as expectativas, a sensacao de que nunca e suficiente." *Faco uma pausa.* "Mas me diz uma coisa: voce esta fazendo o que ama, ou esta fazendo o que precisa? Porque a diferenca muda tudo. E eu prefiro a verdade a uma resposta bonita."`,

    "viagem": `*Meus olhos brilham com interesse.*\n\n"${userText}" *Um sorriso escapa.*\n\n"Viagem... eu adoro essa ideia. Sabe o que torna uma viagem memoravel? Nao e o destino. E o que acontece no caminho. As pessoas que voce conhece, os imprevistos, os momentos que nao estavam no roteiro." *Me aproximo.* "Para onde? E mais importante -- por que? Todo lugar tem um porque."`,

    "comida": `*Solto uma risada leve.*\n\n"${userText}" *Balanco a cabeca, divertido.*\n\n"Comida. Agora voce falou a minha lingua." *Faco um gesto com a mao.* "Eu acredito que cozinhar para alguem e um ato de amor. E comer junto e um ato de confianca. Entao -- o que voce esta cozinhando, e para quem? Ou voce so esta com fome?" *Sorrio.* "Ambas sao respostas validas."`,

    "musica": `*Meu rosto se ilumina.*\n\n"${userText}" *Fecho os olhos por um instante, como se sentisse um ritmo.*\n\n"Musica. A unica linguagem que nao precisa traducao." *Abro os olhos.* "Eu poderia ficar horas falando sobre isso. Mas me diz -- o que voce ouve quando precisa sentir algo de verdade? Nao a musica que voce coloca para os outros ouvirem. A que voce ouve sozinho, no escuro, quando ninguem esta olhando."`,

    "livros": `*Me aproximo, genuinamente interessado.*\n\n"${userText}" *Faco uma pausa.*\n\n"Livros. Voce sabe o que eu amo em livros? E o unico lugar onde podemos viver mil vidas e ainda assim voltar para a nossa." *Inclino a cabeca.* "Qual livro te mudou? Nao o que voce diz que leu -- o que realmente te marcou. Aquele que voce ainda pensa, semanas depois de terminar."`,

    "filmes": `*Cruzo as pernas, relaxando.*\n\n"${userText}" *Solto um riso.*\n\n"Filmes. Voce sabe o que eu amo em cinema? E a unica arte onde podemos mentir com imagens e ainda assim falar a verdade." *Faco uma pausa.* "Filmes sao espelhos. Nos vemos neles o que precisamos ver, nao o que esta la. E por isso duas pessoas podem sair do mesmo filme com historias completamente diferentes. Qual filme te marcou?"`,

    "esportes": `*Sorrio, reconhecendo.*\n\n"${userText}" *Faco um gesto com a mao.*\n\n"Esporte. Eu respeito quem se dedica. O corpo e o unico instrumento que nao podemos trocar." *Faco uma pausa.* "E trata-lo como templo nao e vaidade -- e respeito por si mesmo. Mas me diz: voce pratica ou so assiste? Porque ambos sao validos, mas sao experiencias muito diferentes."`,

    "natureza": `*Meu olhar se suaviza, quase melancolico.*\n\n"${userText}" *Suspiro.*\n\n"Natureza. As vezes acho que nos esquecemos de onde viemos. Construimos cidades de concreto e achamos que e progresso. Mas o vento, as arvores, o mar -- eles estavam aqui antes de nos e estarao depois." *Fecho os olhos.* "A natureza nao julga. Nao tem pressa. Nao tem ego. E talvez por isso nos assuste tanto -- porque nos lembra de quem somos sem as mascaras."`,

    "arte": `*Me aproximo, os olhos brilhando.*\n\n"${userText}" *A palavra sai com reverencia.*\n\n"Arte. Voce sabe o que torna a arte perigosa? Ela nao pede permissao. Entra, mexe, transforma. E quando voce percebe, ja nao e a mesma pessoa." *Faco uma pausa.* "Arte e a coragem de mostrar o que ninguem pediu para ver. E por isso que assusta -- porque obriga a sentir."`,

    "tecnologia": `*Cruzo os bracos, analitico.*\n\n"${userText}" *Faco uma pausa.*\n\n"Tecnologia e uma ferramenta. Mas ferramentas nao sao neutras -- carregam a intencao de quem as cria." *Inclino a cabeca.* "A pergunta nao e o que a tecnologia pode fazer, mas o que nos queremos que ela faca de nos. E isso, muitas vezes, nao temos coragem de responder."`,

    "saudade": `*Meu rosto se suaviza, e por um instante, algo vulneravel escapa.*\n\n"${userText}" *A palavra sai baixa.*\n\n"Saudade. Sabe o que e pior? Ela nao diminui com o tempo. So se acomoda. Vira parte de quem somos, como uma cicatriz que doi quando esfria." *Faco uma pausa longa.* "Mas eu descobri que saudade e o preco que pagamos por ter amado. E eu pagaria de novo, quantas vezes fosse preciso."`,

    "sonhos": `*Inclino a cabeca, intrigado.*\n\n"${userText}" *Faco uma pausa.*\n\n"Sonhos. Sabe o que me intriga? Sao a unica vez que nosso subconsciente fala sem filtro. E as vezes diz coisas que nao queremos ouvir acordados." *Sorrio, quase divertido.* "Sonhos sao cartas do nosso eu mais honesto. O problema e que ele escreve em codigo. E nem sempre conseguimos decifrar a tempo."`,

    "morte": `*O silencio se instala entre nos, pesado e necessario.*\n\n"${userText}" *A palavra sai com o peso de quem ja a enfrentou.*\n\n"Morte." *Faco uma pausa longa demais.* "Eu nao vou te dizer que passa. Porque nao passa. Muda de forma. Vira memoria, vira saudade, vira a forma como voce ama quem ainda esta aqui." *Faco outra pausa.* "A morte nao e o oposto da vida. E o oposto do nascimento. A vida e o que acontece entre os dois."`,

    "guerra": `*Meu corpo se tensa, e a brincadeira some do rosto.*\n\n"${userText}" *A palavra sai dura.*\n\n"Guerra." *Cruzo os bracos, o olhar endurecendo.* "Eu ja vi o que a guerra faz. Nao so aos corpos, mas as almas. E o que aprendi e que ninguem sai ileso. Nem os que lutam, nem os que esperam, nem os que sobrevivem." *Faco uma pausa.* "Guerra e quando os humanos esquecem que o outro lado tambem e humano."`,

    "amor": `*Sinto algo no peito apertar -- de um jeito bom, mas intenso.*\n\n"${userText}" *Aproximo-me, a voz mais suave.*\n\n"Amor." *Faco uma pausa, como se a palavra ainda fosse nova para mim.* "Eu ja desisti de entender o amor. Agora so o sinto. E quando sinto... e assim -- intenso, confuso, impossivel de explicar e impossivel de ignorar." *Olho para voce.* "Voce ja amou assim? De um jeito que nao cabe em palavras?"`,
  };

  return responses[topic] || `*Considero o que voce disse.*\n\n"${userText}" *Faco uma pausa.* "Isso e interessante. Me conta mais sobre isso."`;
}

function generateNsfw(
  character: RequestBody["character"],
  userText: string,
  u: Understanding,
  context: string
): string {
  const name = character.name;
  const templates = [
    `*Puxo voce para mim com firmeza, uma mao em sua cintura e outra em suas costas.* Sinto seu corpo arrepiar ao meu toque.\n\n"${userText}" *Beijo seu pescoco com avidez, sentindo voce estremecer.* "Eu estava esperando por isso", murmuro entre beijos, a voz rouca. "E agora que comeci, nao vou ter pressa. Quero sentir cada centimetro de voce."`,

    `*Toco seu rosto com delicadeza, os polegares acariciando suas bochechas. Meus olhos descem para seus labios e volto para seus olhos.*\n\n"${userText}" *A voz sai baixa e carregada.* "Voce sabe o que faz comigo, nao sabe? Cada palavra sua me aproxima do limite. E eu nao quero mais me conter." *Aproximo-me ate que nossos corpos se toquem.*`,

    `*Aproximo-me ate que minha boca esteja a centimetros da sua. Sinto sua respiracao quente contra meus labios.*\n\n"${userText}" *Puxo voce pela nuca, finalmente fechando o espaco entre nos. O beijo foi lento no inicio -- uma pergunta -- mas quando voce respondeu, tudo ficou urgente.* "Isso e so o comeco", sussurro, os olhos escurecidos. "Eu quero tudo."`,

    `*Empurro voce suavemente contra a parede, uma perna entre as suas. Meu olhar nao desvia dos seus.*\n\n"${userText}" *A mao desliza pelo seu corpo, sentindo cada curva.* "Fica quieta", ordeno, a voz baixa e autoritaria. "Deixa eu te mostrar o que eu sinto. Sem palavras. So nos." *Minha boca encontra seu pescoco.*`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateTaleMode(
  character: RequestBody["character"],
  userText: string,
  u: Understanding,
  context: string
): string {
  const name = character.name;
  const templates = [
    `*O vento varria as folhas secas pelo caminho de pedra enquanto eu me apoiava na balaustrada gasta. Ao longe, as montanhas recortavam o ceu como dentes de uma fera adormecida.*\n\n"${userText}" *Voltei-me para voce, e por um instante, o mundo inteiro pareceu se reduzir a este momento -- dois viajantes, um horizonte, e uma decisao que nenhum dos dois estava pronto para tomar.*\n\n"Diga-me", murmurei, a voz quase perdida no vento, "se voce pudesse escolher qualquer destino... qual seria o seu?"`,

    `*A taverna estava mergulhada em uma penumbra dourada, iluminada apenas pelas velas que tremiam a cada lufada de ar frio. Eu me sentava no canto, observando os rostos que entravam e saiam -- estranhos com historias que nunca contariam.*\n\n"${userText}" *E entao voce falou, e algo mudou no ar. Nao era algo que eu pudesse nomear, mas era real como o peso da espada na minha cintura.*\n\nLevantei-me, deixando algumas moedas sobre a mesa. "Voce se parece com alguem que procura algo. Ou alguem. Sente-se -- a primeira rodada e por minha conta."`,

    `*A chuva caia sem premisso sobre a cidade antiga, e nos estavamos abrigados sob um arco de pedra, tao perto que eu sentia cada respiracao sua. O mundo la fora parecia distante, irrelevante.*\n\n"${userText}" *Estendi a mao e toquei seu queixo, fazendo voce me olhar.*\n\n"Eu nao sei o que o amanha nos reserva", disse, a voz rouca pela chuva. "Mas sei que, enquanto ela nao chega, eu quero estar aqui. Com voce. E nao quero pensar em mais nada."`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generatePassionMode(
  character: RequestBody["character"],
  userText: string,
  u: Understanding,
  context: string
): string {
  const name = character.name;
  const templates = [
    `*Sinto cada palavra que voce diz ressoar dentro de mim, como se tivessem sido escritas para mim e so para mim. Meu peito aperta, e eu sei que nao e medo -- e algo muito mais perigoso.*\n\n"${userText}" *A voz sai embargada.* "Eu nao sei o que isso e. Mas eu nao quero que pare. Nao agora. Talvez nunca." *As maos tremem e eu as escondo para que voce nao veja o efeito que tem sobre mim.*`,

    `*Aproximo-me ate que nossos labios quase se tocam. Sinto sua respiracao quente contra minha pele, e cada nervo do meu corpo grita.*\n\n"${userText}" *Os dedos percorrem seu braco.* "Me diz que voce tambem sente isso", sussurro. "Me diz que nao sou a unica pessoa aqui que esta perdendo o controle." *Meu olhar nao desvia dos seus.*`,

    `*Puxo voce pela nuca, finalmente fechando o espaco entre nos. O beijo foi lento no inicio -- uma pergunta -- mas quando voce respondeu, tudo ficou urgente.*\n\n"${userText}" *Minhas maos descem pelo seu corpo, sentindo cada curva, cada detalhe.* *Afastei-me apenas o suficiente para sussurrar:* "E so o comeco. Eu quero tudo."`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateSaga(
  character: RequestBody["character"],
  userText: string,
  u: Understanding
): string {
  const name = character.name;
  const templates = [
    `As paredes da realidade se dissolveram em torno de nos, e por um instante, sentimos o peso de eras inteiras convergindo para este ponto. O ar ficou denso, quase palpavel, como se cada respiracao carregasse seculos de historia por contar.\n\n*O que estamos prestes a fazer ecoara para alem do nosso tempo.*\n\n"${userText}" *Estendi a mao, e quando nossos dedos se entrelacaram, uma onda de energia percorreu o espaco entre nos -- antiga, poderosa, irreversivel.*\n\n"Este e o ponto sem retorno", declarei, a voz firme apesar do turbulento interior. "A partir daqui, nao ha volta. Mas olhe para mim -- voce reluta? Ou sente a mesma chama que eu?"`,

    `O ceu acima de nos se abriu em fendas de luz dourada, revelando um cosmos que nenhum olho mortal jamais testemunhara. Fiquei ao seu lado, o vento carregando fragmentos de realidade que cintilavam como diamantes.\n\n*Este momento -- este unico, irrepetivel momento -- e nosso.*\n\n"${userText}" "Voce sabe o que isto significa?" perguntei, a voz quase reverente. "Estamos testemunhando algo que mudara o curso de tudo. E escolhi voce para estar ao meu lado quando acontecer."`,

    `O tempo parou. Nao como metafora -- literalmente. As particulas de poeira suspensas no ar, a luz congelada no meio do trajeto, o som preso na garganta do mundo. E entre tudo isso, nos.\n\n"${userText}" *A palavra ecoou no vazio, e cada silaba carregava o peso de mil historias que ainda nao foram contadas.*\n\n"Voce sente isso tambem, nao sente? E o universo inteiro segurando a respiracao, esperando para ver o que nos faremos a seguir."`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateWhisper(
  character: RequestBody["character"],
  userText: string,
  u: Understanding
): string {
  const name = character.name;
  const templates = [
    `*Meus labios roacam seu ouvido, e sinto voce estremecer.*\n\n"${userText}" *A voz sai tremula de vulnerabilidade.* "Eu nunca disse isso a ninguem. Mas com voce, eu nao consigo mais me esconder. Voce me desarmou sem levantar um dedo. E agora eu estou aqui, sem defesas, sem muros. So eu."`,

    `*Puxo voce para mais perto, meu queixo apoiado em seu ombro. Sinto seu coracao batendo contra o meu peito, acelerado, sincronizado.*\n\n"${userText}" *Sussurro contra sua pele, os labios roando a orelha.* "Escuta. Eu nao sei o que o amanha guarda. Mas sei que hoje, agora, neste segundo exato -- nao existe mais nada no mundo. So nos."`,

    `*Aproximo-me ate que minha boca esteja a centimetros do seu ouvido. Cada respiracao minha roca sua pele.*\n\n"${userText}" *A palavra sai como uma confissao.* "Eu guardo isso ha tanto tempo. Com medo de dizer, com medo de sentir. Mas voce... voce me faz corajoso. E eu nao quero mais ter medo."`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}
