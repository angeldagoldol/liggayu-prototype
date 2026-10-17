/** Tokyo After Dark — 東京. Shape: see src/data/schema.js. */
export default {
  id: 'b_tokyo-after-dark',
  slug: 'tokyo-after-dark',
  title: 'Tokyo After Dark',
  titleJp: '東京',
  titleKana: 'とうきょう',
  subtitle: 'Neon alleys, tiny bars and late-night ramen in one of the world’s biggest cities',
  category: 'cities',
  region: 'kanto',
  seasons: [
    'spring',
    'summer',
    'autumn',
    'winter'
  ],
  organization: 'Yoru Walks Tokyo',
  summary: 'A night-owl guide to Tokyo: Shibuya Crossing at full tide, six-seat bars in Golden Gai, izakaya under the train tracks and ramen at 1 a.m.',
  tags: [
    'tokyo',
    'nightlife',
    'izakaya',
    'ramen',
    'shinjuku',
    'shibuya',
    'neon'
  ],
  format: 'bifold',
  updatedAt: '2026-10-02T21:00:00.000Z',
  readMinutes: 4,
  featured: true,
  source: 'builtin',
  theme: {
    paper: '#13141c',
    ink: '#f2ede4',
    accent: '#ff4f7b',
    accent2: '#2ee6d6',
    muted: '#9aa0b4',
    typeface: 'sans'
  },
  cover: {
    art: 'ichimatsu',
    seed: 5
  },
  pages: [
    {
      id: 'p1',
      type: 'cover',
      eyebrow: 'Kantō · Open every night',
      title: 'Tokyo After Dark',
      titleJp: '東京',
      subtitle: 'Neon alleys, six-seat bars and ramen at 1 a.m. — the city after the office lights go out.'
    },
    {
      id: 'p2',
      type: 'intro',
      kicker: 'Konbanwa',
      heading: 'The city changes shift at sunset',
      body: 'By day Tokyo is efficient, polite and on time. After dark it loosens its tie. Salarymen crowd into yakitori stands under the railway arches, bartenders pour whisky in rooms the size of a lift, and the last trains leave stations packed and happy.\n\nThis brochure is a map of the best of it — and the manners that make you a welcome guest.',
      pullQuote: 'Tokyo after dark is loud, tiny, delicious — and remarkably safe.'
    },
    {
      id: 'p3',
      type: 'features',
      kicker: 'Neighbourhoods',
      heading: 'Where the night happens',
      items: [
        {
          icon: 'Footprints',
          title: 'Shibuya Crossing',
          text: 'Watch the scramble from above, then join it. Go just after 8 p.m. for full tide.'
        },
        {
          icon: 'Martini',
          title: 'Golden Gai',
          text: 'Some two hundred tiny bars in six narrow Shinjuku alleys. Many seat fewer than ten.'
        },
        {
          icon: 'TrainFront',
          title: 'Yūrakuchō arches',
          text: 'Smoky izakaya tucked under the train tracks, with beer and yakitori for the after-work crowd.'
        },
        {
          icon: 'MoonStar',
          title: 'Tokyo skyline',
          text: 'See the city glitter from Shibuya Sky or the Tokyo Tower deck before midnight.'
        }
      ]
    },
    {
      id: 'p4',
      type: 'agenda',
      heading: 'A night, hour by hour',
      items: [
        {
          time: '18:30',
          title: 'Shibuya Sky',
          text: 'The open-air rooftop deck, with the whole city lit up below.'
        },
        {
          time: '20:00',
          title: 'The scramble',
          text: 'Cross Shibuya with up to 3,000 people at once.'
        },
        {
          time: '21:00',
          title: 'Izakaya hop',
          text: 'Yakitori, highballs and edamame under the tracks.'
        },
        {
          time: '23:00',
          title: 'Golden Gai',
          text: 'Find a bar with an empty stool and a friendly sign.'
        },
        {
          time: '01:00',
          title: 'Ramen reset',
          text: 'Rich tonkotsu at a ticket-machine counter.'
        }
      ]
    },
    {
      id: 'p5',
      type: 'gallery',
      heading: 'Shot after midnight',
      items: [
        {
          art: 'ichimatsu',
          seed: 3,
          caption: 'Kabukichō signage, Shinjuku'
        },
        {
          art: 'kumo',
          seed: 17,
          caption: 'Steam from a ramen counter'
        },
        {
          art: 'shippo',
          seed: 26,
          caption: 'Lanterns in Omoide Yokochō'
        }
      ]
    },
    {
      id: 'p6',
      type: 'stats',
      heading: 'The size of the night',
      body: 'Greater Tokyo is one of the world’s largest metropolitan areas.',
      items: [
        {
          value: 37,
          prefix: '',
          suffix: 'M',
          label: 'people in Greater Tokyo'
        },
        {
          value: 13,
          prefix: '',
          suffix: '',
          label: 'subway lines'
        },
        {
          value: 3000,
          prefix: '',
          suffix: '',
          label: 'people per green light at Shibuya, at peak'
        }
      ]
    },
    {
      id: 'p7',
      type: 'phrases',
      heading: 'Izakaya Japanese',
      items: [
        {
          jp: '乾杯！',
          romaji: 'Kanpai!',
          meaning: 'Cheers!'
        },
        {
          jp: 'すみません',
          romaji: 'Sumimasen',
          meaning: 'Excuse me — how you call the staff'
        },
        {
          jp: 'おすすめは何ですか？',
          romaji: 'Osusume wa nan desu ka?',
          meaning: 'What do you recommend?'
        },
        {
          jp: '美味しい！',
          romaji: 'Oishii!',
          meaning: 'Delicious!'
        },
        {
          jp: 'お会計お願いします',
          romaji: 'Okaikei onegaishimasu',
          meaning: 'The bill, please'
        }
      ]
    },
    {
      id: 'p8',
      type: 'pricing',
      heading: 'Night walks',
      note: 'Small groups of up to eight. Food and first drinks included.',
      plans: [
        {
          name: 'Neon Basics',
          price: '¥14,000',
          period: '3 hours',
          features: [
            'Shibuya Crossing & skyline',
            'Two izakaya stops',
            'Local host'
          ],
          highlight: false
        },
        {
          name: 'Last Train',
          price: '¥24,000',
          period: '5 hours',
          features: [
            'Everything in Neon Basics',
            'Golden Gai bar crawl',
            'Midnight ramen',
            'Taxi home included'
          ],
          highlight: true
        }
      ]
    },
    {
      id: 'p9',
      type: 'quote',
      quote: 'Our host knew the bartender, the bartender knew the chef, and by 1 a.m. we were eating gyōza with half of the alley.',
      author: 'Marco D.',
      role: 'Guest, July 2026'
    },
    {
      id: 'p10',
      type: 'contact',
      heading: 'Book a night',
      body: 'Walks run every evening from 18:00. Message us your date and we will match you with a host who speaks your language.',
      cta: 'Book a night walk',
      details: [
        {
          icon: 'Mail',
          label: 'Email',
          value: 'hello@yoru-walks.example'
        },
        {
          icon: 'Users',
          label: 'Groups',
          value: 'Up to six walkers per host'
        },
        {
          icon: 'MapPin',
          label: 'Meet',
          value: 'Hachikō statue, Shibuya Station'
        }
      ]
    },
    {
      id: 'p11',
      type: 'back',
      title: 'Otsukaresama — you earned it',
      body: 'Yoru Walks Tokyo runs small-group night walks led by local hosts.',
      tagline: 'yoru-walks.example'
    }
  ]
};
