// src/data/quizQuestions.ts

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'How many seats are there in the Lok Sabha?',
    options: ['450', '525', '543', '600'],
    correct: 2,
    explanation: 'The Lok Sabha has 543 directly elected seats. A party needs 272+ seats to form a majority government.',
    category: 'Structure',
    difficulty: 'Easy',
  },
  {
    id: 2,
    question: 'What does "MCC" stand for in Indian elections?',
    options: ['Mandatory Candidate Compliance', 'Model Code of Conduct', 'Minimum Campaign Cost', 'Maximum Candidate Count'],
    correct: 1,
    explanation: 'MCC stands for Model Code of Conduct — guidelines issued by ECI to regulate political parties and candidates during elections.',
    category: 'Regulation',
    difficulty: 'Easy',
  },
  {
    id: 3,
    question: 'Which finger is marked with indelible ink after voting?',
    options: ['Right index finger', 'Left index finger', 'Left thumb', 'Right thumb'],
    correct: 1,
    explanation: 'The left index finger is marked with indelible ink to prevent double-voting. The ink is manufactured in Mysore, Karnataka.',
    category: 'Process',
    difficulty: 'Easy',
  },
  {
    id: 4,
    question: 'What is the minimum age to vote in India?',
    options: ['16', '18', '21', '25'],
    correct: 1,
    explanation: 'The voting age in India is 18 years, as established by the 61st Constitutional Amendment Act of 1988.',
    category: 'Voter',
    difficulty: 'Easy',
  },
  {
    id: 5,
    question: 'VVPAT paper slip is visible to the voter for how many seconds?',
    options: ['3 seconds', '5 seconds', '7 seconds', '10 seconds'],
    correct: 2,
    explanation: 'The VVPAT paper slip showing the candidate symbol is visible through a transparent window for 7 seconds before falling into a sealed compartment.',
    category: 'Technology',
    difficulty: 'Medium',
  },
  {
    id: 6,
    question: 'What is the security deposit for a Lok Sabha candidate in large states?',
    options: ['₹10,000', '₹15,000', '₹25,000', '₹50,000'],
    correct: 2,
    explanation: 'The security deposit is ₹25,000 for Lok Sabha candidates (₹12,500 for SC/ST candidates). It is forfeited if the candidate gets less than 1/6th of total valid votes.',
    category: 'Candidate',
    difficulty: 'Medium',
  },
  {
    id: 7,
    question: 'NOTA was introduced in Indian elections in which year?',
    options: ['2009', '2011', '2013', '2014'],
    correct: 2,
    explanation: 'NOTA (None of the Above) was introduced in 2013 after a Supreme Court order in the PUCL vs Union of India case.',
    category: 'Technology',
    difficulty: 'Medium',
  },
  {
    id: 8,
    question: 'Under which Article of the Constitution is the Election Commission of India established?',
    options: ['Article 148', 'Article 280', 'Article 315', 'Article 324'],
    correct: 3,
    explanation: 'Article 324 of the Constitution establishes the Election Commission of India as the superintending, directing, and controlling authority for elections.',
    category: 'Institution',
    difficulty: 'Hard',
  },
  {
    id: 9,
    question: 'What is the campaign expenditure limit for a Lok Sabha candidate in a large state?',
    options: ['₹50 lakh', '₹70 lakh', '₹95 lakh', '₹1.5 crore'],
    correct: 2,
    explanation: 'As of 2022, the campaign expenditure limit for Lok Sabha candidates in larger states is ₹95 lakh per candidate, monitored by ECI expenditure observers.',
    category: 'Finance',
    difficulty: 'Hard',
  },
  {
    id: 10,
    question: 'Which body conducts redrawing of constituency boundaries in India?',
    options: ['Election Commission', 'Delimitation Commission', 'Planning Commission', 'Law Commission'],
    correct: 1,
    explanation: 'The Delimitation Commission is constituted by the President of India to redraw parliamentary and state legislature constituency boundaries based on census data.',
    category: 'Structure',
    difficulty: 'Medium',
  },
  {
    id: 11,
    question: 'An election petition must be filed within how many days of result declaration?',
    options: ['30 days', '45 days', '60 days', '90 days'],
    correct: 1,
    explanation: 'An election petition challenging the result must be filed in the High Court within 45 days of the declaration of results.',
    category: 'Process',
    difficulty: 'Hard',
  },
  {
    id: 12,
    question: 'What form is used for first-time voter registration?',
    options: ['Form 4', 'Form 6', 'Form 8', 'Form 12'],
    correct: 1,
    explanation: 'Form 6 is used to apply for inclusion in the electoral roll for the first time or to transfer registration when moving to a new constituency.',
    category: 'Voter',
    difficulty: 'Easy',
  },
  {
    id: 13,
    question: 'The "Silence Period" before polling day lasts for how long?',
    options: ['24 hours', '36 hours', '48 hours', '72 hours'],
    correct: 2,
    explanation: 'The Silence Period is 48 hours before the close of polling, during which no election campaigning, rallies, or canvassing is permitted.',
    category: 'Campaign',
    difficulty: 'Medium',
  },
  {
    id: 14,
    question: 'How many members does India\'s Rajya Sabha have (elected + nominated)?',
    options: ['245', '250', '260', '275'],
    correct: 1,
    explanation: 'The Rajya Sabha has a maximum strength of 250: 238 elected by state/UT legislative assemblies and 12 nominated by the President.',
    category: 'Legislature',
    difficulty: 'Medium',
  },
  {
    id: 15,
    question: 'Under which Schedule of the Constitution does the Anti-Defection Law fall?',
    options: ['Seventh Schedule', 'Eighth Schedule', 'Ninth Schedule', 'Tenth Schedule'],
    correct: 3,
    explanation: 'The Anti-Defection Law is contained in the Tenth Schedule of the Indian Constitution, added by the 52nd Constitutional Amendment in 1985.',
    category: 'Governance',
    difficulty: 'Hard',
  },
]

export const quizCategories: string[] = ['All', 'Structure', 'Regulation', 'Voter', 'Technology', 'Institution', 'Candidate', 'Finance', 'Process', 'Campaign', 'Legislature', 'Governance']
export const quizDifficulties: string[] = ['All', 'Easy', 'Medium', 'Hard']
