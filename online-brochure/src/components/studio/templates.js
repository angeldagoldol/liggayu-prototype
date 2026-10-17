/**
 * Starting points for the Studio: five complete Japan brochures to rewrite,
 * a blank three-page brochure, and a remix of any library brochure.
 * Places, dates and phrases are real; publishers, prices, people and contact
 * details are fictional (.example domains).
 */
import { PAGE_TYPES } from '../../data/schema.js';
import { createId } from '../../lib/id.js';
import { randomSeed } from './pageLimits.js';
import { PALETTE_MAP } from './palettes.js';

const theme = (paletteId, typeface) => ({ ...PALETTE_MAP[paletteId].theme, typeface });

export const TEMPLATES = [
  {
    id: 'city-weekend',
    name: 'Weekend in a city',
    jp: '週末の街',
    blurb: 'Two days, four neighbourhoods and one rail card — set in Tokyo.',
    brochure: {
      title: 'Tokyo in 48 Hours',
      titleJp: '東京',
      subtitle: 'Old shrines, new towers and a dinner counter for every night of the week',
      category: 'cities',
      region: 'kanto',
      seasons: ['spring', 'autumn'],
      organization: 'Machi Weekend Co.',
      summary:
        'Two days and four neighbourhoods: a Tokyo weekend that mixes Asakusa’s old streets, a forest shrine, the Shibuya scramble and a quiet morning in Yanaka.',
      tags: ['tokyo', 'weekend', 'neighbourhoods', 'trains', 'food'],
      format: 'bifold',
      theme: theme('neon-tokyo', 'sans'),
      cover: { art: 'ichimatsu', seed: 14 },
      pages: [
        {
          type: 'cover',
          eyebrow: 'Kantō · A two-day city guide',
          title: 'Tokyo in 48 Hours',
          titleJp: '東京',
          subtitle: 'Shrines at breakfast, a scramble crossing at dusk and a twelve-seat counter for dinner.',
        },
        {
          type: 'intro',
          kicker: 'Before you go',
          heading: 'A city of villages',
          body: 'Tokyo is too big to “see” in a weekend — around fourteen million people live across its 23 special wards and the cities beyond. So don’t try. Pick two or three neighbourhoods a day and walk them properly.\n\nTrains do the rest. The Yamanote Line loops past most of the places in this guide; buy a rechargeable IC card at any station, then simply tap in and tap out.',
          pullQuote: 'Don’t see Tokyo. Walk a few corners of it, slowly.',
        },
        {
          type: 'agenda',
          heading: 'Saturday, start to finish',
          items: [
            { time: '07:30', title: 'Sensō-ji', text: 'Tokyo’s oldest temple, with the Kaminarimon lantern all to yourself.' },
            { time: '10:00', title: 'Ueno & Yanaka', text: 'Museums in the park, then the old-town lanes of Yanaka Ginza.' },
            { time: '13:00', title: 'Counter lunch', text: 'Soba or tonkatsu, cooked in front of you.' },
            { time: '16:00', title: 'Meiji Jingū', text: 'A forest shrine, a short walk from Harajuku Station.' },
            { time: '18:30', title: 'Shibuya Crossing', text: 'Watch the scramble from above, then join it.' },
            { time: '20:30', title: 'Izakaya hop', text: 'Small plates and highballs under the railway arches.' },
          ],
        },
        {
          type: 'features',
          kicker: 'Neighbourhoods',
          heading: 'Four Tokyos in one weekend',
          items: [
            { icon: 'Landmark', title: 'Asakusa', text: 'Incense, rickshaws and the great red lantern of Kaminarimon — the old city at its most theatrical.' },
            { icon: 'TreeDeciduous', title: 'Yanaka', text: 'Small temples, cats and wooden shopfronts in a district that kept its pre-war streets.' },
            { icon: 'Footprints', title: 'Shibuya', text: 'The scramble crossing, rooftop views and record shops stacked floor upon floor.' },
            { icon: 'Coffee', title: 'Shimokitazawa', text: 'Vintage clothes, tiny theatres and some of the city’s best coffee, all on foot.' },
          ],
        },
        {
          type: 'stats',
          heading: 'Tokyo in numbers',
          body: 'Very large numbers. Surprisingly small streets.',
          items: [
            { value: 23, prefix: '', suffix: '', label: 'special wards' },
            { value: 30, prefix: '', suffix: '', label: 'stations on the Yamanote loop' },
            { value: 14, prefix: '~', suffix: 'M', label: 'people in the metropolis' },
          ],
        },
        {
          type: 'phrases',
          heading: 'City Japanese',
          items: [
            { jp: 'すみません', romaji: 'Sumimasen', meaning: 'Excuse me (to get attention)' },
            { jp: '渋谷駅はどこですか？', romaji: 'Shibuya-eki wa doko desu ka?', meaning: 'Where is Shibuya Station?' },
            { jp: 'これをください', romaji: 'Kore o kudasai', meaning: 'This one, please' },
            { jp: 'カードで払えますか？', romaji: 'Kādo de haraemasu ka?', meaning: 'Can I pay by card?' },
          ],
        },
        {
          type: 'contact',
          heading: 'Plan your weekend',
          body: 'Tell us your dates and what you love. We’ll send a two-day plan and hold dinner tables for 48 hours.',
          cta: 'Request a plan',
          details: [
            { icon: 'Mail', label: 'Email', value: 'weekend@machi.example' },
            { icon: 'Clock', label: 'Hours', value: 'Daily 10:00–19:00 JST' },
            { icon: 'MapPin', label: 'Desk', value: 'Jinnan, Shibuya-ku, Tokyo' },
          ],
        },
        {
          type: 'back',
          title: 'Mata ne, Tōkyō',
          body: 'Machi Weekend Co. plans short, slow city breaks across Japan.',
          tagline: 'machi-weekend.example',
        },
      ],
    },
  },
  {
    id: 'onsen-escape',
    name: 'Onsen escape',
    jp: '湯めぐり',
    blurb: 'Yukata, wooden geta and seven public baths in Kinosaki.',
    brochure: {
      title: 'Kinosaki: Seven Baths',
      titleJp: '城崎温泉',
      subtitle: 'Yukata, wooden sandals and a willow-lined river in a hot-spring town near the Sea of Japan',
      category: 'onsen',
      region: 'kansai',
      seasons: ['autumn', 'winter'],
      organization: 'Yumeguri Ryokan Collective',
      summary:
        'A slow onsen escape in Kinosaki, where guests stroll between seven public bathhouses in yukata and geta, then sit down to a winter crab feast.',
      tags: ['onsen', 'ryokan', 'kinosaki', 'yukata', 'snow crab', 'hyōgo'],
      format: 'booklet',
      theme: theme('yuki', 'serif'),
      cover: { art: 'kumo', seed: 7 },
      pages: [
        {
          type: 'cover',
          eyebrow: 'Hyōgo · An onsen weekend',
          title: 'Seven Baths',
          titleJp: '城崎温泉',
          subtitle: 'Put on a yukata, borrow a pair of geta and walk from bath to bath beneath the willows.',
        },
        {
          type: 'intro',
          kicker: 'Welcome to Kinosaki',
          heading: 'A town that is one big ryokan',
          body: 'In Kinosaki, people say, the inn is your bedroom and the town is your bath. Check in, change into the cotton yukata waiting in your room and set out along the Ōtani River to the seven public bathhouses, the soto-yu.\n\nMost ryokan hand their guests a pass for the public baths. Bring a small towel, take your time, and listen for the clack of wooden geta on the stone bridges after dark.',
          pullQuote: 'The inn is your bedroom; the town is your bath.',
        },
        {
          type: 'features',
          kicker: 'The ritual',
          heading: 'How to bathe like a local',
          items: [
            { icon: 'Bath', title: 'Wash first', text: 'Sit at the low showers and scrub before you get in. The bath is for soaking, not washing.' },
            { icon: 'Waves', title: 'Towel out of the water', text: 'Fold your small towel on your head or leave it on the edge — never in the bath.' },
            { icon: 'Moon', title: 'Bathe after dinner', text: 'The river is lantern-lit at night and most baths stay open into the late evening.' },
            { icon: 'Footprints', title: 'Yukata and geta', text: 'Your inn lends both. Wrap the left side over the right — the reverse is for funerals.' },
          ],
        },
        {
          type: 'agenda',
          heading: 'An evening of yu-meguri',
          items: [
            { time: '15:00', title: 'Check in', text: 'Green tea and a sweet in your tatami room.' },
            { time: '16:00', title: 'First bath', text: 'A slow soak at the bathhouse nearest your inn.' },
            { time: '18:00', title: 'Kaiseki dinner', text: 'Seasonal courses — in winter, snow crab.' },
            { time: '20:00', title: 'Bath-hopping', text: 'Two or three more baths, lantern to lantern.' },
            { time: '22:00', title: 'Futon', text: 'Laid out while you were away. Sleep like a stone.' },
          ],
        },
        {
          type: 'pricing',
          heading: 'Ryokan stays',
          note: 'Per person, two sharing. Kaiseki dinner, breakfast and a pass to all seven baths included.',
          plans: [
            {
              name: 'Riverside',
              price: '¥32,000',
              period: 'one night',
              features: ['Tatami room above the river', 'Kaiseki dinner & breakfast', 'Pass to all seven baths'],
              highlight: false,
            },
            {
              name: 'Crab Season',
              price: '¥58,000',
              period: 'one night, Nov – Mar',
              features: ['Everything in Riverside', 'Snow crab kaiseki', 'Private family bath', 'Late check-out'],
              highlight: true,
            },
          ],
        },
        {
          type: 'phrases',
          heading: 'Words for the bath',
          items: [
            { jp: '気持ちいい！', romaji: 'Kimochi ii!', meaning: 'That feels wonderful!' },
            { jp: 'いいお湯でした', romaji: 'Ii oyu deshita', meaning: 'That was a lovely bath' },
            { jp: '貸切風呂はありますか？', romaji: 'Kashikiri-buro wa arimasu ka?', meaning: 'Is there a private bath?' },
            { jp: '何時まで入れますか？', romaji: 'Nanji made hairemasu ka?', meaning: 'Until what time is it open?' },
          ],
        },
        {
          type: 'quote',
          quote: 'We did five baths in one evening and the walk between them was the best part — snow on the willows, geta on the bridges, nobody in a hurry.',
          author: 'Mara & Jun',
          role: 'Guests, February 2026',
        },
        {
          type: 'back',
          title: 'Go-yukkuri — take your time',
          body: 'Yumeguri Ryokan Collective represents small, family-run inns in Kinosaki.',
          tagline: 'yumeguri.example',
        },
      ],
    },
  },
  {
    id: 'festival-night',
    name: 'Festival night',
    jp: '祭りの夜',
    blurb: 'Lanterns, floats and street food at Kyoto’s Gion Matsuri.',
    brochure: {
      title: 'Gion Matsuri: Nights of Yoiyama',
      titleJp: '祇園祭',
      subtitle: 'Lantern-lit floats, festival stalls and the great July procession in Kyoto',
      category: 'festivals',
      region: 'kansai',
      seasons: ['summer'],
      organization: 'Natsu Lantern Tours',
      summary:
        'A festival-night guide to Kyoto’s Gion Matsuri: wander the lantern-lit floats on Yoiyama evenings, eat at the stalls and find a spot for the procession on 17 July.',
      tags: ['matsuri', 'kyoto', 'summer', 'yukata', 'festival food', 'floats'],
      format: 'trifold',
      theme: theme('ai-night', 'serif'),
      cover: { art: 'hinomaru', seed: 21 },
      pages: [
        {
          type: 'cover',
          eyebrow: 'Kyoto · July',
          title: 'Nights of Yoiyama',
          titleJp: '祇園祭',
          subtitle: 'Paper lanterns, festival music and towering wooden floats in the streets of old Kyoto.',
        },
        {
          type: 'intro',
          kicker: 'Matsuri season',
          heading: 'A whole month of festival',
          body: 'The Gion Matsuri belongs to Yasaka Shrine and fills the entire month of July. It began in 869 as a rite to calm an epidemic, and the neighbourhoods of central Kyoto have carried it on ever since.\n\nThe best nights are Yoiyama — the evenings before each procession — when the floats stand lit in the streets, cars give way to people in yukata and the air smells of charcoal and sweet soy.',
          pullQuote: 'Come for the floats. Stay for the lanterns.',
        },
        {
          type: 'agenda',
          heading: 'Festival night, hour by hour',
          items: [
            { time: '17:00', title: 'Yukata on', text: 'Rent one near Shijō and let the staff tie your obi.' },
            { time: '18:30', title: 'Lanterns lit', text: 'The floats glow as the sun goes down.' },
            { time: '19:00', title: 'Gion-bayashi', text: 'Flutes, gongs and drums from the decks of the hoko.' },
            { time: '20:00', title: 'Stall supper', text: 'Yakitori, takoyaki and shaved ice.' },
            { time: '21:30', title: 'A chimaki charm', text: 'Hang it above your door for a year of good luck.' },
          ],
        },
        {
          type: 'features',
          kicker: 'Festival food',
          heading: 'What to eat at the stalls',
          items: [
            { icon: 'Flame', title: 'Yakitori', text: 'Chicken skewers over charcoal, brushed with sweet tare or simply salted.' },
            { icon: 'Soup', title: 'Takoyaki', text: 'Octopus dumplings turned in iron moulds — far too hot to eat right away.' },
            { icon: 'Snowflake', title: 'Kakigōri', text: 'Shaved ice under bright syrup: the taste of a Japanese summer.' },
            { icon: 'Wheat', title: 'Yakisoba', text: 'Fried noodles with cabbage and sauce from a great iron griddle.' },
          ],
        },
        {
          type: 'stats',
          heading: 'Gion Matsuri in numbers',
          body: 'More than eleven centuries of summer.',
          items: [
            { value: 869, prefix: '', suffix: '', label: 'the year it began' },
            { value: 31, prefix: '', suffix: '', label: 'days of festival' },
            { value: 30, prefix: '', suffix: '+', label: 'yama and hoko floats' },
            { value: 25, prefix: '~', suffix: ' m', label: 'height of the tallest hoko' },
          ],
        },
        {
          type: 'phrases',
          heading: 'Matsuri Japanese',
          items: [
            { jp: 'おいしそう！', romaji: 'Oishisō!', meaning: 'That looks delicious!' },
            { jp: 'ひとつください', romaji: 'Hitotsu kudasai', meaning: 'One, please' },
            { jp: '浴衣、似合いますね', romaji: 'Yukata, niaimasu ne', meaning: 'Your yukata suits you' },
            { jp: 'きれい！', romaji: 'Kirei!', meaning: 'Beautiful!' },
          ],
        },
        {
          type: 'contact',
          heading: 'Join a lantern walk',
          body: 'Small groups, a local guide and a yukata fitting included. Yoiyama evenings book out by June.',
          cta: 'Reserve a place',
          details: [
            { icon: 'Mail', label: 'Email', value: 'matsuri@natsu-lantern.example' },
            { icon: 'Clock', label: 'Walks', value: 'From 18:30, about two hours' },
            { icon: 'Calendar', label: 'Evenings', value: '14 – 16 & 21 – 23 July' },
          ],
        },
        {
          type: 'back',
          title: 'Mata rainen — see you next summer',
          body: 'Natsu Lantern Tours runs small evening festival walks in Kyoto.',
          tagline: 'natsu-lantern.example',
        },
      ],
    },
  },
  {
    id: 'food-crawl',
    name: 'Food crawl',
    jp: '食べ歩き',
    blurb: 'Ramen, skewers and riverside stalls in Fukuoka after dark.',
    brochure: {
      title: 'Fukuoka: A Yatai Crawl',
      titleJp: '屋台',
      subtitle: 'Open-air food stalls, tonkotsu ramen and riverside counters in Kyūshū’s food capital',
      category: 'food',
      region: 'kyushu',
      seasons: ['spring', 'summer', 'autumn', 'winter'],
      organization: 'Hakata Night Bites',
      summary:
        'Pull up a stool at Fukuoka’s open-air yatai: rich Hakata ramen, charcoal skewers and spicy mentaiko, one tiny stall after another along the Naka River.',
      tags: ['fukuoka', 'hakata', 'ramen', 'yatai', 'street food'],
      format: 'bifold',
      theme: theme('momiji', 'serif'),
      cover: { art: 'seigaiha', seed: 33 },
      pages: [
        {
          type: 'cover',
          eyebrow: 'Kyūshū · A night food guide',
          title: 'A Yatai Crawl',
          titleJp: '屋台',
          subtitle: 'Eight stools, one cook, a curtain against the night — and the best bowl of ramen of your year.',
        },
        {
          type: 'intro',
          kicker: 'Welcome to Fukuoka',
          heading: 'The city that eats outdoors',
          body: 'Every evening around a hundred yatai — open-air stalls with a counter, a curtain and room for eight or so — set up on the streets of Fukuoka. Many gather along the Naka River in Nakasu and around Tenjin.\n\nThe etiquette is simple: order a drink and a dish or two, talk to your neighbours, then move on so someone else can sit down. And do it all again at the next stall.',
          pullQuote: 'One drink, one dish, one new friend — then the next stall.',
        },
        {
          type: 'features',
          kicker: 'Must-eats',
          heading: 'Four tastes of Fukuoka',
          items: [
            { icon: 'Soup', title: 'Hakata ramen', text: 'Milky pork-bone broth and thin, straight noodles. Order them barikata — extra firm.' },
            { icon: 'Fish', title: 'Mentaiko', text: 'Spiced pollock roe, tucked into rice balls, folded into omelettes or lightly grilled.' },
            { icon: 'Flame', title: 'Yakitori', text: 'Charcoal skewers. In Fukuoka, the pork belly — butabara — is the one to order.' },
            { icon: 'Utensils', title: 'Motsunabe', text: 'A bubbling hot pot of offal, cabbage, garlic chives and chilli. Best shared.' },
          ],
        },
        {
          type: 'agenda',
          heading: 'A four-stall evening',
          items: [
            { time: '18:00', title: 'Stalls roll out', text: 'Watch the yatai set up along the river.' },
            { time: '18:30', title: 'Skewers', text: 'Butabara, chicken skin and a cold highball.' },
            { time: '19:30', title: 'Oden', text: 'Daikon and eggs simmered in dashi.' },
            { time: '20:30', title: 'Gyōza', text: 'Bite-sized Hakata dumplings, crisp underneath.' },
            { time: '22:00', title: 'Ramen', text: 'Finish with tonkotsu — and ask for kaedama, a second serving of noodles.' },
          ],
        },
        {
          type: 'phrases',
          heading: 'Counter Japanese',
          items: [
            { jp: 'バリカタでお願いします', romaji: 'Barikata de onegaishimasu', meaning: 'Extra-firm noodles, please' },
            { jp: '替え玉ください', romaji: 'Kaedama kudasai', meaning: 'More noodles, please' },
            { jp: 'おすすめは何ですか？', romaji: 'Osusume wa nan desu ka?', meaning: 'What do you recommend?' },
            { jp: '乾杯！', romaji: 'Kanpai!', meaning: 'Cheers!' },
            { jp: 'お会計お願いします', romaji: 'Okaikei onegaishimasu', meaning: 'The bill, please' },
          ],
        },
        {
          type: 'pricing',
          heading: 'Guided crawls',
          note: 'Per person. Food at every stall and two drinks included; extra drinks are paid at the counter.',
          plans: [
            {
              name: 'First Bowl',
              price: '¥9,800',
              period: '3 hours',
              features: ['Four yatai with a local guide', 'Ramen, yakitori, oden & gyōza', 'Two drinks'],
              highlight: false,
            },
            {
              name: 'Last Train',
              price: '¥15,500',
              period: '5 hours',
              features: ['Everything in First Bowl', 'A hidden izakaya stop', 'Shōchū tasting', 'Taxi back to your hotel'],
              highlight: true,
            },
          ],
        },
        {
          type: 'quote',
          quote: 'We sat elbow to elbow with an office worker, a nurse and a retired fisherman. By the ramen stall we were all ordering for each other.',
          author: 'Noor S.',
          role: 'Food crawl guest, October 2025',
        },
        {
          type: 'back',
          title: 'Gochisōsama deshita',
          body: 'Hakata Night Bites runs small-group food walks in Fukuoka.',
          tagline: 'hakata-night-bites.example',
        },
      ],
    },
  },
  {
    id: 'temple-trail',
    name: 'Temple trail',
    jp: '寺めぐり',
    blurb: 'Zen temples, a hill path and the Great Buddha of Kamakura.',
    brochure: {
      title: 'Kamakura: The Temple Trail',
      titleJp: '鎌倉',
      subtitle: 'Zen temples, a bronze Buddha and a hill path above the sea, an hour from Tokyo',
      category: 'heritage',
      region: 'kanto',
      seasons: ['spring', 'autumn'],
      organization: 'Kōro Walking Guides',
      summary:
        'A day on foot through Kamakura, Japan’s medieval warrior capital: Zen temples in Kita-Kamakura, a wooded hill path and the Great Buddha of Kōtoku-in.',
      tags: ['kamakura', 'temples', 'zen', 'great buddha', 'hiking', 'day trip'],
      format: 'booklet',
      theme: theme('sumi', 'serif'),
      cover: { art: 'enso', seed: 8 },
      pages: [
        {
          type: 'cover',
          eyebrow: 'Kantō · A day on foot',
          title: 'The Temple Trail',
          titleJp: '鎌倉',
          subtitle: 'Moss, temple bells and a bronze Buddha — an hour from Tokyo and eight centuries away.',
        },
        {
          type: 'intro',
          kicker: 'Welcome to Kamakura',
          heading: 'The old warrior capital',
          body: 'From 1185 to 1333 this small seaside town was the seat of Japan’s first shogunate. The samurai government is long gone, but the Zen temples it founded still fill the wooded valleys.\n\nThis trail starts at Kita-Kamakura Station, climbs into the hills and comes down beside the Great Buddha. Wear proper shoes: the path is rooty, and very beautiful.',
          pullQuote: 'An hour from Tokyo. Eight centuries away.',
        },
        {
          type: 'agenda',
          heading: 'The trail, step by step',
          items: [
            { time: '08:30', title: 'Engaku-ji', text: 'A great Zen monastery founded in 1282, beside the station.' },
            { time: '10:00', title: 'Kenchō-ji', text: 'Kamakura’s oldest Zen training monastery.' },
            { time: '11:30', title: 'Hill path', text: 'Around three kilometres of ridge trail through the woods.' },
            { time: '13:30', title: 'The Great Buddha', text: 'The bronze Daibutsu of Kōtoku-in, sitting in the open air.' },
            { time: '15:00', title: 'Hase-dera', text: 'Hillside temple with sea views — and hydrangeas in June.' },
            { time: '17:00', title: 'Yuigahama', text: 'Down to the beach as the light turns gold.' },
          ],
        },
        {
          type: 'features',
          kicker: 'Temple manners',
          heading: 'How to visit with respect',
          items: [
            { icon: 'Leaf', title: 'Purify first', text: 'At the water basin, rinse your left hand, then your right, then your mouth from a cupped palm.' },
            { icon: 'Footprints', title: 'Shoes off', text: 'Leave your shoes at the entrance. Slippers are for corridors — never wear them on tatami.' },
            { icon: 'Camera', title: 'Mind the signs', text: 'Some halls don’t allow photographs. When in doubt, ask — or simply look.' },
            { icon: 'Scroll', title: 'Collect goshuin', text: 'Bring a stamp book: temples brush a calligraphy seal for a small offering.' },
          ],
        },
        {
          type: 'stats',
          heading: 'Kamakura in numbers',
          body: 'A small town with a long memory.',
          items: [
            { value: 1185, prefix: '', suffix: '', label: 'the shogunate begins here' },
            { value: 11, prefix: '~', suffix: ' m', label: 'height of the Great Buddha' },
            { value: 60, prefix: '~', suffix: ' min', label: 'by train from Tokyo' },
          ],
        },
        {
          type: 'phrases',
          heading: 'Temple Japanese',
          items: [
            { jp: 'おはようございます', romaji: 'Ohayō gozaimasu', meaning: 'Good morning' },
            { jp: '御朱印をお願いします', romaji: 'Goshuin o onegaishimasu', meaning: 'A temple seal, please' },
            { jp: 'お手洗いはどこですか？', romaji: 'Otearai wa doko desu ka?', meaning: 'Where is the toilet?' },
            { jp: 'ありがとうございました', romaji: 'Arigatō gozaimashita', meaning: 'Thank you very much' },
          ],
        },
        {
          type: 'contact',
          heading: 'Walk with a guide',
          body: 'Groups of up to eight, every weekend from March to November. Lunch at a temple-food restaurant is included.',
          cta: 'Book a walk',
          details: [
            { icon: 'Mail', label: 'Email', value: 'walks@koro-guides.example' },
            { icon: 'Footprints', label: 'Walk', value: 'About 6 km, four hours' },
            { icon: 'TrainFront', label: 'Meet', value: 'Kita-Kamakura Station, 08:15' },
          ],
        },
        {
          type: 'back',
          title: 'Otsukaresama deshita — well walked',
          body: 'Kōro Walking Guides leads small-group walks on Japan’s old roads and temple paths.',
          tagline: 'koro-guides.example',
        },
      ],
    },
  },
];

