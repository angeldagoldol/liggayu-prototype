/** Hokkaidō: Powder & Ice — 北海道. Shape: see src/data/schema.js. */
export default {
  id: 'b_hokkaido-powder-snow',
  slug: 'hokkaido-powder-snow',
  title: 'Hokkaidō: Powder & Ice',
  titleJp: '北海道',
  titleKana: 'ほっかいどう',
  subtitle: 'Dry powder, ice lanterns and the Sapporo Snow Festival on Japan’s northern island',
  category: 'nature',
  region: 'hokkaido',
  seasons: [
    'winter'
  ],
  organization: 'Shirokuma Winter Co.',
  summary: 'A winter guide to Hokkaidō: famously light powder snow, the giant sculptures of the Sapporo Snow Festival, drift ice on the Sea of Okhotsk and miso ramen to thaw out.',
  tags: [
    'hokkaido',
    'sapporo',
    'snow festival',
    'skiing',
    'powder snow',
    'drift ice',
    'ramen'
  ],
  format: 'booklet',
  updatedAt: '2026-08-28T08:00:00.000Z',
  readMinutes: 5,
  featured: true,
  source: 'builtin',
  theme: {
    paper: '#0f1a2a',
    ink: '#eef2f6',
    accent: '#7cc7f2',
    accent2: '#e8574a',
    muted: '#9fb1c4',
    typeface: 'serif'
  },
  cover: {
    art: 'asanoha',
    seed: 61
  },
  pages: [
    {
      id: 'p1',
      type: 'cover',
      eyebrow: 'Hokkaidō · Winter edition',
      title: 'Powder & Ice',
      titleJp: '北海道',
      subtitle: 'Light, dry snow, a city of ice sculptures and hot springs steaming under the stars.'
    },
    {
      id: 'p2',
      type: 'intro',
      kicker: 'Welcome north',
      heading: 'Where winter is the main event',
      body: 'Hokkaidō is Japan’s northernmost main island and covers about a fifth of the country’s land. Cold air from Siberia picks up moisture over the Sea of Japan and drops it as snow so light and dry that skiers cross the world for it.\n\nIn the cities, winter is a festival. Sapporo fills its central park with sculptures of snow and ice, Otaru lines its old canal with candles, and a steaming bowl of miso ramen is never far away.',
      pullQuote: 'Snow so dry it squeaks under your boots.'
    },
    {
      id: 'p3',
      type: 'features',
      kicker: 'Winter highlights',
      heading: 'Five reasons to come in February',
      items: [
        {
          icon: 'Snowflake',
          title: 'Sapporo Snow Festival',
          text: 'For a week each February, Ōdōri Park fills with giant snow sculptures and Susukino glitters with carved ice.'
        },
        {
          icon: 'MountainSnow',
          title: 'Niseko powder',
          text: 'Deep, dry snow on Niseko Annupuri, with the perfect cone of Mount Yōtei across the valley.'
        },
        {
          icon: 'Ship',
          title: 'Drift ice',
          text: 'From late January, sea ice from the Sea of Okhotsk reaches the Abashiri coast. Watch it from an icebreaker.'
        },
        {
          icon: 'Lamp',
          title: 'Otaru Snow Light Path',
          text: 'Snow lanterns and candles light the canal and its stone warehouses for a week in February.'
        },
        {
          icon: 'Bird',
          title: 'Red-crowned cranes',
          text: 'In eastern Hokkaidō, cranes dance in the snowfields near Kushiro — one of winter’s great sights.'
        }
      ]
    },
    {
      id: 'p4',
      type: 'gallery',
      heading: 'Winter, in four colours',
      items: [
        {
          art: 'asanoha',
          seed: 12,
          caption: 'Frost on a Sapporo window'
        },
        {
          art: 'fuji',
          seed: 9,
          caption: 'Mount Yōtei, the “Fuji of Ezo”'
        },
        {
          art: 'kumo',
          seed: 31,
          caption: 'Steam over an open-air bath'
        },
        {
          art: 'shippo',
          seed: 4,
          caption: 'Ice lanterns in Otaru'
        }
      ]
    },
    {
      id: 'p5',
      type: 'stats',
      heading: 'Hokkaidō by the numbers',
      body: 'Big, wild and very snowy — Japan at its most spacious.',
      items: [
        {
          value: 22,
          prefix: '',
          suffix: '%',
          label: 'of Japan’s land area'
        },
        {
          value: 5,
          prefix: '~',
          suffix: ' m',
          label: 'of snow falls on Sapporo in an average winter'
        },
        {
          value: 2,
          prefix: '',
          suffix: 'M+',
          label: 'visitors to the Snow Festival in a typical year'
        }
      ]
    },
    {
      id: 'p6',
      type: 'agenda',
      heading: 'Four winter days',
      items: [
        {
          time: 'Day 1',
          title: 'Sapporo',
          text: 'Snow sculptures by day, Susukino’s ice by night, miso ramen at a counter.'
        },
        {
          time: 'Day 2',
          title: 'Otaru',
          text: 'Canal walk, glass workshops and the Snow Light Path after dark.'
        },
        {
          time: 'Day 3',
          title: 'Niseko',
          text: 'First chair in fresh powder, then an onsen facing Mount Yōtei.'
        },
        {
          time: 'Day 4',
          title: 'Asahikawa',
          text: 'Penguins on their winter walk at Asahiyama Zoo.'
        }
      ]
    },
    {
      id: 'p7',
      type: 'phrases',
      heading: 'Cold-weather Japanese',
      items: [
        {
          jp: '寒いですね',
          romaji: 'Samui desu ne',
          meaning: 'Cold, isn’t it?'
        },
        {
          jp: 'リフト券を一枚ください',
          romaji: 'Rifuto-ken o ichi-mai kudasai',
          meaning: 'One lift ticket, please'
        },
        {
          jp: '温かい飲み物はありますか？',
          romaji: 'Atatakai nomimono wa arimasu ka?',
          meaning: 'Do you have hot drinks?'
        },
        {
          jp: 'なまら美味しい！',
          romaji: 'Namara oishii!',
          meaning: 'Really delicious! — Hokkaidō dialect'
        },
        {
          jp: '滑りやすいので気をつけて',
          romaji: 'Suberiyasui node ki o tsukete',
          meaning: 'Careful, it’s slippery'
        }
      ]
    },
    {
      id: 'p8',
      type: 'pricing',
      heading: 'Winter journeys',
      note: 'Per person, sharing. Rail between cities, breakfasts and an English-speaking guide included.',
      plans: [
        {
          name: 'Snow Festival',
          price: '¥168,000',
          period: '4 nights',
          features: [
            'Sapporo & Otaru hotels',
            'Festival night walk',
            'Ramen alley supper'
          ],
          highlight: false
        },
        {
          name: 'Powder Week',
          price: '¥298,000',
          period: '7 nights',
          features: [
            'Everything in Snow Festival',
            'Three-day Niseko lift pass',
            'A night in an onsen ryokan',
            'Avalanche-trained ski guide'
          ],
          highlight: true
        }
      ]
    },
    {
      id: 'p9',
      type: 'quote',
      quote: 'We came for the snow festival and stayed for the powder. Our guide had us on the first chair every morning and in a hot spring every night.',
      author: 'Ines & Sam',
      role: 'Travellers, February 2026'
    },
    {
      id: 'p10',
      type: 'contact',
      heading: 'Plan your winter',
      body: 'February books out by autumn. Send us your dates and ski level and we will build a route around the best snow.',
      cta: 'Plan my winter trip',
      details: [
        {
          icon: 'Mail',
          label: 'Email',
          value: 'snow@shirokuma-winter.example'
        },
        {
          icon: 'Calendar',
          label: 'Season',
          value: 'December to March'
        },
        {
          icon: 'MapPin',
          label: 'Office',
          value: 'Kita-ku, Sapporo'
        }
      ]
    },
    {
      id: 'p11',
      type: 'back',
      title: 'Mata ne — see you next winter',
      body: 'Shirokuma Winter Co. runs small-group snow journeys across Hokkaidō.',
      tagline: 'shirokuma-winter.example'
    }
  ]
};
