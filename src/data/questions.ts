export interface Question {
  id: string;
  text: string;
  level: number; // 1-4
  index: number; // 0-based within level
}

// Level I – KNOW THYSELF
export const level1Questions: Question[] = [
  {
    id: 'L1_Q1',
    text: 'What feels like play to you — but looks like work to everyone else?',
    level: 1,
    index: 0,
  },
  {
    id: 'L1_Q2',
    text: 'Think of a project you felt genuinely proud of — not the outcome, but the work itself. What made it feel that way?',
    level: 1,
    index: 1,
  },
  {
    id: 'L1_Q3',
    text: 'Why does the transformation you create matter to you beyond money?',
    level: 1,
    index: 2,
  },
  {
    id: 'L1_Q4',
    text: 'If you could only work with 5 clients forever, what would those projects look like?',
    level: 1,
    index: 3,
  },
  {
    id: 'L1_Q5',
    text: 'If you earned the same income in half the hours, what would you do with the rest?',
    level: 1,
    index: 4,
  },
  {
    id: 'L1_Q6',
    text: 'What would you regret NOT doing with this business in 5 years?',
    level: 1,
    index: 5,
  },
];

// Level II – KNOW THY WORK
export const level2Questions: Question[] = [
  {
    id: 'L2_Q1',
    text: 'Describe the specific result you create for your best clients — in one sentence, no jargon.',
    level: 2,
    index: 0,
  },
  {
    id: 'L2_Q2',
    text: 'What do you do that your clients could never do themselves, even with the same tools?',
    level: 2,
    index: 1,
  },
  {
    id: 'L2_Q3',
    text: 'When a client says "thank you," what are they almost always thanking you for?',
    level: 2,
    index: 2,
  },
  {
    id: 'L2_Q4',
    text: "What's the most underrated part of your service that clients only appreciate after the fact?",
    level: 2,
    index: 3,
  },
  {
    id: 'L2_Q5',
    text: "If a client described your work to a friend, what would they say? What would they leave out?",
    level: 2,
    index: 4,
  },
  {
    id: 'L2_Q6',
    text: "What's something you do every time, without being asked, that most people in your field skip?",
    level: 2,
    index: 5,
  },
];

// Level III – KNOW THY MARKET
export const level3Questions: Question[] = [
  {
    id: 'L3_Q1',
    text: 'Who is the one type of client that always gets the best result from working with you?',
    level: 3,
    index: 0,
  },
  {
    id: 'L3_Q2',
    text: 'What does your ideal client believe about their problem — before they meet you — that turns out to be wrong?',
    level: 3,
    index: 1,
  },
  {
    id: 'L3_Q3',
    text: "What are they actually trying to buy when they hire you? (Hint: it's never the deliverable.)",
    level: 3,
    index: 2,
  },
  {
    id: 'L3_Q4',
    text: 'What frustrates them most about every other option they tried before finding you?',
    level: 3,
    index: 3,
  },
  {
    id: 'L3_Q5',
    text: 'Where does your ideal client go when they are looking for answers — and what are they searching for?',
    level: 3,
    index: 4,
  },
  {
    id: 'L3_Q6',
    text: 'In 3 years, what does life look like for a client who chose you and fully committed to the work?',
    level: 3,
    index: 5,
  },
];

// Level IV – KNOW THY PEOPLE
export const level4Questions: Question[] = [
  {
    id: 'L4_Q1',
    text: "What's the single biggest reason someone who needs you doesn't buy from you?",
    level: 4,
    index: 0,
  },
  {
    id: 'L4_Q2',
    text: "What do you do differently from everyone else in your space — and why don't you talk about it more?",
    level: 4,
    index: 1,
  },
  {
    id: 'L4_Q3',
    text: 'If you had to cut your offer to its most essential form — one thing, one person, one outcome — what would it be?',
    level: 4,
    index: 2,
  },
  {
    id: 'L4_Q4',
    text: "What's the message you've been afraid to say publicly that you know is true?",
    level: 4,
    index: 3,
  },
  {
    id: 'L4_Q5',
    text: 'Who are you NOT for — and why does naming that actually attract your best clients?',
    level: 4,
    index: 4,
  },
  {
    id: 'L4_Q6',
    text: 'If you could only send one piece of content to your ideal client every week for a year, what would you send them?',
    level: 4,
    index: 5,
  },
];

export const ALL_QUESTIONS: Question[] = [
  ...level1Questions,
  ...level2Questions,
  ...level3Questions,
  ...level4Questions,
];

export const QUESTIONS_PER_LEVEL = 6;
export const TOTAL_LEVELS = 4;
export const TOTAL_QUESTIONS = ALL_QUESTIONS.length; // 24

export function getLevelQuestions(level: number): Question[] {
  return ALL_QUESTIONS.filter(q => q.level === level);
}

export const LEVEL_NAMES: Record<number, string> = {
  1: 'KNOW THYSELF',
  2: 'KNOW THY WORK',
  3: 'KNOW THY MARKET',
  4: 'KNOW THY PEOPLE',
};

export const LEVEL_COMPLETE_MESSAGES: Record<number, string> = {
  1: '"You are beginning to see."',
  2: '"The work was always worthy. This helps you see that differently."',
  3: '"The right work, in the right place."',
  4: '', // Level 4 goes straight to Quest Complete
};