export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));

/** Turn brochure content into a fresh user draft: new ids, no slug, now as the edit date. */
function toDraft(content, { makeId, now }) {
  const copy = structuredClone(content);
  return {
    ...copy,
    id: makeId('b'),
    slug: '',
    source: 'user',
    featured: false,
    updatedAt: now.toISOString(),
    readMinutes: copy.readMinutes ?? 1,
    pages: (copy.pages ?? []).map((page) => ({ ...page, id: makeId('pg') })),
  };
}

const defaults = (options = {}) => ({ makeId: options.makeId ?? createId, now: options.now ?? new Date() });

/** A complete draft brochure from a template id (falls back to the first template). */
export function createFromTemplate(templateId, options) {
  const template = TEMPLATE_MAP[templateId] ?? TEMPLATES[0];
  return toDraft(template.brochure, defaults(options));
}

/** Cover, introduction and back cover with schema placeholders. */
export function createBlank(options) {
  const random = options?.random ?? Math.random;
  return toDraft(
    {
      title: '',
      titleJp: '旅',
      subtitle: '',
      category: 'heritage',
      region: 'kansai',
      seasons: [],
      organization: '',
      summary: '',
      tags: [],
      format: 'booklet',
      theme: theme('shu-kinari', 'serif'),
      cover: { art: 'hinomaru', seed: randomSeed(random) },
      pages: ['cover', 'intro', 'back'].map((type) => ({ type, ...PAGE_TYPES[type].create() })),
    },
    defaults(options),
  );
}

/** A deep, editable copy of any brochure: new ids, "(remix)" title, owned by the user. */
export function createRemix(source, options) {
  const draft = toDraft(source, defaults(options));
  const title = String(source.title ?? '').trim() || 'Untitled brochure';
  return { ...draft, title: `${title} (remix)` };
}
