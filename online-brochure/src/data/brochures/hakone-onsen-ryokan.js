/** Hakone: Steam & Stillness — 箱根. Shape: see src/data/schema.js. */
export default {
  id: 'b_hakone-onsen-ryokan',
  slug: 'hakone-onsen-ryokan',
  title: 'Hakone: Steam & Stillness',
  titleJp: '箱根',
  titleKana: 'はこね',
  subtitle: 'Hot springs, ryokan manners and Mount Fuji across Lake Ashi',
  category: 'onsen',
  region: 'kanto',
  seasons: [
    'spring',
    'autumn',
    'winter'
  ],
  organization: 'Yuge Travel Atelier',
  summary: 'A gentle guide to Hakone: soak in volcanic hot springs, learn ryokan etiquette, cruise Lake Ashi and catch Mount Fuji on a clear morning — under two hours from Tokyo.',
  tags: [
    'hakone',
    'onsen',
    'ryokan',
    'mount fuji',
    'lake ashi',
    'kaiseki',
    'etiquette'
  ],
  format: 'bifold',
  updatedAt: '2026-09-30T06:00:00.000Z',
  readMinutes: 5,
  featured: false,
  source: 'builtin',
  theme: {
    paper: '#efe7db',
    ink: '#2a1e2c',
    accent: '#b0452c',
    accent2: '#4a5d8f',
    muted: '#675963',
    typeface: 'serif'
  },
  cover: {
    art: 'fuji',
    seed: 23
  },
  pages: [
    {
      id: 'p1',
      type: 'cover',
      eyebrow: 'Kantō · Spring, autumn & winter edition',
      title: 'Steam & Stillness',
      titleJp: '箱根',
      subtitle: 'Volcanic hot springs, quiet ryokan and Mount Fuji across the lake — the classic escape from Tokyo.'
    },
    {
      id: 'p2',
      type: 'intro',
      kicker: 'Yōkoso — welcome',
      heading: 'A volcano you can bathe in',
      body: 'Hakone sits in the caldera of a volcano that is still very much alive. Hot water rises in more than a dozen spa villages, sulphur steams from the vents at Ōwakudani, and on clear days Mount Fuji stands above Lake Ashi.\n\nThe best way to see it is slowly: a morning on the old Tōkaidō road, an afternoon among sculptures in the open-air museum, and an evening in a ryokan where dinner arrives in a dozen small courses and the futon appears while you bathe.',
      pullQuote: 'Soak first. Sightsee later. Then soak again.'
    },
    {
      id: 'p3',
      type: 'features',
      kicker: 'Onsen manners',
      heading: 'How to bathe like a local',
      items: [
        {
          icon: 'Bath',
          title: 'Wash first',
          text: 'Sit at the shower stools and scrub head to toe before you step into the shared bath.'
        },
        {
          icon: 'Sparkles',
          title: 'Nothing in the water',
          text: 'No swimsuits and no towels in the bath. Fold your small towel on your head instead.'
        },
        {
          icon: 'Info',
          title: 'Ask about tattoos',
          text: 'Some baths still refuse tattoos. Many ryokan have a private bath you can reserve.'
        },
        {
          icon: 'Moon',
          title: 'Slow and quiet',
          text: 'Keep voices low, tie up long hair, and drink water between soaks.'
        },
        {
          icon: 'Hotel',
          title: 'Yukata, left over right',
          text: 'Wrap the left side over the right. The reverse is only for the deceased.'
        }
      ]
    },
    {
      id: 'p4',
      type: 'agenda',
      heading: 'The Hakone loop',
      items: [
        {
          time: '08:30',
          title: 'Romancecar from Shinjuku',
          text: 'About 85 minutes to Hakone-Yumoto.'
        },
        {
          time: '10:30',
          title: 'Mountain railway',
          text: 'The Hakone Tozan line zigzags uphill on switchbacks.'
        },
        {
          time: '12:30',
          title: 'Ōwakudani',
          text: 'Volcanic vents and black eggs boiled in the hot springs.'
        },
        {
          time: '14:30',
          title: 'Lake Ashi cruise',
          text: 'Cross the caldera lake toward Hakone Shrine’s red torii.'
        },
        {
          time: '17:00',
          title: 'Ryokan & kaiseki',
          text: 'Check in, soak, then dinner served in your room.'
        }
      ]
    },
    {
      id: 'p5',
      type: 'gallery',
      heading: 'Views from the caldera',
      items: [
        {
          art: 'fuji',
          seed: 41,
          caption: 'Fuji over Lake Ashi, January'
        },
        {
          art: 'torii',
          seed: 1,
          caption: 'Hakone Shrine’s torii in the lake'
        },
        {
          art: 'kumo',
          seed: 8,
          caption: 'Steam rising at Ōwakudani'
        },
        {
          art: 'enso',
          seed: 5,
          caption: 'An empty bath at dawn'
        }
      ]
    },
    {
      id: 'p6',
      type: 'stats',
      heading: 'Hakone in figures',
      body: 'Close to Tokyo, far from the hurry.',
      items: [
        {
          value: 85,
          prefix: '',
          suffix: ' min',
          label: 'from Shinjuku by Romancecar'
        },
        {
          value: 3776,
          prefix: '',
          suffix: ' m',
          label: 'Mount Fuji, seen from the lake on clear days'
        },
        {
          value: 7,
          prefix: '+',
          suffix: ' yrs',
          label: 'added to your life by one black egg — so the legend says'
        }
      ]
    },
    {
      id: 'p7',
      type: 'phrases',
      heading: 'At the ryokan',
      items: [
        {
          jp: 'お風呂は何時までですか？',
          romaji: 'Ofuro wa nanji made desu ka?',
          meaning: 'Until what time is the bath open?'
        },
        {
          jp: '貸切風呂はありますか？',
          romaji: 'Kashikiri-buro wa arimasu ka?',
          meaning: 'Is there a private bath?'
        },
        {
          jp: '男湯・女湯',
          romaji: 'Otoko-yu / Onna-yu',
          meaning: 'Men’s bath / women’s bath — check the curtain'
        },
        {
          jp: 'いいお湯でした',
          romaji: 'Ii oyu deshita',
          meaning: 'That was a lovely bath'
        },
        {
          jp: 'ごちそうさまでした',
          romaji: 'Gochisōsama deshita',
          meaning: 'Thank you for the meal'
        }
      ]
    },
    {
      id: 'p8',
      type: 'pricing',
      heading: 'Ryokan stays',
      note: 'Per person, two sharing. Kaiseki dinner, breakfast and a Hakone loop pass included.',
      plans: [
        {
          name: 'One Night',
          price: '¥48,000',
          period: '1 night',
          features: [
            'Garden-view room',
            'Kaiseki dinner',
            'Shared open-air bath'
          ],
          highlight: false
        },
        {
          name: 'Two Nights',
          price: '¥89,000',
          period: '2 nights',
          features: [
            'Room with private bath',
            'Two kaiseki dinners',
            'Lake Ashi cruise',
            'Late check-out'
          ],
          highlight: true
        },
        {
          name: 'Fuji View',
          price: '¥136,000',
          period: '2 nights',
          features: [
            'Suite facing Mount Fuji',
            'Chef’s counter dinner',
            'Private guide day'
          ],
          highlight: false
        }
      ]
    },
    {
      id: 'p9',
      type: 'quote',
      quote: 'Fuji appeared at breakfast, out of nowhere, framed by the window. Our host just smiled and poured more tea.',
      author: 'Jonas W.',
      role: 'Guest, January 2026'
    },
    {
      id: 'p10',
      type: 'contact',
      heading: 'Book a quiet night',
      body: 'Weekdays are calmest. Tell us your dates and whether you would like a private bath, and we will match you with the right ryokan.',
      cta: 'Find my ryokan',
      details: [
        {
          icon: 'Mail',
          label: 'Email',
          value: 'stay@yuge-atelier.example'
        },
        {
          icon: 'Clock',
          label: 'Hours',
          value: 'Daily 09:00–17:00 JST'
        },
        {
          icon: 'MapPin',
          label: 'Office',
          value: 'Yumoto, Hakone'
        }
      ]
    },
    {
      id: 'p11',
      type: 'back',
      title: 'Yukkuri — take it slowly',
      body: 'Yuge Travel Atelier matches travellers with small, family-run ryokan in Hakone.',
      tagline: 'yuge-atelier.example'
    }
  ]
};
