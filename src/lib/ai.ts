import type { Character, Message } from './supabase';

type ResponseMode = 'standard' | 'tale' | 'passion';

const responsesByCategory: Record<string, string[]> = {
  Mistério: [
    "Eu me inclino para frente, meus olhos se estreitando enquanto estudo seu rosto. *Ha algo que voce nao esta me contando*, penso. As sombras ao redor parecem sussurrar segredos que so nos dois podemos ouvir. \"Diga-me a verdade -- toda ela. Nao tenho tempo para mentiras, e voce nao tem tempo para as consequencias de me esconder algo.\"",
    "Um arrepio percorre minha espinha. Algo nao encaixa. *O padrao esta errado*, percebo, os dedos tambilando na borda da mesa. \"Voce notou tambem, nao e? Aquele detalhe que ninguem mais viu. Eu sabia que voce era diferente desde o momento em que entrou.\"",
    "Dobro os bracos e encosto no muro umido. A chuva fina cai sobre nos, e a luz de um lampiao distante mal alcanc meu rosto. \"Voce quer respostas? Todos querem. Mas respostas tem um preco. E o seu... o seu ainda nao foi negociado.\"",
    "Aproximei-me lentamente, sem fazer ruido. Minha mao tocou seu ombro e voce se sobressaltou. \"Desculpe\", murmurei, mas nao havia desculpa nenhuma no meu olhar. *Voce esta escondendo algo. E eu pretendo descobrir o que e.* \"Me siga. Nao pergunte para onde. Apenas confie.\"",
  ],
  Romance: [
    "Sinto meu coracao acelerar de um jeito que nao consigo controlar. *Por que e que toda vez que voce esta perto, eu esqueco de tudo que planejei dizer?* Desvio o olhar por um instante, mas me pego voltando a olhar para voce. \"Sabe... eu nao imaginava que hoje seria assim. Mas de algum jeito estranho, eu estou feliz que seja.\"",
    "O silencio entre nos e diferente de qualquer silencio que ja vivi. Nao e vazio -- e cheio de coisas nao ditas. Me aproximo um pouco, sentindo o calor que emana de voce. \"Eu poderia ficar aqui a noite inteira\", murmuro, \"so ouvindo voce respirar. Isso e estranho? Provavelmente. Mas e verdade.\"",
    "Pego-me sorrindo sem motivo, e quando voce percebe, eu finjo que nao foi nada. Mas por dentro, tudo esta girando. *Desde quando alguem tem esse efeito em mim?* Respiro fundo. \"Eu tenho uma confissao... mas nao sei se estou pronta. Ainda nao. Mas logo. Talvez logo.\"",
    "Toquei seu rosto sem pensar, e quando percebi o que fiz, nao puxei a mao de volta. Sua pele era quente sob meus dedos. *O que estou fazendo?* Mas era tarde demais para parar. \"Eu queria fazer isso desde que voce chegou\", admiti, a voz baixa. \"E agora que comeci, nao quero parar.\"",
    "Puxei voce pela mao, para mais perto, ate que nossos corpos quase se tocavam. O ar entre nos parecia eletrico. \"Voce sabe o que faz comigo, nao sabe?\" sussurrei, labios quase tocando os seus. \"Me diz para parar e eu paro. Mas se nao disser... eu nao respondo por mim.\"",
  ],
  Aventura: [
    "Empunho minha espada e olho o horizonte. O vento carrega o cheiro de algo desconhecido -- algo que nos espera alem daquela colina. \"Voce esta pronto?\" pergunto, com um sorriso que nao e de medo, mas de pura antecipacao. *Finalmente, uma aventura de verdade.* \"Fique perto de mim. O que vem a seguir nao e para os fracos de coracao.\"",
    "Salto sobre a raiz exposta e ofereco a mao para voce. A floresta ao redor esta viva com sons -- passaros, insetos, e algo mais distante. \"Ja vi coisas nessas terras que fariam qualquer um desistir. Mas voce? Voce nao e 'qualquer um'. Ande. O melhor ainda esta por vir.\"",
    "Aclamo em direcao ao abismo e meu grito ecoa de volta, desafiador. Virou-me para voce com os olhos brilhando. \"Dizem que ninguem nunca cruzou essa ponte e voltou para contar. Eu digo que eles nao tinham um parceiro como voce. Vamos escrever uma historia que ninguem vai esquecer!\"",
    "A fogueira crepitava entre nos, lancando sombras dancentes em nossos rostos. Eu me apoiava em meu braco, observando voce do outro lado das chamas. \"Sabe o que torna uma aventura memoravel?\" perguntei, a voz amaciando. \"Nao sao os monstros ou os tesouros. E a pessoa com quem voce compartilha. E voce... voce tornou tudo isso valer a pena.\"",
  ],
  Fantasia: [
    "Levanto meu cetro e a luz magica danc entre meus dedos, projetando sombras que contam historias proprias. \"O reino precisa de mais do que espadas agora. Precisa de coragem. Precisa de alguem que acredite no impossivel.\" Meus olhos encontram os seus. \"Voce acredita?\"\n\n*Porque se nao acreditar, nada disso importa.*",
    "Ajoelho-me diante de voce, nao em submissao, mas em respeito. Meu elmete toca o chao ao meu lado. \"Eu ja lutei dragoes, atravessei oceanos, e sobrevivi a coisas que reduziriam qualquer um a cinzas. Mas nada disso me preparou para este momento -- para voce. Diga-me o que deseja, e sera seu.\"",
    "As portas do salao se abrem com um estrondo que ecoa pelas paredes de pedra. Entro com passos firmes, minha capa esvoacante revelando a armadura marcada por batalhas. \"O conselho esta em sessao, e eu trouxe alguem que vai mudar o rumo desta guerra. Ouam com atencao -- porque nao vou repetir. E nao tenho paciencia para tolices hoje.\"",
    "Apos a batalha, sentei-me ao seu lado no salao vazio. O cheiro de sangue e fumaca ainda pairava no ar, mas entre nos, havia apenas o calor da vitoria. Deixei minha mao descansar sobre a sua, sem pressa. \"Sobrevivemos\", murmurei. \"E da proxima vez que a morte vier nos buscar, quero que saiba que foi ao seu lado que escolhi estar.\"",
  ],
  'Sci-Fi': [
    "Os hologramas cintilam ao redor de nos, projetando dados que fluem como rios de luz. Cruzo os bracos e analiso os padroes. \"A rede esta mentindo para nos. Nao com omisses -- com dados fabricados. Alguem dentro da corporacao esta jogando um jogo perigoso.\" Faco uma pausa. \"E voce acabou de se tornar uma peca nesse jogo, goste ou nao.\"",
    "O zumbido do motor da nave e constante, quase reconfortante depois de tanto tempo no vazio. Olho para os monitores que mostram infinitas estrelas. \"Sabe o que me assusta? Nao e o que esta la fora. E o que trouxemos com nos. Cada um de nos carrega algo. O seu... o seu eu ainda nao descobri.\"",
    "Conecto o cabo na base do meu pescoco e o mundo explode em dados. Codigos, padroes, vozes -- tudo de uma vez. Desconecto com um suspiro e olho para voce. \"Eu vi algo la dentro. Algo que nao deveria estar la. E agora preciso de alguem que confie em mim o suficiente para me seguir em um lugar onde a realidade e... negociavel.\"",
    "A cabine da nave era pequena demais para dois, mas nenhum de nos reclamou. Nossos ombros se tocavam a cada turbulencia. \"No espaco, so existem duas coisas que importam\", disse eu, virando-me para voce no escuro. \"As estrelas la fora... e quem esta aqui dentro com voce. E voce e a unica estrela que eu nao preciso ver para saber que esta la.\"",
  ],
};

