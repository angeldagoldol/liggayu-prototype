/** Tōhoku: Lanterns of Summer — 東北の夏. Shape: see src/data/schema.js. */
export default {
  id: 'b_tohoku-summer-festivals',
  slug: 'tohoku-summer-festivals',
  title: 'Tōhoku: Lanterns of Summer',
  titleJp: '東北の夏',
  titleKana: 'とうほく の なつ',
  subtitle: 'Nebuta, Kantō and Tanabata — the great August festivals of the north',
  category: 'festivals',
  region: 'tohoku',
  seasons: [
    'summer'
  ],
  organization: 'Matsuri Road Travel',
  summary: 'Ride the Tōhoku Shinkansen through the great August festivals: glowing Nebuta floats in Aomori, lantern poles in Akita and giant paper streamers in Sendai.',
  tags: [
    'tohoku',
    'festivals',
    'nebuta',
    'aomori',
    'akita',
    'sendai',
    'tanabata',
    'summer'
  ],
  format: 'booklet',
  updatedAt: '2026-07-01T09:00:00.000Z',
  readMinutes: 5,
  featured: false,
  source: 'builtin',
  theme: {
    paper: '#140f0d',
    ink: '#f6ecdc',
    accent: '#ff7a2b',
    accent2: '#e8405f',
    muted: '#b9a790',
    typeface: 'serif'
  },
  cover: {
    art: 'hinomaru',
    seed: 7
  },
  pages: [
    {
      id: 'p1',
      type: 'cover',
      eyebrow: 'Tōhoku · Early August',
      title: 'Lanterns of Summer',
      titleJp: '東北の夏',
      subtitle: 'Giant glowing floats, poles of paper lanterns and a whole region dancing in the street.'
    },
    {
      id: 'p2',
      type: 'intro',
      kicker: 'Rasserā!',
      heading: 'The north comes alive in August',
      body: 'Winters are long in Tōhoku, so summer is celebrated hard. In the first week of August the region’s great festivals follow one another almost day by day, and the Tōhoku Shinkansen makes it possible to see several in a single trip.\n\nAomori’s Nebuta, Akita’s Kantō and Sendai’s Tanabata are known together as the three great festivals of Tōhoku. Book early, pack a light yukata and expect to be pulled into the dancing.',
      pullQuote: 'Nobody stays a spectator for long.'
    },
    {
      id: 'p3',
      type: 'features',
      kicker: 'The big three — and one more',
      heading: 'Festivals worth the trip',
      items: [
        {
          icon: 'Lamp',
          title: 'Aomori Nebuta',
          text: 'Huge illuminated floats of warriors and gods, with haneto dancers chanting “Rasserā!”. 2–7 August.'
        },
        {
          icon: 'Flame',
          title: 'Akita Kantō',
          text: 'Bamboo poles hung with dozens of lanterns, balanced on palms, shoulders and foreheads. 3–6 August.'
        },
        {
          icon: 'Wind',
          title: 'Sendai Tanabata',
          text: 'Shopping arcades hung with enormous paper streamers that sway over the crowds. 6–8 August.'
        },
        {
          icon: 'Flower2',
          title: 'Yamagata Hanagasa',
          text: 'Dancers in flower-decked straw hats parade to drums and the “Yassho, makasho” call. 5–7 August.'
        }
      ]
    },
    {
      id: 'p4',
      type: 'gallery',
      heading: 'Light in the dark',
      items: [
        {
          art: 'hinomaru',
          seed: 19,
          caption: 'A Nebuta float, lit from within'
        },
        {
          art: 'shippo',
          seed: 14,
          caption: 'Kantō lanterns against the night'
        },
        {
          art: 'kumo',
          seed: 3,
          caption: 'Smoke drifting after the fireworks'
        },
        {
          art: 'asanoha',
          seed: 27,
          caption: 'Tanabata streamers in Sendai'
        }
      ]
    },
    {
      id: 'p5',
      type: 'agenda',
      heading: 'Festival week by shinkansen',
      items: [
        {
          time: '2 Aug',
          title: 'Aomori',
          text: 'Nebuta night parade — rent a haneto costume and join in.'
        },
        {
          time: '4 Aug',
          title: 'Akita',
          text: 'Kantō poles rise over Kantō Ōdōri after dark.'
        },
        {
          time: '6 Aug',
          title: 'Yamagata',
          text: 'Hanagasa dancers fill the main street.'
        },
        {
          time: '7 Aug',
          title: 'Sendai',
          text: 'Tanabata streamers by day, grilled beef tongue by night.'
        }
      ]
    },
    {
      id: 'p6',
      type: 'stats',
      heading: 'The festivals in figures',
      body: 'Big numbers, bright lights.',
      items: [
        {
          value: 3,
          prefix: '',
          suffix: '',
          label: 'great festivals of Tōhoku'
        },
        {
          value: 46,
          prefix: '',
          suffix: '',
          label: 'lanterns on the largest Kantō poles'
        },
        {
          value: 6,
          prefix: '',
          suffix: '',
          label: 'days of Nebuta in Aomori'
        }
      ]
    },
    {
      id: 'p7',
      type: 'phrases',
      heading: 'Festival Japanese',
      items: [
        {
          jp: 'ラッセラー！',
          romaji: 'Rasserā!',
          meaning: 'The Nebuta dancers’ chant'
        },
        {
          jp: '浴衣',
          romaji: 'Yukata',
          meaning: 'Light cotton summer kimono'
        },
        {
          jp: '屋台',
          romaji: 'Yatai',
          meaning: 'Festival food stall'
        },
        {
          jp: '花火',
          romaji: 'Hanabi',
          meaning: 'Fireworks'
        },
        {
          jp: 'どこで見られますか？',
          romaji: 'Doko de miraremasu ka?',
          meaning: 'Where can we watch?'
        },
        {
          jp: '一緒に踊ってもいいですか？',
          romaji: 'Issho ni odotte mo ii desu ka?',
          meaning: 'Can I join in the dancing?'
        }
      ]
    },
    {
      id: 'p8',
      type: 'pricing',
      heading: 'Festival passes',
      note: 'Per person, sharing. Shinkansen, reserved viewing seats and hotels included. Book by March.',
      plans: [
        {
          name: 'Nebuta Nights',
          price: '¥118,000',
          period: '3 nights',
          features: [
            'Aomori hotel',
            'Reserved parade seats',
            'A haneto costume to keep'
          ],
          highlight: false
        },
        {
          name: 'Grand Tour',
          price: '¥236,000',
          period: '6 nights',
          features: [
            'Nebuta, Kantō, Hanagasa & Tanabata',
            'Green Car shinkansen seats',
            'Reserved seats every night',
            'A festival-food supper in each city'
          ],
          highlight: true
        }
      ]
    },
    {
      id: 'p9',
      type: 'quote',
      quote: 'I rented the haneto costume on a whim and jumped for two hours with a thousand strangers. My calves still remember Aomori.',
      author: 'Tomás R.',
      role: 'Guest, August 2025'
    },
    {
      id: 'p10',
      type: 'contact',
      heading: 'Join the festival',
      body: 'Festival-week hotels fill up to a year ahead. Register now and we will hold rooms in every city on your route.',
      cta: 'Hold my rooms',
      details: [
        {
          icon: 'Mail',
          label: 'Email',
          value: 'matsuri@matsuri-road.example'
        },
        {
          icon: 'Calendar',
          label: 'Festivals',
          value: '2–8 August'
        },
        {
          icon: 'MapPin',
          label: 'Office',
          value: 'Shin-Aomori Station'
        }
      ]
    },
    {
      id: 'p11',
      type: 'back',
      title: 'Mata rainen — see you next year',
      body: 'Matsuri Road Travel builds festival journeys across northern Japan.',
      tagline: 'matsuri-road.example'
    }
  ]
};
