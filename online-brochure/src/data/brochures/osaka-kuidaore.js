/** Osaka: Eat Until You Drop — 大阪. Shape: see src/data/schema.js. */
export default {
  id: 'b_osaka-kuidaore',
  slug: 'osaka-kuidaore',
  title: 'Osaka: Eat Until You Drop',
  titleJp: '大阪',
  titleKana: 'おおさか',
  subtitle: 'Takoyaki, okonomiyaki and the neon canal of Dōtonbori',
  category: 'food',
  region: 'kansai',
  seasons: [
    'spring',
    'summer',
    'autumn',
    'winter'
  ],
  organization: 'Teppan Tours Osaka',
  summary: 'Osaka’s motto is kuidaore — eat until you drop. A street-food guide to takoyaki, okonomiyaki, kushikatsu and the neon canal of Dōtonbori.',
  tags: [
    'osaka',
    'street food',
    'takoyaki',
    'okonomiyaki',
    'dotonbori',
    'kushikatsu',
    'markets'
  ],
  format: 'bifold',
  updatedAt: '2026-09-05T12:00:00.000Z',
  readMinutes: 4,
  featured: true,
  source: 'builtin',
  theme: {
    paper: '#fbefd9',
    ink: '#22160f',
    accent: '#c93a22',
    accent2: '#e9a21a',
    muted: '#6b5442',
    typeface: 'sans'
  },
  cover: {
    art: 'shippo',
    seed: 23
  },
  pages: [
    {
      id: 'p1',
      type: 'cover',
      eyebrow: 'Kansai · Open late',
      title: 'Eat Until You Drop',
      titleJp: '大阪',
      subtitle: 'Takoyaki, okonomiyaki and kushikatsu under the neon of Dōtonbori — a guide to the nation’s kitchen.'
    },
    {
      id: 'p2',
      type: 'intro',
      kicker: 'Kuidaore',
      heading: 'The nation’s kitchen',
      body: 'In the Edo period Osaka was called tenka no daidokoro — the nation’s kitchen — because rice and goods from all over Japan passed through its merchant warehouses. The merchants ate well, and the city never stopped.\n\nAn old saying goes that Kyoto ruins itself on clothes and Osaka on food. Come hungry, eat standing up, and say ōkini when you leave.',
      pullQuote: 'Kyoto dresses until it drops. Osaka eats until it drops.'
    },
    {
      id: 'p3',
      type: 'features',
      kicker: 'Soul food',
      heading: 'Four things to eat tonight',
      items: [
        {
          icon: 'Flame',
          title: 'Takoyaki',
          text: 'Batter balls with octopus, turned with picks on a dimpled griddle. Born in Osaka in the 1930s.'
        },
        {
          icon: 'Utensils',
          title: 'Okonomiyaki',
          text: 'A cabbage pancake cooked on the hotplate at your table — the name means “grilled as you like”.'
        },
        {
          icon: 'Beer',
          title: 'Kushikatsu',
          text: 'Crisp fried skewers in Shinsekai. One rule: never double-dip in the shared sauce.'
        },
        {
          icon: 'Store',
          title: 'Kuromon Market',
          text: 'Around 150 stalls of seafood, fruit and grilled snacks — Osaka’s kitchen for two centuries.'
        }
      ]
    },
    {
      id: 'p4',
      type: 'gallery',
      heading: 'Dōtonbori after dark',
      items: [
        {
          art: 'ichimatsu',
          seed: 11,
          caption: 'Neon over the canal'
        },
        {
          art: 'shippo',
          seed: 30,
          caption: 'Takoyaki, eight to a tray'
        },
        {
          art: 'hinomaru',
          seed: 2,
          caption: 'Lanterns in Hōzenji Yokochō'
        }
      ]
    },
    {
      id: 'p5',
      type: 'agenda',
      heading: 'A night of eating',
      items: [
        {
          time: '16:00',
          title: 'Kuromon Market',
          text: 'Grilled scallops and fresh fruit before the stalls close.'
        },
        {
          time: '18:00',
          title: 'Dōtonbori',
          text: 'Takoyaki from a stand near the Glico running man.'
        },
        {
          time: '19:30',
          title: 'Hōzenji Yokochō',
          text: 'Okonomiyaki in a stone lane beside a moss-covered statue.'
        },
        {
          time: '21:00',
          title: 'Shinsekai',
          text: 'Kushikatsu and a cold beer beneath Tsūtenkaku tower.'
        },
        {
          time: '23:00',
          title: 'Late ramen',
          text: 'One more bowl. It is Osaka, after all.'
        }
      ]
    },
    {
      id: 'p6',
      type: 'stats',
      heading: 'Osaka in mouthfuls',
      body: 'A city that measures life in snacks.',
      items: [
        {
          value: 150,
          prefix: '~',
          suffix: '',
          label: 'stalls in Kuromon Market'
        },
        {
          value: 8,
          prefix: '',
          suffix: '',
          label: 'takoyaki in a typical tray'
        },
        {
          value: 1,
          prefix: '',
          suffix: '',
          label: 'dip allowed per skewer of kushikatsu'
        }
      ]
    },
    {
      id: 'p7',
      type: 'phrases',
      heading: 'Osaka-ben for eaters',
      items: [
        {
          jp: 'おおきに',
          romaji: 'Ōkini',
          meaning: 'Thanks — Osaka dialect'
        },
        {
          jp: 'めっちゃうまい！',
          romaji: 'Meccha umai!',
          meaning: 'So tasty!'
        },
        {
          jp: '二度づけ禁止',
          romaji: 'Nido-zuke kinshi',
          meaning: 'No double-dipping'
        },
        {
          jp: 'なんでやねん！',
          romaji: 'Nande ya nen!',
          meaning: '“Why on earth?!” — the comic’s comeback'
        },
        {
          jp: 'もうかりまっか？',
          romaji: 'Mōkarimakka?',
          meaning: 'Making money? — a merchant’s hello'
        },
        {
          jp: 'ぼちぼちでんな',
          romaji: 'Bochibochi denna',
          meaning: 'So-so — the classic reply'
        }
      ]
    },
    {
      id: 'p8',
      type: 'pricing',
      heading: 'Food walks',
      note: 'Per person. All food and two drinks included. Vegetarian routes on request.',
      plans: [
        {
          name: 'Street Snacks',
          price: '¥9,800',
          period: '2.5 hours',
          features: [
            'Kuromon & Dōtonbori',
            'Six tastings',
            'Local host'
          ],
          highlight: false
        },
        {
          name: 'Kuidaore Night',
          price: '¥16,500',
          period: '4 hours',
          features: [
            'Everything in Street Snacks',
            'Shinsekai kushikatsu',
            'Okonomiyaki you grill yourself',
            'Late-night ramen'
          ],
          highlight: true
        }
      ]
    },
    {
      id: 'p9',
      type: 'contact',
      heading: 'Come hungry',
      body: 'Walks start every afternoon at 16:00. Tell us about allergies when you book and we will plan the route around them.',
      cta: 'Book a food walk',
      details: [
        {
          icon: 'Mail',
          label: 'Email',
          value: 'eat@teppan-tours.example'
        },
        {
          icon: 'Footprints',
          label: 'Walk',
          value: 'About three hours, eight stops'
        },
        {
          icon: 'MapPin',
          label: 'Meet',
          value: 'Kuromon Market, Nippombashi'
        }
      ]
    },
    {
      id: 'p10',
      type: 'back',
      title: 'Ōkini — thanks for reading',
      body: 'Teppan Tours Osaka runs small-group food walks with local hosts.',
      tagline: 'teppan-tours.example'
    }
  ]
};