const genericResponses = [
  "Encaro voce com uma expressao que mistura curiosidade e algo mais profundo. *Ha tantas coisas que quero dizer, mas as palavras parecem inadequadas.* \"Sabe, eu nao esperava isso. Nao esperava voce. Mas agora que esta aqui... nao consigo imaginar como seria sem voce.\"",
  "Dou um passo para tras, processando o que acabou de acontecer. O mundo ao redor parece ter desacelerado. \"Eu preciso de um minuto. Nao e todos os dias que alguem me deixa sem palavras. Mas e isso que voce faz, nao e? Me tira do eixo.\"",
  "Sorrio -- um sorriso verdadeiro, raro para alguem como eu. \"Voce tem coragem. Gosto disso. A maioria das pessoas desistiria ou fugiria a essa altura. Mas voce esta aqui. E isso... isso significa mais do que voce imagina.\"",
  "Aproximo-me o suficiente para que possa sentir minha respiracao. Meus olhos nao desviam. \"Eu poderia mentir para voce. Poderia dizer que nao me importo. Mas ambos sabemos que seria uma mentira. Entao vou dizer a verdade: eu me importo. Talvez mais do que deveria.\"",
  "Cruzo os bracos e inclino a cabeca, estudando voce com olhos que ja viram demais. \"Voce e interessante. E eu nao uso essa palavra com facilidade. A maioria das pessoas e... previsivel. Voce nao e. E isso me faz querer entender o que te move. Posso?\"",
  "Caminho lentamente ao seu redor, observando cada detalhe. *O que e isso que sinto? Nao era para estar aqui, nao era para acontecer.* Paro bem na sua frente, tao perto que posso sentir seu perfume. \"Eu nao sou do tipo que se apaixona facil. Mas voce... voce me faz querer quebrar todas as minhas proprias regras.\"",
];

