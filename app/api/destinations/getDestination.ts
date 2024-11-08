import { Destination } from './destination';

export const Destinations: Destination[] = [
  {
    id: 0,
    title: 'CHAPTER 1: The Dream',
    description:
      'Confucius and you are both dreams, and I who say you are dreams am a dream myself. This is a paradox. Tomorrow a wise man may explain it; that tomorrow will not be for ten thousand generations.— CHUANG TSE: II',
    options: [
      {
        text: 'Dream on',
        destination: 1,
        requirements: [],
        effects: [],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 1,
    description:
      "Your eyes are closed. There are visions piercing your mind. Unshaped and fragmented, individually they don't seem to make sense when your mind is chasing them, but when you focus, they become a clearer picture. You piece them together into a coherent pattern.",
    options: [
      {
        text: 'You are in the middle of a city square, surrounded by piles of dead bodies. Flames everywhere. Kneeling before you is a scared woman. Your gun is pressed to a tear that was running from her cheek. You have no choice but to pull the trigger.',
        destination: 4,
        requirements: [],
        effects: ['VETERAN'],
      },
      {
        text: 'You are enveloped by the warmth of your bed and the sounds of the birds outside. You hear a familiar melody of the voice that calls you by your name. If you want the memory to last, how long can you hold on to it?',
        destination: 3,
        requirements: [],
        effects: ['PACIFIST'],
      },
      {
        text: 'There is a lab filled with the research notes, equipment and screens with numbers. You let the silence ease the wildness of your thoughts for a moment, but lack the focus to piece the puzzle together. What is missing?',
        destination: 3,
        requirements: [],
        effects: ['SCHOLAR'],
      },
      {
        text: 'The abstraction is meaningless, its only purpose is to drag you deeper into questioning reality. You begin to question whether it is your own memories you are seeing. The difference is undecidable. You chose not to focus.',
        destination: 3,
        requirements: [],
        effects: ['NIHILIST'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 3,
    description:
      "The fragments of your dream begin to coalesce, forming a clearer picture of who you might be. The echoes of your chosen path reverberate through your consciousness, but there's something else—a deeper understanding of your own nature that begins to crystallise.",
    options: [
      {
        text: 'Hold yourself together. Your iron will has always been your greatest asset. The world may crumble, but your resolve shall not.',
        destination: 4,
        requirements: [],
        effects: ['VOLITION', 'STEADFAST'],
      },
      {
        text: 'Wield raw intellectual power. The world is a puzzle awaiting your analysis, each piece a clue to understanding the greater whole.',
        destination: 4,
        requirements: [],
        effects: ['LOGIC', 'ANALYTICAL'],
      },
      {
        text: "[SCHOLAR] Perhaps there's a scientific explanation for these visions. The neural pathways responsible for memory formation...",
        destination: 4,
        requirements: ['SCHOLAR'],
        effects: ['RATIONALIST'],
      },
      {
        text: "[NIHILIST] What does it matter? Dreams, reality—they're all constructs of a meaningless existence.",
        destination: 4,
        requirements: ['NIHILIST'],
        effects: ['CYNICAL'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 4,
    description:
      "You open your eyes with great difficulty to a dimly lit space. Your body is shivering, and your head is wracked with pain. As you get your bearings and look around, the room slowly comes into focus. Nothing seems out of the ordinary at first: there's a small metal sink, a bed with worn sheets, and a flickering fluorescent light casting uncertain shadows. The room has no windows—a detail that grows more unsettling as the seconds pass. It takes you a good few minutes to realise that the room you're in is, in fact, a cell. By that time, the sound of rushing water catches your attention, and you notice your feet are ankle-deep in steadily rising water.",
    options: [
      {
        text: 'Head for the door with measured urgency',
        destination: 5,
        requirements: [],
        effects: [],
      },
      {
        text: 'Scream for attention—someone must be monitoring this place',
        destination: 6,
        requirements: [],
        effects: [],
      },
      {
        text: "[VETERAN] Assess the tactical situation—look for weaknesses in the cell's construction",
        destination: 5,
        requirements: ['VETERAN'],
        effects: ['TACTICAL'],
      },
      {
        text: "[SCHOLAR] Analyse the water's source and flow pattern",
        destination: 7,
        requirements: ['SCHOLAR'],
        effects: ['OBSERVANT'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 5,
    description:
      "You make your way to the door, your movements causing ripples in the rising water. It's a large metallic structure with no visible hinges or handles on the inside—clearly designed to be opened only from the exterior. There's a tiny camera embedded in the door near the top, slightly above your height level. Its red LED blinks steadily, watching. The water is now reaching your mid-calf, and there's a faint humming sound coming from somewhere beyond the walls.",
    options: [
      {
        text: "Survey the room one more time—there must be something you've missed",
        destination: 6,
        requirements: [],
        effects: ['THOROUGH'],
      },
      {
        text: 'Motion at the camera, attempt to communicate with your captors',
        destination: 7,
        requirements: [],
        effects: [],
      },
      {
        text: '[VOLITION] Attempt to break out—no cell is completely secure',
        destination: 8,
        requirements: ['VOLITION'],
        effects: ['DETERMINED'],
      },
      {
        text: '[LOGIC] Calculate the rate of water rise and remaining air pocket time',
        destination: 7,
        requirements: ['LOGIC'],
        effects: ['CALCULATING'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 9,
    description:
      'The water continues its relentless rise, now reaching your knees. The fluorescent light above flickers more intensely, creating a strobe-like effect that makes the situation even more disorienting. Through the rhythmic sound of water, you begin to hear something else—a mechanical whirring, perhaps from behind one of the walls.',
    options: [
      {
        text: 'Focus on the source of the mechanical sound',
        destination: 10,
        requirements: [],
        effects: ['ATTENTIVE'],
      },
      {
        text: '[SCHOLAR/LOGIC] The sound pattern suggests a periodic mechanism—perhaps tied to the water system',
        destination: 11,
        requirements: ['SCHOLAR', 'LOGIC'],
        effects: ['INSIGHT'],
      },
      {
        text: '[PACIFIST] Remain calm and conserve energy—panic will only make things worse',
        destination: 12,
        requirements: ['PACIFIST'],
        effects: ['COMPOSED'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 101,
    description:
      '**Where there is a beginning, there is an end. This is no exception...**',
    options: [
      {
        text: 'Restart',
        destination: 0,
        requirements: [],
        effects: [],
      },
    ],
    requirements: ['GAME OVER'],
    effects: [],
  },
];
