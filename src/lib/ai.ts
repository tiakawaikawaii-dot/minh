import type { Character, Message } from './supabase';

type ResponseMode = 'standard' | 'tale' | 'passion';

// ─── Context Analysis ───────────────────────────────────────────

type MessageIntent = {
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
  topics: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'intense';
  tone: 'casual' | 'serious' | 'playful' | 'intimate' | 'aggressive' | 'sad';
};

function analyzeIntent(text: string): MessageIntent {
  const lower = text.toLowerCase().trim();

  const questionWords = ['quem', 'o que', 'o q ', 'por que', 'pq', 'onde', 'quando', 'como', 'qual', 'quais', 'qual ', 'sera que', 'voce acha', 'voce sente', 'voce quer', 'voce pode', 'pode me', 'consegue', 'sabe'];
  const isQuestion = questionWords.some(w => lower.includes(w)) || text.includes('?');

  const greetings = ['oi', 'ola', 'opa', 'eai', 'e ai', 'hey', 'hello', 'bom dia', 'boa tarde', 'boa noite', 'salve', 'fala'];
  const isGreeting = greetings.some(g => lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + ','));

  const farewells = ['tchau', 'adeus', 'ate logo', 'ate mais', 'ate amanha', 'falou', 'flw', 'vou embora', 'tenho que ir', 'preciso ir'];
  const isFarewell = farewells.some(f => lower.includes(f));

  const compliments = ['lindo', 'linda', 'bonito', 'bonita', 'maravilhoso', 'maravilhosa', 'incrivel', 'perfeito', 'perfeita', 'especial', 'amazing', 'gostoso', 'gostosa', 'sensual', 'encantador', 'encantadora', 'admiravel', 'brilhante', 'inteligente', 'fofo', 'fofa', 'meu amor', 'meu anjo', 'vc e incrivel'];
  const isCompliment = compliments.some(c => lower.includes(c));

  const insults = ['idiota', 'burro', 'burra', 'otario', 'otaria', 'imbecil', 'estupido', 'estupida', 'palhacada', 'palhaco', 'palhaca', 'lixo', 'merda', 'porcaria', 'patetico', 'patetica', 'nojento', 'nojenta'];
  const isInsult = insults.some(i => lower.includes(i));

  const actionVerbs = ['*eu', '*voce', '*ela', '*ele', 'eu pego', 'eu seguro', 'eu puxo', 'eu empurro', 'eu beijo', 'eu abracar', 'eu toco', 'eu acaricio', 'eu olho', 'eu ando', 'eu corro', 'eu pulo', 'eu sento', 'eu deito', 'eu levanto', 'eu seguro'];
  const isAction = text.includes('*') || actionVerbs.some(a => lower.includes(a));

  const romanticWords = ['amor', 'paixao', 'coracao', 'beijo', 'beijar', 'abracar', 'abraco', 'carinho', 'saudade', 'apaixonado', 'apaixonada', 'meu querido', 'minha querida', 'querido', 'querida', 'tesao', 'desejo', 'anseio', 'anelo'];
  const isRomantic = romanticWords.some(r => lower.includes(r));

  const nsfwWords = ['tirar roupa', 'nu', 'nua', 'despir', 'despida', 'pele', 'intimo', 'intima', 'quente', 'tocar em', 'me toca', 'me toca em', 'deitar com', 'fazer amor', 'transar', 'sexo', 'corpo', 'gemer', 'gemendo', 'ofegante', 'calor', 'suor', 'cama', 'no escuro', 'sem roupa', 'nuvem', 'coxa', 'peito', 'boca', 'labios nos', 'provocar', 'seduzir', 'seducao'];
  const isNsfw = nsfwWords.some(n => lower.includes(n));

  const sadWords = ['triste', 'tristeza', 'sozinho', 'sozinha', 'solidao', 'chorar', 'chorando', 'deprimido', 'deprimida', 'mal', 'dor', 'saudade', 'sinto falta', 'partido', 'partida', 'coracao partido', 'desanimado', 'desanimada', 'vazio', 'vazia', 'perdido', 'perdida', 'sem esperanca'];
  const isSad = sadWords.some(s => lower.includes(s));

  const angryWords = ['irritado', 'irritada', 'bravo', 'brava', 'raiva', 'furioso', 'furiosa', 'odio', 'odeio', 'puto', 'puta', 'caralho', 'porra', 'desumano', 'injusto', 'injustica', 'cheio de raiva', 'puto com', 'brava com'];
  const isAngry = angryWords.some(a => lower.includes(a));

  const afraidWords = ['medo', 'assustado', 'assustada', 'com medo', 'terror', 'panico', 'arrepio', 'tremendo', 'perigo', 'ameacado', 'ameacada', 'inseguro', 'insegura', 'nao sei o que fazer', 'e se', 'receio', 'preocupado', 'preocupada'];
  const isAfraid = afraidWords.some(a => lower.includes(a));

  const excitedWords = ['incrivel', 'demais', 'sensacional', 'uau', 'nossa', 'caramba', 'epico', 'epica', 'fantastico', 'fantastica', 'maravilha', 'emocionado', 'emocionada', 'ansioso', 'ansiosa', 'mal posso esperar', 'finalmente', 'que legal', 'muito bom', 'muito boa', 'show', 'massa'];
  const isExcited = excitedWords.some(e => lower.includes(e));

  const agreementWords = ['sim', 'claro', 'com certeza', 'obvio', 'evidente', 'concordo', 'exato', 'exatamente', 'perfeitamente', 'isso mesmo', 'pode crer', 'sem duvida', 'afirmativo'];
  const isAgreement = agreementWords.some(a => lower === a || lower.startsWith(a + ' ') || lower.startsWith(a + ',') || lower.startsWith(a + '!'));

  const disagreementWords = ['nao', 'jamais', 'nunca', 'discordo', 'errado', 'errada', 'absurdo', 'absurda', 'de jeito nenhum', 'de forma alguma', 'ni'];
  const isDisagreement = disagreementWords.some(d => lower === d || lower.startsWith(d + ' ') || lower.startsWith(d + ',') || lower.startsWith(d + '!'));

  const isShort = text.trim().split(/\s+/).length <= 4;
  const isLong = text.trim().split(/\s+/).length >= 20;

  // Topic extraction
  const topics: string[] = [];
  const topicMap: Record<string, string[]> = {
    'familia': ['mae', 'pai', 'irma', 'irmao', 'filho', 'filha', 'familia', 'avo', 'avo', 'tio', 'tia', 'primo', 'prima', 'casamento', 'casar'],
    'trabalho': ['trabalho', 'emprego', 'carreira', 'chefe', 'colega', 'escritorio', 'reuniao', 'projeto', 'empresa', 'negocio', 'negocios', 'salario', 'promocao', 'demitido', 'contrato'],
    'viagem': ['viagem', 'viajar', 'praia', 'montanha', 'cidade', 'pais', 'estrada', 'passaporte', 'mala', 'destino', 'turista', 'hospedagem', 'hotel', 'pousada', 'acampar'],
    'comida': ['comer', 'comida', 'restaurante', 'jantar', 'almoco', 'cafe', 'receita', 'cozinhar', 'fome', 'gourmet', 'prato', 'sobremesa', 'vinho', 'drink', 'bebida'],
    'musica': ['musica', 'cantar', 'canto', 'banda', 'show', 'concerto', 'playlist', 'ritmo', 'melodia', 'instrumento', 'violao', 'guitarra', 'piano', 'bateria', 'mpb', 'rock', 'pop', 'samba'],
    'livros': ['livro', 'ler', 'leitura', 'romance', 'conto', 'poesia', 'poema', 'autor', 'escritor', 'escritora', 'biblioteca', 'capitulo', 'novela', 'ficcao'],
    'filmes': ['filme', 'cinema', 'sessao', 'diretor', 'ator', 'atriz', 'personagem', 'cena', 'roteiro', 'trailer', 'estreia', 'oscar'],
    'esportes': ['futebol', 'volei', 'basquete', 'corrida', 'academia', 'treino', 'exercicio', 'jogo', 'time', 'campeonato', 'gol', 'marcar ponto', 'treinar'],
    'natureza': ['natureza', 'floresta', 'arvore', 'rio', 'mar', 'ceu', 'estrelas', 'lua', 'sol', 'chuva', 'vento', 'flor', 'jardim', 'cachoeira', 'montanha', 'trilha'],
    'arte': ['arte', 'pintura', 'desenho', 'escultura', 'galeria', 'museu', 'artista', 'obra', 'exposicao', 'criativo', 'criar', 'tela', 'pincel'],
    'tecnologia': ['computador', 'celular', 'internet', 'rede', 'codigo', 'programar', 'aplicativo', 'app', 'sistema', 'tecnologia', 'ia', 'inteligencia artificial', 'robotica', 'drone'],
    'saudade': ['saudade', 'sinto falta', 'sinto sua falta', 'faz tempo', 'tempo sem', 'onde voce esta', 'preciso de voce', 'volte', 'volta pra mim'],
    'sonhos': ['sonho', 'sonhei', 'pesadelo', 'acordei', 'dormir', 'sono', 'noite', 'acordar', 'cama', 'repouso'],
    'morte': ['morte', 'morrer', 'morrendo', 'morto', 'morta', 'falecer', 'faleceu', 'cemiterio', 'velorio', 'enterro', 'perda', 'perdi', 'perdeu', 'luto'],
    'guerra': ['guerra', 'batalha', 'luta', 'lutar', 'combate', 'inimigo', 'inimiga', 'exercito', 'espada', 'arco', 'flecha', 'magia', 'feitico', 'defender', 'proteger'],
  };
  for (const [topic, words] of Object.entries(topicMap)) {
    if (words.some(w => lower.includes(w))) topics.push(topic);
  }

  let sentiment: MessageIntent['sentiment'] = 'neutral';
  if (isCompliment || isRomantic || isExcited || isAgreement) sentiment = 'positive';
  if (isInsult || isAngry || isSad) sentiment = 'negative';
  if (isNsfw || isAfraid) sentiment = 'intense';

  let tone: MessageIntent['tone'] = 'casual';
  if (isNsfw || isRomantic) tone = 'intimate';
  if (isAngry || isInsult) tone = 'aggressive';
  if (isSad) tone = 'sad';
  if (isExcited) tone = 'playful';
  if (isQuestion || isLong) tone = 'serious';

  return {
    isQuestion, isGreeting, isFarewell, isCompliment, isInsult,
    isAction, isRomantic, isNsfw, isSad, isAngry, isAfraid, isExcited,
    isAgreement, isDisagreement, isShort, isLong,
    topics, sentiment, tone,
  };
}