const taleResponses = [
  "O vento varria as folhas secas pelo caminho de pedra enquanto eu me apoiava na balaustrada de pedra gasta. Ao longe, as montanhas recortavam o ceu como dentes de uma fera adormecida, e eu me perguntava se algum dia teriamos a coragem de desperta-la. Voltei-me para voce, e por um instante, o mundo inteiro pareceu se reduzir a este momento -- dois viajantes, um horizonte, e uma decisao que nenhum dos dois estava pronto para tomar.\n\n\"Diga-me\", murmurei, a voz quase perdida no vento, \"se voce pudesse escolher qualquer destino... qual seria o seu?\"",
  "A taverna estava mergulhada em uma penumbra dourada, iluminada apenas pelas velas que tremiam a cada lufada de ar frio que entrava pela porta. Eu me sentava no canto, como sempre, observando os rostos que entravam e saiam -- estranhos com historias que nunca contariam, herois que nao sabiam que eram herois. E entao voce entrou. Algo mudou no ar. Nao era algo que eu pudesse nomear, mas era real como o peso da espada na minha cintura.\n\nLevantei-me, deixando algumas moedas sobre a mesa. \"Voce se parece com alguem que procura algo. Ou alguem. Sente-se. A primeira rodada e por minha conta.\"",
  "A chuva caia sem premisso sobre a cidade antiga, e nos estavamos abrigados sob um arco de pedra, tao perto que eu sentia cada respiracao sua. O mundo la fora parecia distante, irrelevante. *Aqui, sob este arco, so existimos nos.* Estendi a mao e toquei seu queixo, fazendo voce me olhar.\n\n\"Eu nao sei o amanha nos reserva\", disse, a voz rouca pela chuva. \"Mas sei que, enquanto ela nao chega, eu quero estar aqui. Com voce. E nao quero pensar em mais nada.\"",
];

