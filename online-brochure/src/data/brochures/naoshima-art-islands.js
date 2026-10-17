/** Naoshima & the Art Islands — 直島. Shape: see src/data/schema.js. */
export default {
  id: 'b_naoshima-art-islands',
  slug: 'naoshima-art-islands',
  title: 'Naoshima & the Art Islands',
  titleJp: '直島',
  titleKana: 'なおしま',
  subtitle: 'Museums, pumpkins and slow ferries across the Seto Inland Sea',
  category: 'craft',
  region: 'shikoku',
  seasons: [
    'spring',
    'autumn'
  ],
  organization: 'Setouchi Slow Ferry Club',
  summary: 'Cycle between museums on Naoshima, Teshima and Inujima — art islands in the calm Seto Inland Sea, with Tadao Ando architecture and Yayoi Kusama’s famous pumpkins.',
  tags: [
    'naoshima',
    'art',
    'museums',
    'architecture',
    'teshima',
    'setouchi',
    'cycling'
  ],
  format: 'trifold',
  updatedAt: '2026-06-20T03:00:00.000Z',
  readMinutes: 4,
  featured: false,
  source: 'builtin',
  theme: {
    paper: '#f6f4ef',
    ink: '#151515',
    accent: '#b8431b',
    accent2: '#e8b400',
    muted: '#5b5852',
    typeface: 'mono'
  },
  cover: {
    art: 'enso',
    seed: 7
  },
  pages: [
    {
      id: 'p1',
      type: 'cover',
      eyebrow: 'Shikoku · Spring & autumn edition',
      title: 'The Art Islands',
      titleJp: '直島',
      subtitle: 'World-class museums on quiet islands, linked by ferries across the calm Seto Inland Sea.'
    },
    {
      id: 'p2',
      type: 'intro',
      kicker: 'Welcome aboard',
      heading: 'Islands that became galleries',
      body: 'Naoshima was a quiet fishing and industrial island until, from the late 1980s, an ambitious art project began turning it into one of the world’s most unusual museum landscapes. Galleries by the architect Tadao Ando sink into its hillsides, and old houses in Honmura became artworks.\n\nThe idea spread to nearby Teshima and Inujima, and every three years the Setouchi Triennale fills a dozen islands with new work. Bring comfortable shoes, book museum slots ahead, and let the ferries set the pace.',
      pullQuote: 'The ferry timetable is part of the artwork.'
    },
    {
      id: 'p3',
      type: 'features',
      kicker: 'Don’t miss',
      heading: 'Four places to start',
      items: [
        {
          icon: 'Landmark',
          title: 'Chichu Art Museum',
          text: 'Tadao Ando’s mostly underground museum, lit by daylight, with works by Monet, James Turrell and Walter De Maria.'
        },
        {
          icon: 'Palette',
          title: 'Kusama’s pumpkins',
          text: 'Yayoi Kusama’s yellow pumpkin on its pier, and the red one by Miyanoura port.'
        },
        {
          icon: 'House',
          title: 'Art House Project',
          text: 'Old homes and a shrine in Honmura, reimagined by contemporary artists.'
        },
        {
          icon: 'Bath',
          title: 'I♥湯 bathhouse',
          text: 'A working public bath by Shinro Ohtake — the only artwork on the island you can soak in.'
        }
      ]
    },
    {
      id: 'p4',
      type: 'gallery',
      heading: 'Light, water, concrete',
      items: [
        {
          art: 'enso',
          seed: 13,
          caption: 'A circle of daylight'
        },
        {
          art: 'hinomaru',
          seed: 8,
          caption: 'The yellow pumpkin at sunset'
        },
        {
          art: 'seigaiha',
          seed: 19,
          caption: 'The Inland Sea from Teshima'
        },
        {
          art: 'ichimatsu',
          seed: 6,
          caption: 'A tiled bathhouse wall'
        }
      ]
    },
    {
      id: 'p5',
      type: 'agenda',
      heading: 'One day on Naoshima',
      items: [
        {
          time: '08:20',
          title: 'Ferry from Uno',
          text: 'About 20 minutes to Miyanoura; rent an e-bike at the port.'
        },
        {
          time: '10:00',
          title: 'Art House Project',
          text: 'Wander Honmura’s lanes between the houses.'
        },
        {
          time: '13:00',
          title: 'Chichu Art Museum',
          text: 'Timed entry — book a few weeks ahead.'
        },
        {
          time: '16:30',
          title: 'Benesse House',
          text: 'Sculpture on the beach and the yellow pumpkin at golden hour.'
        },
        {
          time: '19:00',
          title: 'I♥湯',
          text: 'A soak among the collage before dinner.'
        }
      ]
    },
    {
      id: 'p6',
      type: 'stats',
      heading: 'Islands in numbers',
      body: 'Small islands, outsized ambition.',
      items: [
        {
          value: 20,
          prefix: '',
          suffix: ' min',
          label: 'by ferry from Uno port'
        },
        {
          value: 3,
          prefix: '',
          suffix: ' yrs',
          label: 'between Setouchi Triennale editions'
        },
        {
          value: 2,
          prefix: '',
          suffix: '',
          label: 'Kusama pumpkins on Naoshima'
        }
      ]
    },
    {
      id: 'p7',
      type: 'phrases',
      heading: 'Gallery Japanese',
      items: [
        {
          jp: '写真撮影禁止',
          romaji: 'Shashin satsuei kinshi',
          meaning: 'No photography'
        },
        {
          jp: '予約しています',
          romaji: 'Yoyaku shite imasu',
          meaning: 'I have a reservation'
        },
        {
          jp: '自転車を借りたいです',
          romaji: 'Jitensha o karitai desu',
          meaning: 'I’d like to rent a bicycle'
        },
        {
          jp: '次のフェリーは何時ですか？',
          romaji: 'Tsugi no ferī wa nanji desu ka?',
          meaning: 'When is the next ferry?'
        },
        {
          jp: 'きれいですね',
          romaji: 'Kirei desu ne',
          meaning: 'Beautiful, isn’t it?'
        }
      ]
    },
    {
      id: 'p8',
      type: 'quote',
      quote: 'We arrived for one museum and stayed three days. On Teshima, a single drop of water made my whole family go quiet.',
      author: 'Yuki & Ben',
      role: 'Travellers, October 2025'
    },
    {
      id: 'p9',
      type: 'contact',
      heading: 'Plan your crossing',
      body: 'Most museums close on Mondays and Chichu sells timed tickets. We sort the bookings, ferries and bikes so you can simply look.',
      cta: 'Plan my island days',
      details: [
        {
          icon: 'Mail',
          label: 'Email',
          value: 'ferry@setouchi-slow.example'
        },
        {
          icon: 'Clock',
          label: 'Hours',
          value: 'Tue–Sun 08:30–17:30 JST'
        },
        {
          icon: 'MapPin',
          label: 'Desk',
          value: 'Miyanoura Port, Naoshima'
        }
      ]
    },
    {
      id: 'p10',
      type: 'back',
      title: 'Mata ne — until the next tide',
      body: 'Setouchi Slow Ferry Club plans unhurried art journeys across the Seto Inland Sea.',
      tagline: 'setouchi-slow.example'
    }
  ]
};
