/** Hiroshima & Miyajima — 広島・宮島. Shape: see src/data/schema.js. */
export default {
  id: 'b_hiroshima-miyajima',
  slug: 'hiroshima-miyajima',
  title: 'Hiroshima & Miyajima',
  titleJp: '広島・宮島',
  titleKana: 'ひろしま みやじま',
  subtitle: 'Remembrance, renewal and the floating torii of Itsukushima',
  category: 'heritage',
  region: 'chugoku',
  seasons: [
    'spring',
    'autumn'
  ],
  organization: 'Seto Tide Guides',
  summary: 'A respectful two-day journey: the Peace Memorial Park and Museum in Hiroshima, then the island of Miyajima, where the great torii of Itsukushima Shrine stands in the sea.',
  tags: [
    'hiroshima',
    'miyajima',
    'peace memorial',
    'itsukushima',
    'unesco',
    'history',
    'deer'
  ],
  format: 'booklet',
  updatedAt: '2026-05-12T09:00:00.000Z',
  readMinutes: 6,
  featured: false,
  source: 'builtin',
  theme: {
    paper: '#eef0ec',
    ink: '#1c2a2f',
    accent: '#bf3f2b',
    accent2: '#557a8a',
    muted: '#53646a',
    typeface: 'serif'
  },
  cover: {
    art: 'kumo',
    seed: 21
  },
  pages: [
    {
      id: 'p1',
      type: 'cover',
      eyebrow: 'Chūgoku · A journey of two days',
      title: 'Hiroshima & Miyajima',
      titleJp: '広島・宮島',
      subtitle: 'A city that chose peace, and an island shrine that rises from the tide.'
    },
    {
      id: 'p2',
      type: 'intro',
      kicker: 'Before you go',
      heading: 'Before the shrine, the memorial',
      body: 'At 8:15 a.m. on 6 August 1945, the first atomic bomb used in war destroyed much of Hiroshima. The city rebuilt itself as a place dedicated to peace, and the ruined Genbaku Dome — left as it stood — is now a UNESCO World Heritage Site.\n\nA short train and ferry ride away, Miyajima offers a different kind of quiet: a shrine built over the water, deer in the lanes and forest paths up Mount Misen. We suggest taking your time with both.',
      pullQuote: 'Allow time. Hiroshima asks to be listened to.'
    },
    {
      id: 'p3',
      type: 'features',
      kicker: 'Two places, two moods',
      heading: 'What to see',
      items: [
        {
          icon: 'Landmark',
          title: 'Peace Memorial Park',
          text: 'The Cenotaph, the Flame of Peace and the Genbaku Dome across the river, laid out on one quiet axis.'
        },
        {
          icon: 'BookOpen',
          title: 'Peace Memorial Museum',
          text: 'Personal belongings and survivors’ testimony. Allow at least two unhurried hours.'
        },
        {
          icon: 'Bird',
          title: 'Children’s Peace Monument',
          text: 'Strings of paper cranes, sent from all over the world in memory of Sadako Sasaki.'
        },
        {
          icon: 'Waves',
          title: 'Itsukushima Shrine',
          text: 'Vermilion halls on stilts above the tide, and the great torii standing in the sea.'
        }
      ]
    },
    {
      id: 'p4',
      type: 'gallery',
      heading: 'Between sea and sky',
      items: [
        {
          art: 'torii',
          seed: 1,
          caption: 'The great torii at high tide'
        },
        {
          art: 'kumo',
          seed: 12,
          caption: 'Morning mist on Mount Misen'
        },
        {
          art: 'enso',
          seed: 21,
          caption: 'A moment of stillness'
        }
      ]
    },
    {
      id: 'p5',
      type: 'agenda',
      heading: 'A day, unhurried',
      items: [
        {
          time: '09:00',
          title: 'Peace Memorial Park',
          text: 'Walk from the Genbaku Dome to the Cenotaph.'
        },
        {
          time: '10:30',
          title: 'Peace Memorial Museum',
          text: 'Give it at least two quiet hours.'
        },
        {
          time: '13:30',
          title: 'Hiroshima okonomiyaki',
          text: 'Layered with noodles and cooked in front of you.'
        },
        {
          time: '16:00',
          title: 'Ferry to Miyajima',
          text: 'About ten minutes across the strait.'
        },
        {
          time: '18:30',
          title: 'Itsukushima at dusk',
          text: 'The great torii, lit after sunset — at high tide it seems to float.'
        }
      ]
    },
    {
      id: 'p6',
      type: 'stats',
      heading: 'Two sites, one journey',
      body: 'Both were inscribed on the UNESCO World Heritage List in 1996.',
      items: [
        {
          value: 2,
          prefix: '',
          suffix: '',
          label: 'World Heritage Sites, about an hour apart'
        },
        {
          value: 10,
          prefix: '~',
          suffix: ' min',
          label: 'by ferry from Miyajimaguchi'
        },
        {
          value: 16,
          prefix: '~',
          suffix: ' m',
          label: 'height of the great torii'
        }
      ]
    },
    {
      id: 'p7',
      type: 'phrases',
      heading: 'Words for the journey',
      items: [
        {
          jp: '平和',
          romaji: 'Heiwa',
          meaning: 'Peace'
        },
        {
          jp: '折り鶴',
          romaji: 'Orizuru',
          meaning: 'A folded paper crane'
        },
        {
          jp: '黙祷',
          romaji: 'Mokutō',
          meaning: 'A silent prayer'
        },
        {
          jp: '潮の時間を教えてください',
          romaji: 'Shio no jikan o oshiete kudasai',
          meaning: 'Could you tell me the tide times?'
        },
        {
          jp: '鹿に餌をあげないでください',
          romaji: 'Shika ni esa o agenaide kudasai',
          meaning: 'Please do not feed the deer'
        }
      ]
    },
    {
      id: 'p8',
      type: 'pricing',
      heading: 'Guided days',
      note: 'Per person. Museum entry, ferry and lunch included. Guides speak English, French or Spanish.',
      plans: [
        {
          name: 'Hiroshima Day',
          price: '¥22,000',
          period: '1 day',
          features: [
            'Peace Memorial Park & Museum',
            'Lunch with your guide',
            'Unhurried time to reflect'
          ],
          highlight: false
        },
        {
          name: 'Shrine & Tides',
          price: '¥58,000',
          period: '2 days, 1 night',
          features: [
            'Everything in Hiroshima Day',
            'Ryokan night on Miyajima',
            'The torii at high and low tide',
            'Dawn walk up Mount Misen'
          ],
          highlight: true
        }
      ]
    },
    {
      id: 'p9',
      type: 'quote',
      quote: 'Our guide’s grandmother survived the bombing. He told her story simply, then walked us to the river and gave us time. We will not forget that morning.',
      author: 'Margaret L.',
      role: 'Traveller, April 2026'
    },
    {
      id: 'p10',
      type: 'contact',
      heading: 'Plan a thoughtful visit',
      body: 'We check the tide tables for your dates, so you see the great torii both standing in the sea and on the sand.',
      cta: 'Ask a guide',
      details: [
        {
          icon: 'Mail',
          label: 'Email',
          value: 'guides@seto-tide.example'
        },
        {
          icon: 'Languages',
          label: 'Guides',
          value: 'English · Français · Español'
        },
        {
          icon: 'MapPin',
          label: 'Meet',
          value: 'Hiroshima Station, south exit'
        }
      ]
    },
    {
      id: 'p11',
      type: 'back',
      title: 'Heiwa — peace',
      body: 'Seto Tide Guides leads small, respectful journeys through Hiroshima and the Inland Sea.',
      tagline: 'seto-tide.example'
    }
  ]
};