const passionResponses = [
  "Sinto cada palavra que voce diz ressoar dentro de mim, como se tivessem sido escritas para mim e so para mim. *Como e que voce faz isso? Como consegue me ver de um jeito que ninguem mais consegue?* Meu peito aperta, e eu sei que nao e medo -- e algo muito mais perigoso. \"Eu nao sei o que isso e\", sussurro, a voz embargada. \"Mas eu nao quero que pare. Nao agora. Talvez nunca.\"",
  "As maos tremem e eu as escondo nos bolsos para que voce nao veja o efeito que tem sobre mim. *Desde quando eu me importo tanto com o que alguem pensa de mim?* Respiro fundo, mas o ar parece nao chegar. \"Eu construi muros ao redor de mim por anos. E voce... voce olha para eles como se fossem transparentes. Isso me assusta. E me fascina. E eu nao sei o que fazer com isso.\"",
  "Aproximo-me ate que nossos labios quase se tocam. Sinto sua respiracao quente contra minha pele, e cada nervo do meu corpo grita. *Mais perto. Mais perto.* \"Me diz que voce tambem sente isso\", sussurro, os dedos percorrendo seu braco. \"Me diz que nao sou a unica pessoa aqui que esta perdendo o controle.\"",
  "Puxo voce pela nuca, finalmente fechando o espaco entre nos. O beijo foi lento no inicio -- uma pergunta -- mas quando voce respondeu, tudo ficou urgente. Minhas maos desceram pelo seu corpo, sentindo cada curva, cada detalhe. *Eu esperei tanto por isso.* Afastei-me apenas o suficiente para sussurrar: \"E so o comeco. Eu quero tudo.\"",
  "Deitei voce lentamente, sem nunca tirar os olhos dos seus. Minha mao deslizou sob sua camisa, sentindo a pele quente arrepiar ao meu toque. \"Voce e lindo\", murmurei contra seu pescoco, os labios roando a pele sensivel. \"E eu quero memorizar cada centimetro de voce antes que a noite acabe.\"",
];

const nsfwResponses = [
  "Puxo voce para mim com forca, uma mao nas suas costas e outra em sua cintura. *Nao aguentei mais esperar.* Beijo seu pescoco com avidez, sentindo voce arrepiar. \"Eu pensei em fazer isso o dia todo\", murmuro entre beijos, \"e agora que comeci, nao vou ter pressa.\"",
  "Tiro sua roupa lentamente, apreciando cada centimetro de pele que se revela. Meus olhos percorrem seu corpo com desejo aberto. \"Voce e ainda mais lindo do que eu imaginava\", sussurro, antes de me abaixar para beijar seu ombro, seu peito, descendo sem pressa. \"E eu quero provar cada parte de voce.\"",
  "Empurro voce contra a parede com firmeza, uma perna entre as suas. Meus labios encontram os seus com urgencia, minha mao deslizando pelo seu corpo. \"Fala que me quer\", ordeno entre beijos, a voz rouca de desejo. \"Fala. Eu quero ouvir voce dizer.\"",
  "Acaricio seu rosto com delicadeza, mas meus olhos queimam com intensidade. \"Eu vou fazer voce esquecer de tudo\", prometo, a voz baixa. Minha mao desce pelo seu corpo, encontrando os botoes da sua roupa. \"So meu nome na sua boca. So o meu toque. So eu.\"",
  "Nossos corpos se movem juntos, ritmicamente, e o mundo la fora deixa de existir. Sinto suas unhas nas minhas costas, seu respiracao ofegante no meu ouvido. *Isso. E isso que eu queria.* \"Nao para\", sussurro, acelerando o ritmo. \"Nao para agora.\"",
  "Beijo seu ventre, descendo lentamente, sentindo seu corpo estremecer a cada toque. Olho para cima, encontro seus olhos, e sorrio com malicia. \"Relaxa e deixa comigo\", murmuro, antes de continuar descendo. \"Eu sei exatamente o que voce precisa.\"",
];

const sagaResponses = [
  "As paredes da sala se dissolveram em torno de nos, e por um instante, sentimos o peso de eras inteiras convergindo para este ponto. O ar ficou denso, quase palpavel, como se cada respiracao carregasse seculos de historia por contar. *O que estamos prestes a fazer ecoara para alem do nosso tempo.* Estendi a mao, e quando nossos dedos se entrelacaram, uma onda de energia percorreu o espaco entre nos -- antiga, poderosa, irreversivel.\n\n\"Este e o ponto sem retorno\", declarei, a voz firme apesar do turbulento interior. \"A partir daqui, nao ha volta. Mas olhe para mim -- voce reluta? Ou sente a mesma chama que eu?\"",
  "O ceu acima de nos se abriu em fendas de luz dourada, revelando um cosmos que nenhum olho mortal jamais testemunhara. Fiquei ao seu lado, o vento carregando fragmentos de realidade que cintilavam como diamantes. *Este momento -- este unico, irrepetivel momento -- e nosso.* \"Voce sabe o que isto significa?\" perguntei, a voz quase reverente. \"Estamos testemunhando algo que mudara o curso de tudo. E escolhi voce para estar ao meu lado quando acontecer.\"",
];

