import { PlasticDef, MarineDef, CoralDef, PowerUpDef, ShopItem } from '../types';

export const PLASTIC_TYPES: PlasticDef[] = [
  {
    type: 'bottle',
    label: 'Plastic Bottle',
    short: 'Bottle',
    points: 10,
    color: '#4fc3f7',
    fact: 'Over 1 million plastic bottles are bought every minute worldwide.',
  },
  {
    type: 'bag',
    label: 'Plastic Bag',
    short: 'Bag',
    points: 15,
    color: '#e0e0e0',
    fact: 'Plastic bags take up to 1,000 years to degrade in the ocean.',
  },
  {
    type: 'straw',
    label: 'Plastic Straw',
    short: 'Straw',
    points: 20,
    color: '#ff8a65',
    fact: '8 billion plastic straws pollute the world\'s beaches every year.',
  },
  {
    type: 'net',
    label: 'Fishing Net',
    short: 'Net',
    points: 40,
    color: '#78909c',
    fact: 'Ghost nets make up 10% of all marine litter and trap thousands of animals.',
  },
  {
    type: 'cup',
    label: 'Plastic Cup',
    short: 'Cup',
    points: 15,
    color: '#ef5350',
    fact: '500 billion plastic cups are used globally each year.',
  },
];

export const MARINE_TYPES: MarineDef[] = [
  { type: 'fish', label: 'Trapped Fish', points: 100, rescueTime: 0 },
  { type: 'turtle', label: 'Entangled Turtle', points: 250, rescueTime: 1500 },
  { type: 'school', label: 'Scattered Fish School', points: 300, rescueTime: 0 },
];

export const CORAL_TYPES: CoralDef[] = [
  { type: 'branching', label: 'Branching Coral', color: '#ff7043', points: 200 },
  { type: 'brain', label: 'Brain Coral', color: '#ab47bc', points: 250 },
  { type: 'fire', label: 'Fire Coral', color: '#ffa726', points: 150 },
];

export const POWER_UP_DEFS: PowerUpDef[] = [
  {
    type: 'recycling_bin',
    label: 'Recycling Bin',
    description: 'Auto-collects nearby plastic',
    effect: 'Nearby plastic is collected automatically within 150px',
    color: '#66bb6a',
  },
  {
    type: 'reef_seed',
    label: 'Reef Seed',
    description: 'Instant coral patch bonus',
    effect: 'Plant a coral instantly for 200 bonus points',
    color: '#ec407a',
  },
  {
    type: 'tethered_cap',
    label: 'Tethered Cap',
    description: 'Stops plastic from respawning',
    effect: 'Plastic stops respawning in a 300px radius for 15 seconds',
    color: '#42a5f5',
  },
  {
    type: 'current_shield',
    label: 'Current Shield',
    description: 'Temporary invincibility + speed',
    effect: 'Invincible and 50% faster for 10 seconds',
    color: '#ffee58',
  },
  {
    type: 'community_alert',
    label: 'Community Alert',
    description: 'Reveals all marine life',
    effect: 'All trapped marine life highlighted for 20 seconds',
    color: '#ff7043',
  },
];

export function getPlasticDef(type: string): PlasticDef {
  return PLASTIC_TYPES.find((p) => p.type === type) || PLASTIC_TYPES[0];
}

export function getMarineDef(type: string): MarineDef {
  return MARINE_TYPES.find((m) => m.type === type) || MARINE_TYPES[0];
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'seabin',
    name: 'Seabin Drop',
    cost: 200,
    kind: 'consumable',
    description: 'Drop a floating trash skimmer that sucks in plastic nearby for 10s',
    fact: 'Real science: the Seabin Project installs floating skimmer bins in marinas worldwide (90+ countries) that catch floating debris, oil and microplastics before they reach the open ocean. A pump at the waterline draws surface water into a natural-fibre catch bag — so with a little solar power and a strong pump, a single bin can skim thousands of pieces a day. This is exactly the technology you just deployed underwater.',
    iconKey: 'recycling_bin',
    category: 'Cleanup devices',
  },
  {
    id: 'bubble_barrier',
    name: 'Bubble Barrier',
    cost: 300,
    kind: 'consumable',
    description: 'Bubbles push plastic out of a 400px zone and collect it',
    fact: 'Real science: the Great Bubble Barrier in Amsterdam pumps air through a perforated tube laid across a river bed. Rising bubbles create a curtain of upward water flow that guides floating plastic to one side and into a catchment — no nets that would harm fish. It runs 24/7 on renewable energy, so it\'s possible to install this in any canal or river where waste flows toward the ocean.',
    iconKey: 'current_shield',
    category: 'River interceptors',
  },
  {
    id: 'trash_wheel',
    name: 'Trash Wheel Assist',
    cost: 250,
    kind: 'consumable',
    description: 'Solar-powered wheel doubles plastic points for 8s',
    fact: 'Real science: Baltimore\'s Mr. Trash Wheel uses the river\'s current and solar panels to power a set of rakes and a conveyor belt that scoop litter out of the water onto a dumpster barge — no fuel, no nets. It has removed more than a million items from the harbor. The same principle (current + a wheel + a conveyor) is how we double your cleanup power in the game.',
    iconKey: 'bottle',
    category: 'Cleanup devices',
  },
  {
    id: 'coral_nursery',
    name: 'Coral Nursery Kit',
    cost: 400,
    kind: 'consumable',
    description: 'Next coral minigame: first 3 plantings always grow perfectly',
    fact: 'Real science: coral gardening grows fragments of living coral in underwater nurseries — on ropes or frames — before transplanting them onto damaged reefs. Groups like NOAA and SECORE use this to rebuild reefs at scale, because young corals grow far more reliably under controlled conditions. Your kit gives the next 3 plantings a perfect start, just like a real nursery does.',
    iconKey: 'reef_seed',
    category: 'Reef restoration',
  },
  {
    id: 'drone_survey',
    name: 'Drone Survey',
    cost: 350,
    kind: 'consumable',
    description: 'Aerial drone reveals all trapped marine life for 15s',
    fact: 'Real science: aerial drones carrying cameras are used by research teams to map marine debris and spot entangled animals across huge stretches of coast far faster than boats or divers could. With computer vision, a drone can scan beaches and water and flag where help is needed. That is how your survey reveals every trapped creature on the level.',
    iconKey: 'community_alert',
    category: 'Monitoring',
  },
  {
    id: 'net_upgrade',
    name: 'Recycled-Mesh Net',
    cost: 500,
    kind: 'permanent',
    description: 'Permanent: +25% collection radius and +15% plastic points',
    fact: 'Real science: the circular economy turns recovered ocean plastic back into usable products — companies recycle ghost nets and fishing line into new nets and gear, so that rubbish becomes a useful resource instead of pollution. It is possible because plastics can be melted, sorted and re-spun into fibre. That recycled gear is the strong, wide net you now swim with.',
    iconKey: 'net',
    category: 'Circular economy',
  },
  {
    id: 'swim_fins',
    name: 'Efficient Swim Fins',
    cost: 450,
    kind: 'permanent',
    description: 'Permanent: +12% swim speed for every level',
    fact: 'Real science: hydrodynamic design reduces drag so swimmers and machines use less energy — the same engineering behind efficient ships, fishing gear and even olympic swimsuits. Fin blades with the right flex and rake push more water per stroke. That is why your new fins let you glide faster with the same effort.',
    iconKey: 'player',
    category: 'Tech upgrades',
  },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((s) => s.id === id);
}
