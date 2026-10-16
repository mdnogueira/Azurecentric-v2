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
    en: 'Very informal conversations about Azure, certifications and cloud, with guests. Hosted by Marcos Nogueira and Andrew Lowes.',
    pt: 'Conversas muito informais sobre Azure, certificações e cloud, com convidados. Com Marcos Nogueira e Andrew Lowes.',
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
    series: [
      { key: 'weekly-news', name: 'Azure Weekly News', match: ['weekly news', 'azure news'] },
      { key: 'concepts', name: 'Azure Concept Series', match: ['concept'] },
      { key: 'podcast', name: 'Podcast Series', match: ['podcast'] },
    ],
  },
  // {
  //   slug: 'second-channel',
  //   name: 'Second channel',
  //   channelId: 'UC...........',
  //   url: 'https://www.youtube.com/@...',
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
};