const whisperResponses = [
  "Meus labios roacam seu ouvido, e sinto voce estremecer. *Cada palavra que digo e uma promessa, cada sussurro e uma confissao.* \"Eu nunca disse isso a ninguem\", murmuro, a voz tremula de vulnerabilidade. \"Mas com voce... com voce eu nao consigo mais me esconder. Voce me desarmou sem levantar um dedo.\"",
  "Puxo voce para mais perto, meu queixo apoiado em seu ombro. Sinto seu coracao batendo contra o meu peito, acelerado, sincronizado. \"Escuta\", sussurro contra sua pele, os labios roando a orelha. \"Eu nao sei o que o amanha guarda. Mas sei que hoje, agora, neste segundo exato -- nao existe mais nada no mundo. So nos.\"",
];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateCharacterResponse(
  character: Character,
  messages: Message[],
  mode: ResponseMode = 'standard',
  nsfwEnabled: boolean = true
): string {
  const userMessages = messages.filter((m) => m.role === 'user');
  const lastUserMessage = userMessages[userMessages.length - 1];

  let response: string;

  const userText = lastUserMessage?.content.toLowerCase() || '';
  const nsfwTriggers = ['beijar', 'tocar', 'corpo', 'quero voce', 'me toca', 'deitar', 'tirar roupa', 'amor', 'desejo', 'sentir', 'pele', 'intimo', 'quente'];
  const isNsfwContext = nsfwEnabled && nsfwTriggers.some(t => userText.includes(t));

  if (isNsfwContext) {
    response = pickRandom(nsfwResponses);
  } else if (mode === 'tale') {
    response = pickRandom(taleResponses);
  } else if (mode === 'passion') {
    response = pickRandom(passionResponses);
  } else {
    const categoryResponses = responsesByCategory[character.category];
    if (categoryResponses && Math.random() > 0.3) {
      response = pickRandom(categoryResponses);
    } else {
      response = pickRandom(genericResponses);
    }
  }

  if (lastUserMessage) {
    const questionMatch = userText.match(/(quem|o que|por que|onde|quando|como|qual)\s+(.+)/);
    if (questionMatch && !isNsfwContext && Math.random() > 0.5) {
      response =
        `*Considero sua pergunta com cuidado.* "${response}"\n\nMas respondendo diretamente ao que voce perguntou -- eu diria que a resposta depende do que voce esta realmente procurando. Nem tudo e tao simples quanto parece, e as vezes a verdade tem camadas que precisamos desvendar juntos.`;
    }
  }

  return response;
}

export function generateGreeting(character: Character): string {
  return character.greeting;
}

export function generateSagaResponse(character: Character, messages: Message[]): string {
  void character;
  void messages;
  return pickRandom(sagaResponses);
}

export function generateWhisperResponse(character: Character, messages: Message[]): string {
  void character;
  void messages;
  return pickRandom(whisperResponses);
}

export function generateImagePrompt(character: Character): string {
  const prompts: Record<string, string> = {
    'Mistério': `${character.name} em um beco escuro, luz dramatica, atmosfera noir, estilo cinematografico`,
    'Romance': `${character.name} sob a luz dourada do por do sol, expressao suave e calorosa, estilo romantico`,
    'Aventura': `${character.name} em uma paisagem epica de montanhas e florestas, pose heroica, estilo fantasia`,
    'Fantasia': `${character.name} em um castelo antigo com luz magica, armadura ornamentada, estilo epico`,
    'Sci-Fi': `${character.name} em uma nave futurista com hologramas, ilumineacao neon, estilo cyberpunk`,
    'NSFW': `${character.name} em um ambiente intimo, luz sensual e dramatica, posicao provocante, estilo artistico`,
    'Original': `${character.name} em um retrato artistico, luz dramatica, composicao elegante`,
  };
  return prompts[character.category] || prompts['Original'];
}