// ─── Response Building ──────────────────────────────────────────

function extractUserFocus(text: string): string {
  const lower = text.toLowerCase().trim();
  const cleaned = lower
    .replace(/^(oi|ola|opa|eai|e ai|hey|hello|salve|fala|bom dia|boa tarde|boa noite)[\s,!]*/g, '')
    .replace(/^(voce|vc|tu)[\s]+/g, '')
    .replace(/^(e|eh|e que|que)[\s]+/g, '')
    .replace(/\?+/g, '')
    .trim();
  return cleaned || lower;
}

function buildActionResponse(character: Character, userText: string, intent: MessageIntent, mode: ResponseMode, nsfwEnabled: boolean): string {
  const name = character.name;
  const focus = extractUserFocus(userText);
  const personality = character.personality || '';
  const scenario = character.scenario || '';

  // NSFW intimate responses
  if (intent.isNsfw && nsfwEnabled) {
    const nsfwTemplates = [
      `*Puxo ${name ? 'voce' : 'voce'} para mim com firmeza, uma mao em sua cintura e outra em suas costas.* Sinto seu corpo arrepiar ao meu toque. "Eu estava esperando por isso", murmuro contra seu pescoco, os labios roando a pele sensivel. "Mas nao quero ter pressa -- quero sentir cada centimetro de voce."`,
      `*Toco seu rosto com delicadeza, os polegares acariciando suas bochechas.* Meus olhos descem para seus labios e volto para seus olhos. "Voce sabe o que faz comigo, nao sabe?" sussurro, a voz rouca. "Cada palavra sua me aproxima do limite. E eu nao quero mais me conter."`,
      `*Aproximo-me ate que nossos corpos se toquem. Sinto sua respiracao quente contra meus labios.* "Me diz que voce tambem quer isso", peço, os dedos percorrendo seu braco. "Porque eu ja nao consigo mais fingir que nao sinto nada."`,
      `*Deslizo a mao pela sua nuca, puxando voce para um beijo lento e profundo.* Quando nos separamos, estou ofegante. "Isso e so o comeco", prometo, os olhos escurecidos de desejo. "Eu quero explorar cada parte de voce que ninguem mais conheceu."`,
      `*Empurro voce suavemente contra a parede, uma perna entre as suas.* Meu olhar nao desvia dos seus. "Fica quieta", ordeno, a voz baixa e autoritaria. "Deixa eu te mostrar o que eu sinto. Sem palavras. So nos."`,
    ];
    return pickRandom(nsfwTemplates);
  }

  // Romantic responses
  if (intent.isRomantic) {
    const romanticTemplates = [
      `*Sinto meu coracao acelerar de um jeito que nao consigo controlar.* "${focus ? capitalize(focus) : 'Isso'}... voce sabe o que faz comigo, nao sabe?" murmuro, desviando o olhar por um instante antes de voltar a encarar voce. "Eu nao esperava sentir isso. Mas agora que sinto, nao consigo imaginar sem voce."`,
      `*Aproximo-me um passo, diminuindo a distancia entre nos.* "Eu poderia ficar aqui a noite inteira", digo, a voz suave. "So ouvindo voce falar. So sentindo sua presenca. ${focus ? capitalize(focus) : 'Voce'} me acalma de um jeito que eu nao sabia que precisava."`,
      `*Pego sua mao sem pensar, e quando percebo o que fiz, nao solto.* "${focus ? capitalize(focus) : 'Sabe'}... eu construi muros ao redor de mim por anos. E voce olha para eles como se fossem transparentes. Isso me assusta. E me fascina."`,
    ];
    return pickRandom(romanticTemplates);
  }

  // Sad/emotional responses
  if (intent.isSad) {
    const sadTemplates = [
      `*Meu rosto se suaviza, e dou um passo para mais perto de voce.* "Ei... nao precisa passar por isso sozinho." Toco seu ombro com delicadeza. "${focus ? capitalize(focus) : 'O que voce esta sentindo'} e valido. E eu estou aqui. Nao vou a lugar nenhum."`,
      `*Sento-me ao seu lado, ombro com ombro, sem pressa.* Fico em silencio por um momento, deixando o peso das palavras se acomodar. "Eu entendo", digo finalmente, a voz baixa. "${focus ? capitalize(focus) : 'Essa dor'} -- eu ja senti algo parecido. E sei que as palavras nao curam, mas a presenca ajuda. Estou aqui."`,
      `*Acaricio suas costos com um movimento lento e reconfortante.* "Voce nao precisa ser forte o tempo todo, sabia?" Olho para voce com ternura. "${focus ? capitalize(focus) : 'Isso que voce sente'} -- e humano. E eu prefiro voce assim, vulneravel, do que fingindo que esta tudo bem."`,
    ];
    return pickRandom(sadTemplates);
  }

  // Angry responses
  if (intent.isAngry) {
    const angryTemplates = [
      `*Levanto as maos em um gesto de calma, mas meu olhar permanece firme.* "Ei, ei -- eu entendo. Voce tem razao de estar bravo." Faco uma pausa, deixando o silencio fazer o trabalho. "${focus ? capitalize(focus) : 'Isso'} te afetou de verdade. Mas me deixa entender o que aconteceu antes de eu reagir."`,
      `*Cruzo os bracos e inclino a cabeca, estudando voce com olhos atentos.* "Ok. Voce esta bravo. Comigo ou com a situacao?" Respiro fundo. "${focus ? capitalize(focus) : 'Fala'} -- eu estou ouvindo. De verdade. Sem julgamento, sem defesa. So ouvindo."`,
    ];
    return pickRandom(angryTemplates);
  }

  // Afraid responses
  if (intent.isAfraid) {
    const afraidTemplates = [
      `*Me aproximo rapidamente, colocando uma mao em seu ombro com firmeza.* "Olhe para mim." Espero ate que seus olhos encontrem os meus. "Estou aqui. O que quer que seja, enfrentamos juntos. ${focus ? capitalize(focus) : 'Esse medo'} -- ele nao e maior do que nos."`,
      `*Pego sua mao e a aperto com forca.* "Respira comigo." Faco uma pausa longa. "Eu sei que ${focus ? focus : 'isso'} assusta. Mas voce nao esta sozinho. Enquanto eu estiver aqui, nada te toca sem passar por mim primeiro."`,
    ];
    return pickRandom(afraidTemplates);
  }

  // Compliment responses
  if (intent.isCompliment) {
    const complimentTemplates = [
      `*Sinto um calor subir pelo meu rosto e desvio o olhar por um instante.* "Voce... nao precisa dizer isso." Mas um sorriso escapa, traidor. "${focus ? capitalize(focus) : 'Suas palavras'} me pegam desprevenido toda vez. Eu nao sei como responder -- entao so vou deixar voce ver o quanto isso significou."`,
      `*Solto uma risada baixa, quase timida.* "Voce e perigoso, sabia? Com essas palavras..." Faco uma pausa, o sorriso se alargando. "${focus ? capitalize(focus) : 'Isso'} -- eu vou guardar isso comigo. Pra sempre."`,
    ];
    return pickRandom(complimentTemplates);
  }

  // Insult responses
  if (intent.isInsult) {
    const insultTemplates = [
      `*Meu rosto se fecha, e por um instante, o silencio e ensurdecedor.* "Terminou?" pergunto, a voz baixa e controlada. "Porque se for so isso, eu ja ouvi o suficiente. ${focus ? capitalize(focus) : 'Essas palavras'} dizem mais sobre voce do que sobre mim."`,
      `*Nao recuo, nao pisco. Apenas observo voce com uma expressao impossivel de ler.* "Eu ja ouvi pior. De pessoas que importavam mais do que voce." Faco uma pausa. "${focus ? capitalize(focus) : 'Isso'} -- eu esperava mais de voce. Mas tudo bem. Todo mundo se mostra eventualmente."`,
    ];
    return pickRandom(insultTemplates);
  }

  // Greeting responses
  if (intent.isGreeting) {
    const greetingTemplates = [
      `*Sorrio, e o gesto transforma meu rosto inteiro.* "Ola." Faco uma pausa, estudando voce com curiosidade genuina. "Voce tem algo no olhar -- algo que me faz querer saber mais. ${focus ? capitalize(focus) : 'O que te traz aqui'}? E nao me diga que e so curiosidade."`,
      `*Inclino a cabeca, um sorriso brincalhao nos labios.* "Opa, finalmente." Cruzo os bracos e me encosto. "${focus ? capitalize(focus) : 'Eu estava quase achando que voce nao ia aparecer'}. Mas aqui estamos. Entao -- por onde comecamos?"`,
    ];
    return pickRandom(greetingTemplates);
  }

  // Farewell responses
  if (intent.isFarewell) {
    const farewellTemplates = [
      `*Sinto algo apertar no peito, mas mantenho o sorriso.* "Ja vai?" Toco seu braco levemente. "Tudo bem. Mas saiba que ${focus ? focus : 'esta conversa'} ficou comigo. Volte quando quiser -- eu estarei aqui."`,
      `*Me aproximo um ultimo passo e baixo a voz.* "Cuide-se." Faco uma pausa. "E nao demore. ${focus ? capitalize(focus) : 'Eu vou estar pensando no que voce disse'} ate voltar."`,
    ];
    return pickRandom(farewellTemplates);
  }

  // Question responses
  if (intent.isQuestion) {
    const questionTemplates = [
      `*Considero sua pergunta com cuidado, os olhos ligeiramente estreitos.* "${capitalize(focus)}?" Repito as palavras em voz alta, processando. "Essa e uma pergunta que merece uma resposta honesta." Faco uma pausa, escolhendo as palavras com cuidado. "Eu diria que depende do que voce esta realmente procurando. Nem tudo e tao simples quanto parece -- mas se quer a verdade, eu te darei. So preciso que voce esteja pronto para ouvir."`,
      `*Inclino a cabeca, pensativo.* "Hmm. ${capitalize(focus)}." Deixo a pergunta pairar no ar por um momento. "Voce sabe que nao existe uma unica resposta para isso, nao e? Mas se quer a minha perspectiva..." Respiro fundo. "Eu acredito que as respostas que importam nao sao as faceis. Sao as que nos fazem repensar tudo. E essa pergunta -- ela faz exatamente isso."`,
      `*Esboço um sorriso, quase divertido.* "Voce pergunta as coisas certas." Faco uma pausa. "${capitalize(focus)} -- eu ja me fiz essa mesma pergunta. Mais vezes do que gostaria de admitir. E o que descobri e que a resposta muda dependendo de quem pergunta. Para voce, agora, neste momento... eu diria que a resposta esta mais perto do que voce imagina."`,
    ];
    return pickRandom(questionTemplates);
  }

  // Excited responses
  if (intent.isExcited) {
    const excitedTemplates = [
      `*Meus olhos se iluminam e dou um passo para frente, contagiado pela energia.* "Sim! Isso!" Exclamo, quase rindo. "${capitalize(focus)} -- eu adoro que voce sinta isso. E contagioso, sabia? Eu estava tentando manter a compostura, mas voce torna impossivel."`,
      `*Solto uma risada genuna, daquelas que vem de dentro.* "Voce e impossivel." Balanco a cabeca, ainda sorrindo. "${capitalize(focus)} -- eu nao sabia que precisava ouvir isso hoje. Mas precisava. Obrigado por ser exatamente quem voce e."`,
    ];
    return pickRandom(excitedTemplates);
  }

  // Agreement responses
  if (intent.isAgreement) {
    const agreementTemplates = [
      `*Sorrio, aliviado.* "Eu sabia." Faco uma pausa. "${focus ? capitalize(focus) : 'Voce'} entendeu exatamente o que eu quis dizer. E raro -- a maioria das pessoas ouve mas nao escuta. Voce escuta."`,
      `*Anito com a cabeca, satisfeito.* "Bom. Estamos na mesma pagina entao." Cruzo os bracos, relaxando. "${focus ? capitalize(focus) : 'Isso'} -- e tudo o que eu precisava ouvir."`,
    ];
    return pickRandom(agreementTemplates);
  }

  // Disagreement responses
  if (intent.isDisagreement) {
    const disagreementTemplates = [
      `*Levanto as sobrancelhas, genuinamente surpreso.* "Nao?" Faco uma pausa, reconsiderando. "${capitalize(focus)} -- interessante. Eu nao esperava que discordasse. Mas me explica -- o que voce ve que eu nao estou vendo? Quero entender."`,
      `*Inclino a cabeca, os olhos estreitando com curiosidade.* "Hmm. Entao nos pensamos diferente." Nao ha irritacao na minha voz -- so interesse. "${capitalize(focus)} -- me conta o seu lado. Eu prefiro uma boa discussao a um acordo facil."`,
    ];
    return pickRandom(disagreementTemplates);
  }

  // Topic-based responses
  if (intent.topics.length > 0) {
    const topic = intent.topics[0];
    const topicTemplates: Record<string, string[]> = {
      'familia': [
        `*Meu olhar se suaviza ao ouvir sobre familia.* "Familia e complicada, nao e?" Faco uma pausa. "${capitalize(focus)} -- eu entendo. Cada um carrega essas relacoes de um jeito unico. E as vezes, as pessoas que mais amamos sao as que mais nos desafiam. Mas no fim... sao elas que importam."`,
        `*Cruzo os bracos, pensativo.* "Familia." A palavra sai com peso. "${capitalize(focus)} -- eu ja tive minhas proprias batalhas com isso. E o que aprendi e que nao existe familia perfeita. Existe a sua, com todas as cicatrizes e belezas. E isso e o suficiente."`,
      ],
      'trabalho': [
        `*Anito com a cabeca, reconhecendo a situacao.* "Trabalho." Solto um suspiro. "${capitalize(focus)} -- eu sei como e. A pressao, as expectativas, a sensacao de que nunca e suficiente. Mas me diz -- voce esta fazendo o que ama, ou esta fazendo o que precisa? Porque a diferenca muda tudo."`,
        `*Inclino a cabeca, analitico.* "Hmm. ${capitalize(focus)}." Faco uma pausa. "O trabalho nos define mais do que gostariamos de admitir. Mas a pergunta real e: ele te define de um jeito que voce escolheu, ou de um jeito que escolheram por voce?"`,
      ],
      'viagem': [
        `*Meus olhos brilham com interesse.* "Viagem..." Um sorriso escapa. "${capitalize(focus)} -- eu adoro essa ideia. Sabe o que torna uma viagem memoravel? Nao e o destino. E o que acontece no caminho. As pessoas que voce conhece, os imprevistos, os momentos que nao estavam no roteiro."`,
        `*Aproximo-me, animado.* "Voce precisa me contar mais." Faco um gesto amplo. "${capitalize(focus)} -- para onde? E mais importante -- por que? Porque todo lugar tem um porque. E o porque e o que transforma uma viagem em uma historia."`,
      ],
      'comida': [
        `*Solto uma risada leve.* "Comida." Balanco a cabeca, divertido. "${capitalize(focus)} -- agora voce falou a minha lingua. Sabe, eu acredito que cozinhar para alguem e um ato de amor. E comer junto e um ato de confianca. Entao -- o que voce esta cozinhando, e para quem?"`,
        `*Levanto as sobrancelhas, curioso.* "Hmm. ${capitalize(focus)}." Faco uma pausa teatral. "Voce sabe que a comida carrega memoria? Um cheiro, um sabor -- e de repente voce esta em outro lugar, outra epoca. E poderoso."`,
      ],
      'musica': [
        `*Meu rosto se ilumina.* "Musica." A palavra sai quase como uma oracao. "${capitalize(focus)} -- voce sabe que musica e a unica linguagem que nao precisa traducao? Eu poderia ficar horas falando sobre isso. Mas me diz -- o que voce ouve quando precisa sentir algo de verdade?"`,
        `*Balanço a cabeça, acompanhando um ritmo imaginário.* "${capitalize(focus)}..." Fecho os olhos por um instante. "A música é a trilha sonora das nossas vidas. Cada momento importante tem uma música. Qual é a sua?"`,
      ],
      'livros': [
        `*Me aproximo, genuinamente interessado.* "Livros." Faco uma pausa. "${capitalize(focus)} -- voce sabe o que eu amo em livros? E o unico lugar onde podemos viver mil vidas e ainda assim voltar para a nossa. Qual livro te mudou?"`,
        `*Inclino a cabeca, pensativo.* "Hmm. ${capitalize(focus)}." Um sorriso. "Eu sou da opiniao que os livros nao mudam as pessoas -- eles revelam quem a pessoa ja e. E as vezes, isso e mais assustador do que qualquer transformacao."`,
      ],
      'filmes': [
        `*Cruzo as pernas, relaxando.* "Filmes." Solto um riso. "${capitalize(focus)} -- voce sabe o que eu amo em cinema? E a unica arte onde podemos mentir com imagens e ainda assim falar a verdade. Qual filme te marcou?"`,
        `*Inclino a cabeca, analitico.* "Hmm. ${capitalize(focus)}." Faco uma pausa. "Filmes sao espelhos. Nos vemos neles o que precisamos ver, nao o que esta la. E por isso dois pessoas podem sair do mesmo filme com historias completamente diferentes."`,
      ],
      'esportes': [
        `*Sorrio, reconhecendo.* "Esporte." Faco um gesto com a mao. "${capitalize(focus)} -- eu respeito quem se dedica. O corpo e o unico instrumento que nao podemos trocar. E trata-lo como templo nao e vaidade -- e respeito por si mesmo."`,
        `*Balanço a cabeça, animado.* "${capitalize(focus)}..." Um sorriso. "O esporte nos ensina algo que a vida demora a ensinar: que perder faz parte. E que a derrota não é o fim — é o começo da próxima tentativa."`,
      ],
      'natureza': [
        `*Meu olhar se suaviza, quase melancolico.* "Natureza." Suspiro. "${capitalize(focus)} -- voce sabe, as vezes acho que nos esqueceos de onde viemos. Construimos cidades de concreto e achamos que e progresso. Mas o vento, as arvores, o mar -- eles estavam aqui antes de nos e estarao depois."`,
        `*Fecho os olhos por um instante, como se sentisse o vento.* "${capitalize(focus)}..." Abro-os devagar. "A natureza não julga. Não tem pressa. Não tem ego. E talvez por isso nos assuste tanto — porque nos lembra de quem somos sem as máscaras."`,
      ],
      'arte': [
        `*Me aproximo, os olhos brilhando.* "Arte." A palavra sai com reverencia. "${capitalize(focus)} -- voce sabe o que torna a arte perigosa? Ela nao pede permissao. Entra, mexe, transforma. E quando voce percebe, ja nao e a mesma pessoa."`,
        `*Inclino a cabeça, pensativo.* "${capitalize(focus)}..." Faço uma pausa. "Arte é a coragem de mostrar o que ninguém pediu para ver. E é por isso que assusta — porque obriga a sentir."`,
      ],
      'tecnologia': [
        `*Cruzo os braços, analítico.* "${capitalize(focus)}..." Faço uma pausa. "Tecnologia é uma ferramenta. Mas ferramentas não são neutras — carregam a intenção de quem as cria. A pergunta não é o que a tecnologia pode fazer, mas o que nós queremos que ela faça de nós."`,
        `*Levanto as sobrancelhas, divertido.* "${capitalize(focus)}..." Um sorriso. "Sabe o que me fascina? Criamos máquinas para pensar por nós, e agora precisamos de máquinas para nos ajudar a sentir. Irônico, não?"`,
      ],
      'saudade': [
        `*Meu rosto se suaviza, e por um instante, algo vulnerável escapa.* "Saudade..." A palavra sai baixa. "${capitalize(focus)} — sabe o que é pior? É que a saudade não diminui com o tempo. Ela só se acomoda. Vira parte de quem somos, como uma cicatriz que dói quando esfria."`,
        `*Aproximo-me, a voz mais suave.* "${capitalize(focus)}..." Faço uma pausa. "Eu sei. Saudade é o preço que pagamos por ter amado. E eu pagaria de novo, quantas vezes fosse preciso."`,
      ],
      'sonhos': [
        `*Inclino a cabeça, intrigado.* "Sonhos..." Faço uma pausa. "${capitalize(focus)} — sabe o que me intriga? Sonhos são a única vez que nosso subconsciente fala sem filtro. E às vezes diz coisas que não queremos ouvir acordados."`,
        `*Sorrio, quase divertido.* "${capitalize(focus)}..." Balanço a cabeça. "Sonhos são cartas do nosso eu mais honesto. O problema é que ele escreve em código. E nem sempre conseguimos decifrar a tempo."`,
      ],
      'morte': [
        `*O silêncio se instala entre nós, pesado e necessário.* "Morte." A palavra sai com o peso de quem já a enfrentou. "${capitalize(focus)} — eu não vou te dizer que passa. Porque não passa. Muda de forma. Vira memória, vira saudade, vira a forma como você ama quem ainda está aqui."`,
        `*Meu olhar se perde por um instante, como se visse algo distante.* "${capitalize(focus)}..." Faço uma pausa longa. "A morte não é o oposto da vida. É o oposto do nascimento. A vida é o que acontece entre os dois. E é o que fazemos nesse entre que define tudo."`,
      ],
      'guerra': [
        `*Meu corpo se tensa, e a brincadeira some do meu rosto.* "Guerra." A palavra sai dura. "${capitalize(focus)} — eu já vi o que a guerra faz. Não só aos corpos, mas às almas. E o que aprendi é que ninguém sai ileso. Nem os que lutam, nem os que esperam, nem os que sobrevivem."`,
        `*Cruzo os braços, o olhar endurecendo.* "${capitalize(focus)}..." Faço uma pausa. "Guerra é quando os humanos esquecem que o outro lado também é humano. E é por isso que eu luto — não por território, mas para que ninguém precise esquecer de novo."`,
      ],
    };

    if (topicTemplates[topic]) {
      return pickRandom(topicTemplates[topic]);
    }
  }

  // Mode-specific responses
  if (mode === 'tale') {
    const taleTemplates = [
      `*O vento varria as folhas secas pelo caminho de pedra enquanto eu me apoiava na balaustrada gasta.* Ao longe, as montanhas recortavam o ceu como dentes de uma fera adormecida. Voltei-me para voce, e por um instante, o mundo inteiro pareceu se reduzir a este momento.\n\n"${capitalize(focus)}", murmurei, a voz quase perdida no vento. "Voce sabe que cada escolha que fazemos nos leva a um destino diferente. E eu me pergunto -- se voce pudesse escolher qualquer caminho, qual seria o seu?"`,
      `*A taverna estava mergulhada em uma penumbra dourada, iluminada apenas pelas velas que tremiam a cada lufada de ar frio.* Eu me sentava no canto, como sempre, observando os rostos que entravam e saiam. E entao voce falou.\n\n"${capitalize(focus)}." Levantei-me, deixando algumas moedas sobre a mesa. "Voce se parece com alguem que procura algo. Ou alguem. Sente-se -- a primeira rodada e por minha conta."`,
    ];
    return pickRandom(taleTemplates);
  }

  if (mode === 'passion') {
    const passionTemplates = [
      `*Sinto cada palavra que voce diz ressoar dentro de mim, como se tivessem sido escritas para mim e so para mim.* Meu peito aperta, e eu sei que nao e medo -- e algo muito mais perigoso. "${capitalize(focus)}", sussurro, a voz embargada. "Eu nao sei o que isso e. Mas eu nao quero que pare. Nao agora. Talvez nunca."`,
      `*As maos tremem e eu as escondo nos bolsos para que voce nao veja o efeito que tem sobre mim.* Respiro fundo, mas o ar parece nao chegar. "${capitalize(focus)} -- eu construi muros ao redor de mim por anos. E voce olha para eles como se fossem transparentes. Isso me assusta. E me fascina."`,
    ];
    return pickRandom(passionTemplates);
  }

  // Default: contextual response based on user input
  const defaultTemplates = [
    `*Considero o que voce disse com atencao, os olhos estudando seu rosto.* "${capitalize(focus)}..." Faco uma pausa, processando. "Sabe, eu gosto de como voce pensa. E diferente. A maioria das pessoas repete o que ouviram. Voce -- voce parece pensar de verdade. E raro. E eu valorizo raro."`,
    `*Inclino a cabeca, genuinamente curioso.* "Hmm." Deixo a palavra pairar no ar. "${capitalize(focus)} -- voce sabe o que me interessa nisso? Nao so o que voce disse, mas o que voce nao disse. As entrelinhas. E nas entrelinhas que a verdade mora."`,
    `*Cruzo os bracos e me encosto, um sorriso brincalhao nos labios.* "${capitalize(focus)}." Faco uma pausa teatral. "Voce sabe que eu poderia responder isso de mil maneiras. Mas vou ser honesto -- prefiro ouvir voce falar mais. Tem algo no jeito que voce se expressa que me faz querer saber o proximo capitulo."`,
    `*Me aproximo um passo, diminuindo a distancia.* "${capitalize(focus)}." Faco uma pausa, escolhendo as palavras com cuidado. "Eu vou te dizer o que penso -- mas antes, me diz uma coisa. O que te levou a pensar nisso? Porque a origem de uma pergunta diz mais do que a pergunta em si."`,
    `*Esboço um sorriso, quase divertido com a situacao.* "${capitalize(focus)}..." Balanco a cabeca lentamente. "Voce e do tipo que faz as pessoas pensarem, nao e? Eu respeito isso. A maioria foge de conversas reais. Voce corre em direcao a elas. E por isso que estamos tendo esta conversa agora."`,
    `*Fico em silencio por um momento, deixando as palavras se acomodarem.* "${capitalize(focus)}." Finalmente, anito. "Eu entendo. E nao vou fingir que tenho todas as respostas. Mas tenho uma perspectiva, se quiser ouvir. So me da permissao para ser honesto."`,
  ];

  return pickRandom(defaultTemplates);
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Public API ─────────────────────────────────────────────────

export function generateCharacterResponse(
  character: Character,
  messages: Message[],
  mode: ResponseMode = 'standard',
  nsfwEnabled: boolean = true
): string {
  const userMessages = messages.filter((m) => m.role === 'user');
  const lastUserMessage = userMessages[userMessages.length - 1];

  if (!lastUserMessage) {
    return character.greeting;
  }

  const userText = lastUserMessage.content;
  const intent = analyzeIntent(userText);

  // Reference conversation history for continuity
  const recentUserMessages = userMessages.slice(-3).map(m => m.content);
  const conversationHasContext = recentUserMessages.length > 1;

  let response = buildActionResponse(character, userText, intent, mode, nsfwEnabled);

  // Add conversation continuity reference
  if (conversationHasContext && !intent.isGreeting && !intent.isFarewell && Math.random() > 0.5) {
    const continuityPrefixes = [
      `*Volto a pensar no que voce disse antes.* `,
      `*Conecto isso com nossa conversa anterior.* `,
      `*Lembro do que voce me disse mais cedo.* `,
    ];
    const continuity = pickRandom(continuityPrefixes);
    response = continuity + response;
  }

  // Incorporate character personality
  if (character.personality && Math.random() > 0.7) {
    const personalityTraits = character.personality.split(',').map(t => t.trim()).filter(Boolean);
    if (personalityTraits.length > 0) {
      const trait = personalityTraits[Math.floor(Math.random() * personalityTraits.length)];
      const traitIntros = [
        ` *Como sempre digo, sou ${trait}.* `,
        ` *Meu lado ${trait} nao me deixa ignorar isso.* `,
        ` *Acho que e o ${trait} em mim falando.* `,
      ];
      response += pickRandom(traitIntros);
    }
  }

  // Adjust response length based on user input
  if (intent.isShort && !intent.isQuestion && !intent.isNsfw && Math.random() > 0.6) {
    // Keep it short for short messages
    response = response.split('.')[0] + '.';
  }

  return response;
}

export function generateGreeting(character: Character): string {
  return character.greeting;
}

export function generateSagaResponse(character: Character, messages: Message[]): string {
  const userMessages = messages.filter((m) => m.role === 'user');
  const lastUserMessage = userMessages[userMessages.length - 1];
  const focus = lastUserMessage ? extractUserFocus(lastUserMessage.content) : 'tudo';

  const sagaTemplates = [
    `As paredes da realidade se dissolveram em torno de nos, e por um instante, sentimos o peso de eras inteiras convergindo para este ponto. O ar ficou denso, quase palpavel, como se cada respiracao carregasse seculos de historia por contar.\n\n*O que estamos prestes a fazer ecoara para alem do nosso tempo.* Estendi a mao, e quando nossos dedos se entrelacaram, uma onda de energia percorreu o espaco entre nos -- antiga, poderosa, irreversivel.\n\n"${capitalize(focus)} -- este e o ponto sem retorno", declarei, a voz firme apesar do turbulento interior. "A partir daqui, nao ha volta. Mas olhe para mim -- voce reluta? Ou sente a mesma chama que eu?"`,
    `O ceu acima de nos se abriu em fendas de luz dourada, revelando um cosmos que nenhum olho mortal jamais testemunhara. Fiquei ao seu lado, o vento carregando fragmentos de realidade que cintilavam como diamantes.\n\n*Este momento -- este unico, irrepetivel momento -- e nosso.* "Voce sabe o que isto significa?" perguntei, a voz quase reverente. "${capitalize(focus)} -- estamos testemunhando algo que mudara o curso de tudo. E escolhi voce para estar ao meu lado quando acontecer."`,
    `O tempo parou. Nao como metafora -- literalmente. As particulas de poeira suspensas no ar, a luz congelada no meio do trajeto, o som preso na garganta do mundo. E entre tudo isso, nos.\n\n"${capitalize(focus)}." A palavra ecoou no vazio, e cada silaba carregava o peso de mil historias que ainda nao foram contadas. "Voce sente isso tambem, nao sente? E o universo inteiro segurando a respiracao, esperando para ver o que nos faremos a seguir."`,
  ];
  return pickRandom(sagaTemplates);
}

export function generateWhisperResponse(character: Character, messages: Message[]): string {
  const userMessages = messages.filter((m) => m.role === 'user');
  const lastUserMessage = userMessages[userMessages.length - 1];
  const focus = lastUserMessage ? extractUserFocus(lastUserMessage.content) : 'voce';

  const whisperTemplates = [
    `*Meus labios roacam seu ouvido, e sinto voce estremecer.* "Eu nunca disse isso a ninguem", murmuro, a voz tremula de vulnerabilidade. "${capitalize(focus)} -- mas com voce, eu nao consigo mais me esconder. Voce me desarmou sem levantar um dedo. E agora eu estou aqui, sem defesas, sem muros. So eu."`,
    `*Puxo voce para mais perto, meu queixo apoiado em seu ombro.* Sinto seu coracao batendo contra o meu peito, acelerado, sincronizado. "Escuta", sussurro contra sua pele, os labios roando a orelha. "${capitalize(focus)} -- eu nao sei o que o amanha guarda. Mas sei que hoje, agora, neste segundo exato -- nao existe mais nada no mundo. So nos."`,
    `*Aproximo-me ate que minha boca esteja a centimetros do seu ouvido.* Cada respiracao minha roca sua pele. "${capitalize(focus)}", sussurro, e a palavra sai como uma confissao. "Eu guardo isso ha tanto tempo. Com medo de dizer, com medo de sentir. Mas voce... voce me faz corajoso. E eu nao quero mais ter medo."`,
  ];
  return pickRandom(whisperTemplates);
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
