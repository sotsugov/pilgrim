import { Destination } from './destination';

export const Destinations: Destination[] = [
  {
    id: 0,
    title: 'Chapter 1: The Dream',
    description:
      'Confucius and you are both dreams, and I who say you are dreams am a dream myself. This is a paradox. Tomorrow a wise man may explain it; that tomorrow will not be for ten thousand generations.—CHUANG TSE: II',
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
        text: "Perhaps there's a scientific explanation for these visions. The neural pathways responsible for memory formation...",
        destination: 4,
        requirements: ['SCHOLAR'],
        effects: ['RATIONALIST'],
      },
      {
        text: "What does it matter? Dreams, reality—they're all constructs of a meaningless existence.",
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
        text: "Assess the tactical situation—look for weaknesses in the cell's construction",
        destination: 5,
        requirements: ['VETERAN'],
        effects: ['TACTICAL'],
      },
      {
        text: "Analyse the water's source and flow pattern",
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
      "You make your way to the door, your movements causing ripples in the rising water. It's a solid metal structure with no visible hinges or handles on the inside—clearly designed to be opened only from the exterior. A small camera with a blinking red LED watches silently from above. The water has already reached your mid-calf, and a faint mechanical hum resonates through the walls.",
    options: [
      {
        text: 'Examine the door frame meticulously—every lock has a weakness',
        destination: 6,
        requirements: [],
        effects: ['ANALYTICAL'],
      },
      {
        text: "Try to communicate with whoever's watching through the camera",
        destination: 7,
        requirements: [],
        effects: ['DIPLOMATIC'],
      },
      {
        text: "Use the rising water to test the room's seals and potential weak points",
        destination: 8,
        requirements: ['LOGIC'],
        effects: ['METHODICAL'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 6,
    description:
      "Your fingers trace the door's edges, finding only seamless construction. The frame is flush against the wall, no exposed screws or hinges. But wait—there's something different about the lower right corner. The metal feels slightly warmer there, and the humming is more pronounced. The water continues to rise, now reaching just below your knees.",
    options: [
      {
        text: 'Focus on that corner—the temperature difference might indicate something behind it',
        destination: 8,
        requirements: [],
        effects: ['PERCEPTIVE'],
      },
      {
        text: "Use the water pressure to test the door's seal at that corner",
        destination: 9,
        requirements: ['LOGIC'],
        effects: ['RESOURCEFUL'],
      },
      {
        text: "The corner's warmth suggests active machinery—perhaps there's a pattern to the humming",
        destination: 7,
        requirements: ['SCHOLAR'],
        effects: ['TECHNICAL'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 7,
    description:
      "The mechanical hum suddenly changes pitch, and you feel a vibration through the floor. The water's rise accelerates noticeably, accompanied by a gurgling sound from somewhere beneath. The light flickers more intensely now, casting chaotic shadows across the churning surface.",
    options: [
      {
        text: "Brace yourself against the walls and try to locate the water's entry point",
        destination: 8,
        requirements: [],
        effects: ['PRACTICAL'],
      },
      {
        text: 'The timing between light flickers and water surges might be meaningful',
        destination: 9,
        requirements: ['ANALYTICAL'],
        effects: ['PATTERN_RECOGNITION'],
      },
      {
        text: 'Your captors are testing your reactions—remain calm and observe',
        destination: 9,
        requirements: ['STEADFAST'],
        effects: ['COMPOSED'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 8,
    description:
      'Through the distortion of the water, you notice something peculiar—regular intervals of slightly darker tiles on the floor. They form a pattern that seems almost intentional. The water level has reached your thighs now, making movement more difficult, but these tiles might be significant.',
    options: [
      {
        text: 'Press the tiles in sequence—it might trigger a mechanism',
        destination: 9,
        requirements: [],
        effects: ['INVESTIGATIVE'],
      },
      {
        text: 'Map the pattern mentally—it could be a code or blueprint',
        destination: 9,
        requirements: ['LOGIC'],
        effects: ['SYSTEMATIC'],
      },
      {
        text: "The pattern aligns with the humming's source—they must be connected",
        destination: 9,
        requirements: ['TECHNICAL'],
        effects: ['DEDUCTIVE'],
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
        text: 'The sound pattern suggests a periodic mechanism—perhaps tied to the water system',
        destination: 11,
        requirements: ['SCHOLAR', 'LOGIC'],
        effects: ['INSIGHT'],
      },
      {
        text: 'Remain calm and conserve energy—panic will only make things worse',
        destination: 12,
        requirements: ['PACIFIST'],
        effects: ['COMPOSED'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 10,
    description:
      "You close your eyes and hone in on the mechanical whirring. It's rhythmic, almost like a heartbeat. You trace the sound to the wall opposite the door. As you press your ear against the cold, damp surface, you feel a faint vibration. There's something behind this wall—a mechanism, perhaps an escape.",
    options: [
      {
        text: 'Search for a hidden panel or loose brick',
        destination: 13,
        requirements: [],
        effects: ['CURIOUS'],
      },
      {
        text: 'Attempt to disrupt the mechanism through force',
        destination: 14,
        requirements: ['VETERAN'],
        effects: ['FORCEFUL'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 11,
    description:
      "Your analytical mind kicks into overdrive. The intervals between the mechanical sounds are consistent—every 30 seconds. You deduce that it's likely a pump mechanism. If you can time it right, perhaps you can interfere with it or find a way to reverse the water flow.",
    options: [
      {
        text: 'Attempt to locate the control panel for the pump',
        destination: 13,
        requirements: [],
        effects: ['METHODICAL'],
      },
      {
        text: 'Use an object to jam the pump mechanism',
        destination: 15,
        requirements: ['LOGIC'],
        effects: ['INNOVATIVE'],
      },
    ],
    requirements: ['SCHOLAR', 'LOGIC'],
    effects: [],
  },
  {
    id: 12,
    description:
      "You take deep breaths, steadying your nerves. Panic won't help you now. By conserving your energy, you can think more clearly. The water is cold, but your calmness helps you endure. As you survey the room once more, you notice subtle details that might assist in your escape.",
    options: [
      {
        text: 'Look for any tools or objects that can help',
        destination: 13,
        requirements: [],
        effects: ['OBSERVANT'],
      },
      {
        text: 'Meditate to preserve oxygen and warmth',
        destination: 16,
        requirements: ['PACIFIST'],
        effects: ['TRANQUIL'],
      },
    ],
    requirements: ['PACIFIST'],
    effects: [],
  },
  {
    id: 13,
    description:
      "Feeling along the wall, your fingers find a slight indentation—a hairline crack that forms a rectangular outline. It's a hidden panel! You manage to pry it open, revealing a narrow tunnel descending into darkness. The mechanical sound is louder here, echoing up from the depths.",
    options: [
      {
        text: 'Enter the tunnel cautiously',
        destination: 17,
        requirements: [],
        effects: ['BRAVE'],
      },
      {
        text: 'Shout into the tunnel to gauge its depth',
        destination: 18,
        requirements: [],
        effects: ['CAREFUL'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 14,
    description:
      'Using all your strength, you pound against the wall where the vibration is strongest. The wall resists your efforts, but you notice a small pipe protruding near the floor. Perhaps you can use it to your advantage.',
    options: [
      {
        text: 'Rip the pipe out to use as a tool or weapon',
        destination: 15,
        requirements: ['VOLITION'],
        effects: ['RESOURCEFUL'],
      },
      {
        text: 'Listen to the pipe for clues about what is beyond',
        destination: 18,
        requirements: [],
        effects: ['ATTENTIVE'],
      },
    ],
    requirements: ['VETERAN'],
    effects: [],
  },
  {
    id: 15,
    description:
      'You find a loose metal grate on the floor, partially submerged. Using it, you attempt to jam the pump mechanism. The mechanical whirring stutters, and for a moment, the water flow seems to slow. But then, an alarm sounds—a high-pitched siren that echoes through the cell.',
    options: [
      {
        text: 'Brace yourself for whatever comes next',
        destination: 19,
        requirements: [],
        effects: ['STEADFAST'],
      },
      {
        text: 'Use the chaos to find another escape route',
        destination: 13,
        requirements: ['LOGIC'],
        effects: ['QUICK THINKING'],
      },
    ],
    requirements: ['LOGIC'],
    effects: [],
  },
  {
    id: 16,
    description:
      'As you meditate, your mind drifts to memories of a place bathed in sunlight, far from here. Your body relaxes, and in this state, you become acutely aware of a faint draft coming from behind the sink. There might be an opening.',
    options: [
      {
        text: 'Investigate behind the sink',
        destination: 13,
        requirements: [],
        effects: ['AWARE'],
      },
      {
        text: 'Ignore it and continue meditating',
        destination: 20,
        requirements: [],
        effects: ['TRANSCENDENT'],
      },
    ],
    requirements: ['PACIFIST'],
    effects: [],
  },
  {
    id: 17,
    description:
      'You squeeze into the narrow tunnel, the sound of the mechanical whirring growing louder as you descend. The air is damp and the walls are slick. After a few meters, the tunnel opens up into a larger chamber illuminated by a dim, greenish light. In the center stands a large machine, its gears and pistons moving in a hypnotic rhythm.',
    options: [
      {
        text: 'Approach the machine and examine it',
        destination: 21,
        requirements: [],
        effects: ['CURIOUS'],
      },
      {
        text: 'Look for an exit from the chamber',
        destination: 22,
        requirements: [],
        effects: ['CAUTIOUS'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 18,
    description:
      'Your voice echoes as you shout into the darkness, but no response comes back. However, you notice that the echo is distorted, suggesting the space beyond is irregular—perhaps with multiple passages or obstacles.',
    options: [
      {
        text: 'Enter the tunnel, staying alert for traps',
        destination: 17,
        requirements: [],
        effects: ['ALERT'],
      },
      {
        text: 'Decide against entering the unknown and look for other options',
        destination: 19,
        requirements: [],
        effects: ['HESITANT'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 19,
    description:
      "The siren's wail is deafening, and the water begins to rise faster. Red lights flash, and a voice over an intercom announces: 'Containment breach in cell block B.' You realize that your actions have triggered a security protocol.",
    options: [
      {
        text: 'Prepare to confront whoever comes',
        destination: 23,
        requirements: ['VETERAN'],
        effects: ['READY'],
      },
      {
        text: 'Hide and observe',
        destination: 22,
        requirements: [],
        effects: ['STEALTHY'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 20,
    description:
      'As you continue to meditate, a profound sense of peace envelops you. Time seems to slow, and the rising water no longer feels threatening. You hear a voice within, whispering secrets of the universe. Is this enlightenment or delusion?',
    options: [
      {
        text: 'Embrace the experience fully',
        destination: 101,
        requirements: [],
        effects: ['ENLIGHTENED', 'GAME OVER'],
      },
      {
        text: 'Snap back to reality',
        destination: 19,
        requirements: [],
        effects: ['RESOLUTE'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 21,
    description:
      'The machine is a complex array of gears, wires, and pulsing lights. As you study it, you notice symbols etched into its surface—symbols that seem familiar. They match the fragmented visions from your dream. This machine is connected to you somehow.',
    options: [
      {
        text: 'You can not figure anything out. Try something else.',
        destination: 23,
        requirements: [],
        effects: [],
      },
      {
        text: 'Attempt to interface with the machine',
        destination: 24,
        requirements: ['SCHOLAR', 'LOGIC'],
        effects: ['CONNECTED'],
      },
      {
        text: 'Destroy the machine to stop the water',
        destination: 25,
        requirements: ['VETERAN', 'VOLITION'],
        effects: ['DESTRUCTIVE'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 22,
    description:
      "You search the chamber's perimeter and find a corridor leading away from the noise and water. The walls are lined with pipes and cables. This could be your way out, but who knows what lies ahead?",
    options: [
      {
        text: 'Follow the corridor cautiously',
        destination: 26,
        requirements: [],
        effects: ['HOPEFUL'],
      },
      {
        text: 'Return to the cell and try another approach',
        destination: 19,
        requirements: [],
        effects: ['UNDECIDED'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 23,
    description:
      'You position yourself near the door, ready to confront whoever—or whatever—comes through. The sound of footsteps splashing through water grows louder. The door slides open, and figures in hazmat suits rush in. They seem surprised to see you standing defiantly.',
    options: [
      {
        text: 'Attack before they can react',
        destination: 27,
        requirements: ['VETERAN'],
        effects: ['AGGRESSIVE'],
      },
      {
        text: 'Demand answers',
        destination: 28,
        requirements: [],
        effects: ['DEMANDING'],
      },
    ],
    requirements: ['VETERAN'],
    effects: [],
  },
  {
    id: 24,
    description:
      "As you touch the machine, a surge of energy courses through you. Visions flood your mind—memories of experiments, fragments of equations, faces of people you don't recognize but feel connected to. The machine hums louder, syncing with your heartbeat.",
    options: [
      {
        text: 'Let the machine absorb you completely',
        destination: 101,
        requirements: [],
        effects: ['SYNCHRONIZED', 'GAME OVER'],
      },
      {
        text: "Pull away before it's too late",
        destination: 22,
        requirements: ['VOLITION'],
        effects: ['ESCAPED'],
      },
    ],
    requirements: ['SCHOLAR', 'LOGIC'],
    effects: [],
  },
  {
    id: 25,
    description:
      'With determination, you begin to dismantle the machine, pulling wires and smashing components. The machine sputters and sparks, and the water flow begins to recede. But the destruction triggers another alarm. You hear voices shouting and footsteps approaching.',
    options: [
      {
        text: 'Hide and wait for an opportunity',
        destination: 22,
        requirements: [],
        effects: ['STEALTHY'],
      },
      {
        text: 'Confront whoever is coming',
        destination: 23,
        requirements: ['VETERAN'],
        effects: ['CONFRONTATIONAL'],
      },
    ],
    requirements: ['VETERAN', 'VOLITION'],
    effects: [],
  },
  {
    id: 26,
    description:
      'You walk down the corridor, the sounds of the cell fading behind you. The corridor splits into two paths—one leading upwards, the other descending further into the unknown.',
    options: [
      {
        text: 'Take the upward path',
        destination: 29,
        requirements: [],
        effects: ['OPTIMISTIC'],
      },
      {
        text: 'Take the downward path',
        destination: 30,
        requirements: [],
        effects: ['INQUISITIVE'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 27,
    description:
      'You launch yourself at the nearest figure, catching them off guard. A struggle ensues, but they outnumber you. Despite your combat skills, they overpower you and inject something into your neck. Your vision blurs, and darkness consumes you.',
    options: [
      {
        text: 'Succumb to the darkness',
        destination: 101,
        requirements: [],
        effects: ['OVERWHELMED', 'GAME OVER'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 28,
    description:
      "You shout over the noise, demanding to know what's happening. The figures exchange glances. One steps forward and says, 'You're not supposed to be awake. This complicates things.' Before you can respond, you feel a pinch as a needle enters your vein, and everything goes black.",
    options: [
      {
        text: 'Embrace the darkness',
        destination: 101,
        requirements: [],
        effects: ['UNCONSCIOUS', 'GAME OVER'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 29,
    description:
      'Choosing the path upwards, you climb a series of steps that seem to go on forever. Finally, you reach a door with a small window. Peering through, you see daylight—a way out. But the door is locked tight.',
    options: [
      {
        text: 'Search for a way to unlock the door',
        destination: 31,
        requirements: [],
        effects: ['DETERMINED'],
      },
      {
        text: 'Signal for help through the window',
        destination: 32,
        requirements: [],
        effects: ['HOPEFUL'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 30,
    description:
      'Descending further, the air grows colder. The passage opens into a vast underground cavern filled with strange machinery and glowing crystals. In the center stands a figure cloaked in shadows.',
    options: [
      {
        text: 'Approach the figure cautiously',
        destination: 33,
        requirements: [],
        effects: ['CURIOUS'],
      },
      {
        text: 'Hide and observe from a distance',
        destination: 34,
        requirements: [],
        effects: ['CAUTIOUS'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 31,
    description:
      "You inspect the door and find an electronic lock with a keypad. The numbers are worn, but you notice certain keys have more wear than others: 1, 3, 7, and 9. It's a clue to the code.",
    options: [
      {
        text: 'Attempt to guess the code',
        destination: 35,
        requirements: ['LOGIC'],
        effects: ['CALCULATING'],
      },
      {
        text: 'No time to guess. Look for another way to bypass the lock',
        destination: 36,
        requirements: [],
        effects: ['RESOURCEFUL'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 32,
    description:
      "You wave and shout through the window, but there's no response. The area outside seems deserted. Suddenly, you hear footsteps approaching from behind.",
    options: [
      {
        text: 'Turn around and confront whoever is coming',
        destination: 23,
        requirements: [],
        effects: ['DETERMINED'],
      },
      {
        text: 'Hide and prepare to defend yourself',
        destination: 22,
        requirements: [],
        effects: ['STEALTHY'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 33,
    description:
      "As you approach, the figure turns to face you. Eyes glowing, they speak in a voice that resonates within your mind: 'You were not meant to find this place.' The realization hits you—this is not a person, but something else entirely.",
    options: [
      {
        text: 'Engage in conversation to learn more',
        destination: 37,
        requirements: ['SCHOLAR'],
        effects: ['INQUISITIVE'],
      },
      {
        text: 'Flee back the way you came',
        destination: 26,
        requirements: [],
        effects: ['AFRAID'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 34,
    description:
      'From your hiding spot, you watch as the figure manipulates the machinery, causing the crystals to pulse with energy. The air vibrates with power. This could be your chance to learn something vital—or to escape unnoticed.',
    options: [
      {
        text: 'Continue observing silently',
        destination: 38,
        requirements: [],
        effects: ['PATIENT'],
      },
      {
        text: 'Sneak away before you are noticed',
        destination: 26,
        requirements: [],
        effects: ['STEALTHY'],
      },
    ],
    requirements: [],
    effects: [],
  },
  {
    id: 101,
    description:
      'Where there is a beginning, there is an end. This is no exception...',
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
