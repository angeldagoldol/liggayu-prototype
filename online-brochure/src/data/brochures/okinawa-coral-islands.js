/** Okinawa: Islands of Coral — 沖縄. Shape: see src/data/schema.js. */
export default {
  id: 'b_okinawa-coral-islands',
  slug: 'okinawa-coral-islands',
  title: 'Okinawa: Islands of Coral',
  titleJp: '沖縄',
  titleKana: 'おきなわ',
  subtitle: 'Island-hopping, coral seas and the culture of the old Ryūkyū Kingdom',
  category: 'islands',
  region: 'kyushu',
  seasons: [
    'spring',
    'summer'
  ],
  organization: 'Nirai Island Co.',
  summary: 'Hop between Okinawa’s subtropical islands: snorkel in the clear Kerama blue, walk the castle sites of the Ryūkyū Kingdom and slow down to island time.',
  tags: [
    'okinawa',
    'islands',
    'snorkelling',
    'beaches',
    'ryukyu',
    'kerama',
    'ishigaki'
  ],
  format: 'trifold',
  updatedAt: '2026-07-14T07:00:00.000Z',
  readMinutes: 5,
  featured: true,
  source: 'builtin',
  theme: {
    paper: '#f2efe6',
    ink: '#0f2a33',
    accent: '#0b7f8a',
    accent2: '#f0684b',
    muted: '#4c6870',
    typeface: 'sans'
  },
  cover: {
    art: 'seigaiha',
    seed: 3
  },
  pages: [
    {
      id: 'p1',
      type: 'cover',
      eyebrow: 'Kyūshū & Okinawa · Spring & summer edition',
      title: 'Islands of Coral',
      titleJp: '沖縄',
      subtitle: 'Turquoise water, coral reefs and a kingdom’s worth of history, less than three hours’ flight from Tokyo.'
    },
    {
      id: 'p2',
      type: 'intro',
      kicker: 'Mensōre — welcome',
      heading: 'Japan, on island time',
      body: 'Okinawa Prefecture is a chain of around 160 islands strung between Kyūshū and Taiwan. For more than four centuries it was the Ryūkyū Kingdom, trading with China, Korea and Southeast Asia, and its food, music and architecture still feel distinct from mainland Japan.\n\nCome for the water — some of the clearest in Asia — and stay for the slower rhythm: a sanshin playing somewhere, a shīsā guarding every roof, and nobody in a hurry.',
      pullQuote: 'Nankurunaisa — it will all work out.'
    },
    {
      id: 'p3',
      type: 'features',
      kicker: 'Island highlights',
      heading: 'Where to go',
      items: [
        {
          icon: 'Fish',
          title: 'Kerama Islands',
          text: 'A national park of clear “Kerama blue” water and sea turtles, about an hour from Naha by fast ferry.'
        },
        {
          icon: 'Landmark',
          title: 'Shuri Castle Park',
          text: 'Seat of the Ryūkyū kings, its main hall rebuilt after the 2019 fire; part of a UNESCO listing of gusuku sites.'
        },
        {
          icon: 'Sun',
          title: 'Ishigaki & Taketomi',
          text: 'Red-tiled roofs, coral-stone walls and water-buffalo carts on a tiny island across the bay.'
        },
        {
          icon: 'TreePine',
          title: 'Iriomote',
          text: 'Mangrove rivers and jungle over most of the island — best explored by kayak.'
        }
      ]
    },
    {
      id: 'p4',
      type: 'gallery',
      heading: 'Shades of blue',
      items: [
        {
          art: 'seigaiha',
          seed: 4,
          caption: 'Low tide off Zamami'
        },
        {
          art: 'hinomaru',
          seed: 23,
          caption: 'Sunset from Cape Manzamo'
        },
        {
          art: 'shippo',
          seed: 9,
          caption: 'Coral-stone walls on Taketomi'
        }
      ]
    },
    {
      id: 'p5',
      type: 'agenda',
      heading: 'An island-hopping week',
      items: [
        {
          time: 'Day 1',
          title: 'Naha',
          text: 'Kokusai-dōri, the Makishi market and Shuri at dusk.'
        },
        {
          time: 'Days 2–3',
          title: 'Zamami',
          text: 'Fast ferry to the Keramas; two days of snorkelling with turtles.'
        },
        {
          time: 'Day 4',
          title: 'Ishigaki',
          text: 'Fly south to the Yaeyama Islands.'
        },
        {
          time: 'Day 5',
          title: 'Taketomi',
          text: 'Cycle sandy lanes and look for star sand.'
        },
        {
          time: 'Day 6',
          title: 'Iriomote',
          text: 'Kayak through the mangroves to a jungle waterfall.'
        }
      ]
    },
    {
      id: 'p6',
      type: 'stats',
      heading: 'Okinawa by the numbers',
      body: 'Subtropical, sociable and famously long-lived.',
      items: [
        {
          value: 160,
          prefix: '~',
          suffix: '',
          label: 'islands in the prefecture'
        },
        {
          value: 450,
          prefix: '',
          suffix: '',
          label: 'years of the Ryūkyū Kingdom, 1429–1879'
        },
        {
          value: 23,
          prefix: '',
          suffix: '°C',
          label: 'average yearly temperature in Naha'
        }
      ]
    },
    {
      id: 'p7',
      type: 'phrases',
      heading: 'Island words',
      items: [
        {
          jp: 'めんそーれ',
          romaji: 'Mensōre',
          meaning: 'Welcome — in Okinawan'
        },
        {
          jp: 'はいさい',
          romaji: 'Haisai',
          meaning: 'Hello — in Okinawan'
        },
        {
          jp: 'にふぇーでーびる',
          romaji: 'Nifēdēbiru',
          meaning: 'Thank you — in Okinawan'
        },
        {
          jp: 'なんくるないさ',
          romaji: 'Nankurunaisa',
          meaning: 'It will all work out'
        },
        {
          jp: 'ここで泳いでもいいですか？',
          romaji: 'Koko de oyoide mo ii desu ka?',
          meaning: 'Is it OK to swim here?'
        }
      ]
    },
    {
      id: 'p8',
      type: 'pricing',
      heading: 'Island journeys',
      note: 'Per person, sharing. Ferries, the inter-island flight and snorkel gear included.',
      plans: [
        {
          name: 'Kerama Blue',
          price: '¥128,000',
          period: '4 nights',
          features: [
            'Naha & Zamami stays',
            'Guided snorkel',
            'Shuri Castle visit'
          ],
          highlight: false
        },
        {
          name: 'Southern Islands',
          price: '¥246,000',
          period: '7 nights',
          features: [
            'Everything in Kerama Blue',
            'Ishigaki, Taketomi & Iriomote',
            'Mangrove kayak day',
            'Ryūkyū dinner with sanshin music'
          ],
          highlight: true
        }
      ]
    },
    {
      id: 'p9',
      type: 'quote',
      quote: 'Two turtles, one sunset and a grandmother on Taketomi who taught us to say thank you in Okinawan. The best week of our year.',
      author: 'Lena K.',
      role: 'Guest, June 2026'
    },
    {
      id: 'p10',
      type: 'contact',
      heading: 'Find your island',
      body: 'Late summer can bring typhoons, so we build in a spare day and rebook ferries for you if the sea says no.',
      cta: 'Plan an island hop',
      details: [
        {
          icon: 'Mail',
          label: 'Email',
          value: 'hello@nirai-island.example'
        },
        {
          icon: 'Clock',
          label: 'Hours',
          value: 'Daily 10:00–19:00 JST'
        },
        {
          icon: 'MapPin',
          label: 'Office',
          value: 'Kumoji, Naha'
        }
      ]
    },
    {
      id: 'p11',
      type: 'back',
      title: 'Nifēdēbiru — thank you',
      body: 'Nirai Island Co. plans unhurried island-hopping journeys across Okinawa.',
      tagline: 'nirai-island.example'
    }
  ]
};
