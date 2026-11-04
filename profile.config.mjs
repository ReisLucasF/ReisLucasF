// Tudo o que aparece no README sai daqui. Edite e rode `node build.mjs`
// (a GitHub Action também roda sozinha todo dia, atualizando nível, XP e estatísticas).

export default {
  user: 'reislucasf',            // usuário do GitHub (estatísticas e gráfico de contribuições)
  name: 'Lucas Reis',
  role: 'Engenheiro de Software',
  careerStart: '2022-01-01',     // nível = anos desde aqui; XP = quanto do ano atual já passou
  site: 'https://reislucasf.com.br',
  linkedin: 'https://www.linkedin.com/in/lucasreisf/',
  email: 'reislucasf@icloud.com',
  world: 'BH-BR',                // "WORLD" no topo do banner

  // frases que o terminal digita, em ciclo
  typing: [
    'Software que está rodando agora.',
    'Hospitais, bancos e prefeituras: onde cair não é opção.',
    'Do suporte nível 2 a fundador e CTO.',
    'Café, código e um gato revisando PRs.',
  ],

  sheet: [
    ['CLASSE', 'Engenheiro de Software'],
    ['SUBCLASSE', 'Founder & CTO · Devos Tecnologia'],
    ['GUILDA', 'Domo Inovação × Banco Mercantil'],
    ['BASE', 'Belo Horizonte, Brasil · UTC−3'],
    ['PET', 'Salomão, revisor de PRs (sem SLA)'],
  ],
  // 0 a 10
  attributes: [
    ['ARQUITETURA', 9], ['BACKEND', 9],
    ['FRONTEND', 9], ['DEVOPS', 7],
    ['DADOS', 8], ['LIDERANÇA', 8],
  ],

  // mapa da trajetória (status: done | now | locked)
  journey: [
    { stage: '1-1', year: '2022', title: 'Konica Minolta', sub: 'Estagiário de TI', status: 'done' },
    { stage: '1-2', year: '2022', title: 'PUC Minas', sub: 'ADS · 2 destaques', status: 'done' },
    { stage: '1-3', year: '2022', title: 'Devos', sub: 'Founder & CTO', status: 'now' },
    { stage: '2-1', year: '2023', title: 'Banco Mercantil', sub: 'Canais digitais', status: 'done' },
    { stage: '2-2', year: '2025', title: 'Domo × Mercantil', sub: 'Analista de Sistemas', status: 'now' },
    { stage: '2-3', year: '2025', title: 'FIA', sub: 'Pós em Eng. de Software', status: 'now' },
    { stage: 'BOSS', year: '????', title: '???', sub: 'Próximo chefão', status: 'locked' },
  ],

  // diário de missões (status: done | online | prod | side)
  quests: [
    { title: 'Vitalo', status: 'done', stars: 5, desc: 'Prontuário eletrônico da Policlínica da Segurança Pública da PB.', loot: ['Next.js', 'TypeScript', 'WebSocket', 'PostgreSQL', 'Python'] },
    { title: 'VitalGourmet', status: 'online', stars: 5, desc: 'Refeições hospitalares multitenant, 24/7 num hospital em Sousa/PB.', loot: ['React', 'Next.js', 'TypeScript', 'WebSocket', 'PostgreSQL'] },
    { title: 'SEDURB JP', status: 'online', stars: 4, desc: 'Gestão urbana da Prefeitura de João Pessoa.', loot: ['Next.js', 'TypeScript', 'MySQL'] },
    { title: 'Cards & Popups', status: 'prod', stars: 4, desc: 'Ações do app do Banco Mercantil, com 83% menos tempo para publicar.', loot: ['C#', 'ASP.NET', 'REST API', 'SQL Server', 'React'] },
    { title: 'ALI / SEBRAE-PB', status: 'done', stars: 3, desc: 'Transformação digital: 10+ sites para pequenos negócios.', loot: ['React', 'WordPress', 'PHP'] },
    { title: 'Finn', status: 'side', stars: 4, desc: 'Finanças pessoais offline, com CDI, IR e IOF calculados.', loot: ['Flutter', 'Dart', 'SQLite', 'OFX'] },
    { title: 'AnkiCode', status: 'side', stars: 4, desc: 'Anki para programação, com uma arena 8-bit de batalhas.', loot: ['Flutter', 'Node.js', 'TypeScript'] },
  ],

  // inventário (rarity: legendary | epic | rare | common); icon: até 3 caracteres
  inventory: [
    { icon: 'TS', name: 'TypeScript', rarity: 'legendary', tip: 'sistemas que não podem cair' },
    { icon: 'NX', name: 'Next.js', rarity: 'legendary', tip: 'hospitais, prefeituras e bancos' },
    { icon: 'RE', name: 'React', rarity: 'legendary', tip: 'interfaces que parecem óbvias' },
    { icon: 'PG', name: 'PostgreSQL', rarity: 'legendary', tip: 'dados clínicos 24/7' },
    { icon: 'ND', name: 'Node.js', rarity: 'epic', tip: 'APIs e tempo real' },
    { icon: 'PY', name: 'Python', rarity: 'epic', tip: 'automação e backends' },
    { icon: 'C#', name: 'C# / .NET', rarity: 'epic', tip: 'em produção no Banco Mercantil' },
    { icon: 'DK', name: 'Docker', rarity: 'epic', tip: 'deploy sem surpresa' },
    { icon: 'FL', name: 'Flutter', rarity: 'rare', tip: 'Finn e AnkiCode' },
    { icon: 'SQL', name: 'SQL Server', rarity: 'rare', tip: 'e Oracle, no banco' },
    { icon: 'MY', name: 'MySQL', rarity: 'rare', tip: 'gestão urbana de João Pessoa' },
    { icon: 'CI', name: 'CI/CD', rarity: 'rare', tip: 'pipelines em VPS e cloud' },
    { icon: 'WS', name: 'WebSocket', rarity: 'rare', tip: 'cozinha e enfermaria em tempo real' },
    { icon: 'GIT', name: 'Git', rarity: 'common', tip: 'git log bem contado' },
    { icon: 'cafe', name: 'Café', rarity: 'legendary', qty: '∞', tip: 'uptime de 99,9%' },
    { icon: 'cat', name: 'Salomão', rarity: 'legendary', qty: '1', tip: 'revisa PRs, não tem SLA' },
  ],

  achievements: [
    { title: '24/7 SEM CAIR', desc: 'Sistema hospitalar multitenant em produção, sem pausa.', year: '2024' },
    { title: '−83% DE TEMPO', desc: 'Para publicar ações no app do Banco Mercantil.', year: '2025' },
    { title: 'FUNDADOR', desc: 'Criou a Devos Tecnologia ainda na graduação.', year: '2022' },
    { title: 'MISSÃO GOVERNO', desc: 'Sistemas para o Estado da PB, João Pessoa e Natuba.', year: '2024' },
    { title: '10+ SITES', desc: 'Entregues com o ALI/SEBRAE para pequenos negócios.', year: '2023' },
    { title: 'DESTAQUE ×2', desc: 'HemoLife (2022) e ForkFinder (2023) na PUC Minas.', year: '2023' },
    { title: 'DO N2 AO CTO', desc: 'Do suporte nível 2 a fundador e CTO.', year: '2025' },
    { title: '???', desc: 'Conquista secreta: o seu projeto pode ser o próximo.', locked: true },
  ],

  // pragas do minigame
  bugs: ['NULL', '404', 'N+1', 'CORS', 'LEAK', 'RACE', 'NaN', 'OOM', 'CSRF', 'DEAD', 'LOCK', 'TIMEOUT', '500', 'XSS', 'UNDEF', 'FLAKY', 'DRIFT', 'CACHE'],

  quote: 'A tecnologia é a ponte entre ideias e soluções reais que transformam o mundo.',
};
