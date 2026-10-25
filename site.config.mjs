// Everything that is "yours" lives here. The build and the feed sync read this file.
export const site = {
  name: 'Azure Centric',
  url: 'https://azurecentric.com',
  author: 'Marcos Nogueira',
  tagline: {
    en: 'Azure, explained from the field.',
    pt: 'Azure, explicado a partir do terreno.',
  },
  description: {
    en: 'Posts, a podcast and video series about Microsoft Azure by Marcos Nogueira.',
    pt: 'Artigos, um podcast e séries de vídeo sobre Microsoft Azure, por Marcos Nogueira.',
  },
  social: {
    youtube: 'https://www.youtube.com/@azurecentric',
    linkedin: 'https://www.linkedin.com/company/azurecentric',
    twitter: 'https://twitter.com/azurecentric',
    instagram: 'https://instagram.com/azurecentric',
    facebook: 'https://facebook.com/azurecentric',
  },
  // How many posts the home page lists (desktop shows all, phone shows the first few + "more").
  homePostCount: 15,
};

export const podcast = {
  title: 'Azure Centric Podcast',
  // Spotify for Creators → Settings → "RSS distribution" → copy the feed URL here.
  // Until it is set, the site keeps using src/data/podcast.json as-is.
  rss: '',
  description: {
    en: 'Informal conversations about Azure, certifications and cloud. Marcos Nogueira and a guest, once a week.',
    pt: 'Conversas informais sobre Azure, certificações e cloud. Marcos Nogueira e um convidado, todas as semanas.',
  },
  links: {
    spotify: 'https://open.spotify.com/show/REPLACE_ME',
    apple: 'https://podcasts.apple.com/ca/podcast/azure-centric-podcast/id1542809529',
    youtube: 'https://www.youtube.com/@azurecentric',
    soundcloud: 'https://soundcloud.com/azurecentric',
  },
};

// One entry per YouTube channel. `slug` becomes the URL: /videos/<slug>.
// Series are matched against video titles (case-insensitive) to tag each upload.
export const youtubeChannels = [
  {
    slug: 'azure-centric',
    name: 'Azure Centric',
    channelId: 'UCNT2hI8HsyWyvp_Sg_9cf5w',
    url: 'https://www.youtube.com/@azurecentric',
    description: {
      // One string per paragraph.
      en: [
        "I'm Marcos, and this is where I talk about Azure.",
        "Most of the videos are the Azure Centric Podcast. I sit down with a guest, we go through what changed in Azure that week, and we try to work out what it means for the people who actually run it. Some of my guests are MVPs, some work at Microsoft, some just solved a problem in a way I found interesting.",
        "The Concept Series is for when you want one thing explained properly, like subscriptions, management groups, or how to make a VM highly available. I also do a recap of the Ignite Book of News, because nobody has time to read all of it, and a few videos on certifications and whether they are worth your time.",
        "If any of that sounds useful, subscribe and say hi in the comments.",
      ],
      pt: [
        'Sou o Marcos e é aqui que falo de Azure.',
        'A maior parte dos vídeos é o Azure Centric Podcast. Sento-me com um convidado, passamos pelo que mudou no Azure nessa semana e tentamos perceber o que isso significa para quem gere a plataforma no dia a dia. Alguns dos convidados são MVPs, outros trabalham na Microsoft, outros simplesmente resolveram um problema de uma forma que achei interessante.',
        'O Concept Series é para quando quer uma coisa bem explicada, como subscrições, management groups ou como tornar uma VM altamente disponível. Faço também um resumo do Ignite Book of News, porque ninguém tem tempo para ler aquilo tudo, e alguns vídeos sobre certificações e se valem ou não o seu tempo.',
        'Se algo disto lhe for útil, subscreva e deixe um olá nos comentários.',
      ],
    },
    // Series are matched against video titles (case-insensitive, first match wins). Unmatched videos only show under "All".
    series: [
      { key: 'podcast', name: 'Azure Centric Podcast', match: ['podcast'] },
      { key: 'concepts', name: 'Concept Series', match: ['concept'] },
      { key: 'events', name: 'Ignite Book of News', match: ['ignite'] },
      { key: 'certifications', name: 'Certifications', match: ['certification', 'az-'] },
    ],
  },
  // {
  //   slug: 'second-channel',
  //   name: 'Second channel',
  //   channelId: 'UC...........',
  //   url: 'https://www.youtube.com/@...',
  //   description: { en: [''], pt: [''] },
  //   series: [],
  // },
];

// Categories: the key is what you write in a post's front-matter (`category: networking`).
export const categories = {
  compute: { en: 'Virtual machines', pt: 'Máquinas virtuais', icon: 'server' },
  networking: { en: 'Networking', pt: 'Rede', icon: 'network' },
  storage: { en: 'Storage', pt: 'Armazenamento', icon: 'database' },
  'backup-dr': { en: 'Backup & disaster recovery', pt: 'Backup e recuperação de desastres', icon: 'refresh' },
  automation: { en: 'Automation & IaC', pt: 'Automação e IaC', icon: 'terminal' },
  governance: { en: 'Architecture & governance', pt: 'Arquitetura e governação', icon: 'shield' },
  apps: { en: 'Containers & apps', pt: 'Containers e apps', icon: 'box' },
  'hyper-v': { en: 'Hyper-V', pt: 'Hyper-V', icon: 'layers' },
  'windows-server': { en: 'Windows Server & System Center', pt: 'Windows Server e System Center', icon: 'grid' },
  cloud: { en: 'Cloud & news', pt: 'Cloud e notícias', icon: 'cloud' },
  "cloud-security": {"en": "Cloud security", "pt": "Segurança na nuvem", "icon": "shield"},
  "identity-access": {"en": "Identity & access", "pt": "Identidade e acesso", "icon": "user"},
  "security-copilot": {"en": "Microsoft Security Copilot", "pt": "Microsoft Security Copilot", "icon": "shield"},
  "siem-xdr": {"en": "SIEM & XDR", "pt": "SIEM e XDR", "icon": "pulse"},
  "app-paas": {"en": "Azure application PaaS", "pt": "Aplicações PaaS no Azure", "icon": "box"},
  "hpc-ai": {"en": "Azure HPC & AI infrastructure", "pt": "Infraestrutura HPC e IA no Azure", "icon": "server"},
  "hybrid-migration": {"en": "Azure hybrid & migration", "pt": "Azure híbrido e migração", "icon": "cloud"},
  "integration": {"en": "Azure integration PaaS", "pt": "Integração PaaS no Azure", "icon": "layers"},
  "operations": {"en": "Azure operations & management", "pt": "Operações e gestão do Azure", "icon": "pulse"},
  "powershell": {"en": "PowerShell", "pt": "PowerShell", "icon": "terminal"},
  "high-availability": {"en": "High availability", "pt": "Alta disponibilidade", "icon": "refresh"},
  "well-architected": {"en": "Well-Architected & resilience", "pt": "Boas práticas e resiliência", "icon": "shield"},
};
