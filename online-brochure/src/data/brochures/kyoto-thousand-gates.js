/** Kyoto: A Thousand Gates — 京都. Shape: see src/data/schema.js. */
export default {
  id: 'b_kyoto-thousand-gates',
  slug: 'kyoto-thousand-gates',
  title: 'Kyoto: A Thousand Gates',
  titleJp: '京都',
  titleKana: 'きょうと',
  subtitle: 'Temples, tea houses and vermilion torii in Japan’s old capital',
  category: 'heritage',
  region: 'kansai',
  seasons: [
    'spring',
    'autumn'
  ],
  organization: 'Kōen Travel Studio',
  summary: 'A slow guide to Kyoto: walk through ten thousand torii at Fushimi Inari, sip matcha in Gion and catch the bamboo grove before the crowds.',
  tags: [
    'kyoto',
    'temples',
    'torii',
    'tea ceremony',
    'geisha district',
    'bamboo'
  ],
  format: 'booklet',
  updatedAt: '2026-09-18T09:00:00.000Z',
  readMinutes: 5,
  featured: true,
  source: 'builtin',
  theme: {
    paper: '#f4eee2',
    ink: '#22140f',
    accent: '#d23a22',
    accent2: '#1d4f7a',
    muted: '#6e5b4f',
    typeface: 'serif'
  },
  cover: {
    art: 'torii',
    seed: 5
  },
  pages: [
    {
      id: 'p1',
      type: 'cover',
      eyebrow: 'Kansai · Spring & autumn edition',
      title: 'A Thousand Gates',
      titleJp: '京都',
      subtitle: 'Temples, tea houses and vermilion torii in the city that was Japan’s capital for over a thousand years.'
    },
    {
      id: 'p2',
      type: 'intro',
      kicker: 'Welcome to Kyoto',
      heading: 'A city that rewards the early riser',
      body: 'Kyoto was Japan’s imperial capital from 794 until 1868. It kept its temples, its wooden machiya town houses and its unhurried rituals — and it shows them best before eight in the morning.\n\nThis brochure follows one rule: go early, go slowly, and leave room for the side street you did not plan to walk down.',
      pullQuote: 'Go early. Go slowly. Take the side street.'
    },
    {
      id: 'p3',
      type: 'features',
      kicker: 'Must-sees',
      heading: 'Four places that define Kyoto',
      items: [
        {
          icon: 'Landmark',
          title: 'Fushimi Inari Taisha',
          text: 'Thousands of vermilion torii climb Mount Inari. Start at sunrise and keep walking past the first crowds.'
        },
        {
          icon: 'TreeDeciduous',
          title: 'Arashiyama bamboo',
          text: 'A towering grove on the city’s western edge. Pair it with a river walk and Tenryū-ji’s garden.'
        },
        {
          icon: 'Castle',
          title: 'Kiyomizu-dera',
          text: 'A wooden stage on the hillside, built without a single nail, above a sea of maple and cherry.'
        },
        {
          icon: 'Lamp',
          title: 'Gion at dusk',
          text: 'Lantern-lit lanes of tea houses. Let maiko pass, never photograph them without asking, and keep out of private lanes.'
        }
      ]
    },
    {
      id: 'p4',
      type: 'gallery',
      heading: 'Kyoto in four moods',
      items: [
        {
          art: 'torii',
          seed: 3,
          caption: 'Senbon torii, 6:40 a.m.'
        },
        {
          art: 'sakura',
          seed: 8,
          caption: 'The Philosopher’s Path in early April'
        },
        {
          art: 'enso',
          seed: 19,
          caption: 'Raked gravel at Ryōan-ji'
        },
        {
          art: 'asanoha',
          seed: 44,
          caption: 'Indigo noren in Gion'
        }
      ]
    },
    {
      id: 'p5',
      type: 'agenda',
      heading: 'One perfect day',
      items: [
        {
          time: '06:30',
          title: 'Fushimi Inari',
          text: 'Climb the torii tunnels in near silence.'
        },
        {
          time: '10:00',
          title: 'Nishiki Market',
          text: 'Pickles, tamagoyaki and matcha everything.'
        },
        {
          time: '13:00',
          title: 'Higashiyama walk',
          text: 'Stone lanes from Kiyomizu-dera to Yasaka Shrine.'
        },
        {
          time: '16:00',
          title: 'Tea ceremony',
          text: 'A 45-minute sadō lesson in a 100-year-old machiya.'
        },
        {
          time: '19:00',
          title: 'Kaiseki in Pontochō',
          text: 'Seasonal courses above the Kamo River.'
        }
      ]
    },
    {
      id: 'p6',
      type: 'stats',
      heading: 'Kyoto by the numbers',
      body: 'A modern city with a very long memory.',
      items: [
        {
          value: 1074,
          prefix: '',
          suffix: '',
          label: 'years as Japan’s capital'
        },
        {
          value: 1600,
          prefix: '~',
          suffix: '',
          label: 'Buddhist temples'
        },
        {
          value: 17,
          prefix: '',
          suffix: '',
          label: 'monuments in the Ancient Kyoto UNESCO listing'
        }
      ]
    },
    {
      id: 'p7',
      type: 'phrases',
      heading: 'Temple-town Japanese',
      items: [
        {
          jp: 'おはようございます',
          romaji: 'Ohayō gozaimasu',
          meaning: 'Good morning'
        },
        {
          jp: '写真を撮ってもいいですか？',
          romaji: 'Shashin o totte mo ii desu ka?',
          meaning: 'May I take a photo?'
        },
        {
          jp: 'いただきます',
          romaji: 'Itadakimasu',
          meaning: 'Said before eating — “I gratefully receive”'
        },
        {
          jp: 'ごちそうさまでした',
          romaji: 'Gochisōsama deshita',
          meaning: 'Thank you for the meal'
        },
        {
          jp: '駅はどこですか？',
          romaji: 'Eki wa doko desu ka?',
          meaning: 'Where is the station?'
        }
      ]
    },
    {
      id: 'p8',
      type: 'pricing',
      heading: 'Guided Kyoto journeys',
      note: 'Per person, sharing. Includes machiya stay, breakfasts, guide and tea ceremony.',
      plans: [
        {
          name: 'Three Gates',
          price: '¥148,000',
          period: '3 nights',
          features: [
            'Machiya town-house stay',
            'Dawn Fushimi Inari walk',
            'Tea ceremony'
          ],
          highlight: false
        },
        {
          name: 'Old Capital',
          price: '¥268,000',
          period: '5 nights',
          features: [
            'Everything in Three Gates',
            'Kaiseki dinner in Pontochō',
            'Day trip to Nara’s deer park',
            'Private garden visit'
          ],
          highlight: true
        }
      ]
    },
    {
      id: 'p9',
      type: 'quote',
      quote: 'We walked the torii at sunrise and did not see another soul for twenty minutes. Our guide knew exactly when every place would be quiet.',
      author: 'Hannah & Theo',
      role: 'Travellers, November 2025'
    },
    {
      id: 'p10',
      type: 'contact',
      heading: 'Plan your Kyoto',
      body: 'Cherry blossom and autumn leaf weeks fill early. Tell us your dates and we will hold a machiya for 72 hours, free.',
      cta: 'Request an itinerary',
      details: [
        {
          icon: 'Mail',
          label: 'Email',
          value: 'kyoto@koen-travel.example'
        },
        {
          icon: 'Clock',
          label: 'Hours',
          value: 'Daily 09:00–18:00 JST'
        },
        {
          icon: 'MapPin',
          label: 'Studio',
          value: 'Sanjō-dōri, Nakagyō-ku, Kyoto'
        }
      ]
    },
    {
      id: 'p11',
      type: 'back',
      title: 'Mata kite ne — come again',
      body: 'Kōen Travel Studio designs small-group and private journeys through Kansai.',
      tagline: 'koen-travel.example'
    }
  ]
};
