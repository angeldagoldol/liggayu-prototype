/** The Japan Alps — 日本アルプス. Shape: see src/data/schema.js. */
export default {
  id: 'b_japan-alps',
  slug: 'japan-alps',
  title: 'The Japan Alps',
  titleJp: '日本アルプス',
  titleKana: 'にほん あるぷす',
  subtitle: 'Takayama’s old town, the thatched farmhouses of Shirakawa-gō and the alpine valley of Kamikochi',
  category: 'nature',
  region: 'chubu',
  seasons: [
    'spring',
    'summer',
    'autumn'
  ],
  organization: 'Hida Trail Company',
  summary: 'Mountain Japan: walk Takayama’s merchant streets, sleep under the thatch of a Shirakawa-gō farmhouse and follow the clear rivers of Kamikochi beneath the Hotaka peaks.',
  tags: [
    'japan alps',
    'takayama',
    'shirakawa-go',
    'kamikochi',
    'hiking',
    'nakasendo',
    'sake'
  ],
  format: 'booklet',
  updatedAt: '2026-04-22T05:00:00.000Z',
  readMinutes: 6,
  featured: false,
  source: 'builtin',
  theme: {
    paper: '#13201c',
    ink: '#eef0e6',
    accent: '#f0a3b5',
    accent2: '#8fc4a8',
    muted: '#a5b3a8',
    typeface: 'serif'
  },
  cover: {
    art: 'sakura',
    seed: 23
  },
  pages: [
    {
      id: 'p1',
      type: 'cover',
      eyebrow: 'Chūbu · Spring to autumn',
      title: 'The Japan Alps',
      titleJp: '日本アルプス',
      subtitle: 'Merchant streets, thatched villages and mountain rivers so clear they look like glass.'
    },
    {
      id: 'p2',
      type: 'intro',
      kicker: 'Into the mountains',
      heading: 'The roof of Japan',
      body: 'Three ranges run down the middle of Honshū — the Hida, Kiso and Akaishi mountains. The English engineer William Gowland named them the Japan Alps, and the missionary-mountaineer Walter Weston made them famous.\n\nAt their feet lie some of Japan’s best-preserved towns: Takayama with its sake breweries and morning markets, and Shirakawa-gō, whose farmhouse roofs rise like hands joined in prayer. Come in April for blossom and the spring festival, in summer for the high trails, or in October for the maples.',
      pullQuote: 'Cold rivers, warm sake, slow mornings.'
    },
    {
      id: 'p3',
      type: 'features',
      kicker: 'Highlights',
      heading: 'Four ways into the mountains',
      items: [
        {
          icon: 'Store',
          title: 'Takayama',
          text: 'Dark-timbered merchant houses, sake breweries marked by cedar balls and a morning market by the river.'
        },
        {
          icon: 'House',
          title: 'Shirakawa-gō',
          text: 'Steep thatched gasshō farmhouses in a village on the UNESCO World Heritage List since 1995.'
        },
        {
          icon: 'Mountain',
          title: 'Kamikochi',
          text: 'An alpine valley at about 1,500 m, closed to private cars and open from late April to mid-November.'
        },
        {
          icon: 'Footprints',
          title: 'The Nakasendō',
          text: 'Walk the old post road from Magome to Tsumago — about 8 km of stone paths and cedar forest.'
        }
      ]
    },
    {
      id: 'p4',
      type: 'gallery',
      heading: 'Seasons on the mountain',
      items: [
        {
          art: 'sakura',
          seed: 4,
          caption: 'Blossom on the Miyagawa, April'
        },
        {
          art: 'kumo',
          seed: 2,
          caption: 'A sea of clouds below the Hotaka peaks'
        },
        {
          art: 'asanoha',
          seed: 3,
          caption: 'Kumiko lattice in a Takayama inn'
        },
        {
          art: 'shippo',
          seed: 18,
          caption: 'Lacquer and brass on a festival float'
        }
      ]
    },
    {
      id: 'p5',
      type: 'agenda',
      heading: 'Five days in the mountains',
      items: [
        {
          time: 'Day 1',
          title: 'Takayama',
          text: 'Old town, sake tasting and a Hida beef supper.'
        },
        {
          time: 'Day 2',
          title: 'Shirakawa-gō',
          text: 'Takayama’s morning market, then a night in a gasshō farmhouse.'
        },
        {
          time: 'Day 3',
          title: 'Kamikochi',
          text: 'Walk from Taishō Pond to Kappa Bridge and on to Myōjin.'
        },
        {
          time: 'Day 4',
          title: 'Nakasendō',
          text: 'Magome to Tsumago on foot; dinner at a post-town inn.'
        },
        {
          time: 'Day 5',
          title: 'Nagoya',
          text: 'Limited express down the valley, with a last look at the peaks.'
        }
      ]
    },
    {
      id: 'p6',
      type: 'stats',
      heading: 'The Alps in figures',
      body: 'Thin air, deep snow, old wood.',
      items: [
        {
          value: 3190,
          prefix: '',
          suffix: ' m',
          label: 'Okuhotaka-dake, joint third-highest in Japan'
        },
        {
          value: 1500,
          prefix: '~',
          suffix: ' m',
          label: 'altitude of the Kamikochi valley'
        },
        {
          value: 8,
          prefix: '~',
          suffix: ' km',
          label: 'on the Nakasendō from Magome to Tsumago'
        }
      ]
    },
    {
      id: 'p7',
      type: 'phrases',
      heading: 'Mountain Japanese',
      items: [
        {
          jp: 'こんにちは',
          romaji: 'Konnichiwa',
          meaning: 'Hello — greet everyone on the trail'
        },
        {
          jp: '熊鈴',
          romaji: 'Kuma-suzu',
          meaning: 'Bear bell — hang one on your pack'
        },
        {
          jp: '道に迷いました',
          romaji: 'Michi ni mayoimashita',
          meaning: 'I’m lost'
        },
        {
          jp: '雨が降りそうですね',
          romaji: 'Ame ga furisō desu ne',
          meaning: 'Looks like rain'
        },
        {
          jp: '乾杯！',
          romaji: 'Kanpai!',
          meaning: 'Cheers — with local sake'
        }
      ]
    },
    {
      id: 'p8',
      type: 'pricing',
      heading: 'Mountain journeys',
      note: 'Per person, sharing. Rail and bus passes, luggage forwarding and breakfasts included.',
      plans: [
        {
          name: 'Old Towns',
          price: '¥142,000',
          period: '4 nights',
          features: [
            'Takayama ryokan',
            'A night in a gasshō farmhouse',
            'Sake brewery visit'
          ],
          highlight: false
        },
        {
          name: 'High Alps',
          price: '¥228,000',
          period: '6 nights',
          features: [
            'Everything in Old Towns',
            'Two nights in Kamikochi',
            'Guided Nakasendō walk',
            'Luggage sent ahead each day'
          ],
          highlight: true
        }
      ]
    },
    {
      id: 'p9',
      type: 'quote',
      quote: 'We woke in Kamikochi to mist lifting off the river and a troop of monkeys crossing the bridge. I have never seen water so clear.',
      author: 'Elise M.',
      role: 'Traveller, October 2025'
    },
    {
      id: 'p10',
      type: 'contact',
      heading: 'Plan your mountain days',
      body: 'Kamikochi opens in late April and closes in mid-November. Tell us your season and pace, and we will plan the trails and the trains.',
      cta: 'Plan my route',
      details: [
        {
          icon: 'Mail',
          label: 'Email',
          value: 'trails@hida-trail.example'
        },
        {
          icon: 'Clock',
          label: 'Hours',
          value: 'Daily 08:00–17:00 JST'
        },
        {
          icon: 'MapPin',
          label: 'Office',
          value: 'Sanmachi, Takayama'
        }
      ]
    },
    {
      id: 'p11',
      type: 'back',
      title: 'Yama de aimashō — see you in the mountains',
      body: 'Hida Trail Company plans walking journeys through the Japan Alps.',
      tagline: 'hida-trail.example'
    }
  ]
};
