// src/data/electionStages.ts

export interface ElectionStage {
  id: number
  phase: string
  title: string
  icon: string
  duration: string
  description: string
  details: string[]
  color: string
}

/**
 * Complete timeline of India's General Election process
 * Each stage has: id, phase, title, description, icon, duration, details[]
 */
export const electionStages: ElectionStage[] = [
  {
    id: 1,
    phase: 'Pre-Election',
    title: 'Election Commission Announcement',
    icon: 'Megaphone',
    duration: '1 Day',
    description:
      'The Election Commission of India (ECI) announces the election schedule, including voting dates, number of phases, and the Model Code of Conduct (MCC) activation.',
    details: [
      'Schedule of elections is declared by the full ECI bench',
      'Model Code of Conduct (MCC) comes into immediate effect',
      'Governs all political parties, candidates, and the ruling government',
      'Typically announced 4–6 weeks before the first polling date',
    ],
    color: '#FF9933',
  },
  {
    id: 2,
    phase: 'Pre-Election',
    title: 'Model Code of Conduct (MCC)',
    icon: 'ClipboardList',
    duration: '6–8 Weeks',
    description:
      'A set of guidelines issued by ECI to govern the conduct of political parties and candidates during elections, ensuring a free and fair process.',
    details: [
      'No new government schemes or projects can be announced',
      'Parties must not use government machinery for campaigns',
      'Hate speech and communal/casteist appeals are prohibited',
      'Polling day is observed as a dry day (no alcohol)',
    ],
    color: '#1a56db',
  },
  {
    id: 3,
    phase: 'Pre-Election',
    title: 'Voter List Finalization',
    icon: 'FileEdit',
    duration: '4 Weeks',
    description:
      'Electoral rolls are finalized with additions, deletions, and corrections. Citizens can verify their name on the voter list (EPIC).',
    details: [
      'Electoral Photo Identity Card (EPIC) is the primary voter ID',
      'Voters can check their name at voters.eci.gov.in',
      'BLO (Booth Level Officer) conducts door-to-door verification',
      '12 alternate documents accepted if EPIC is unavailable',
    ],
    color: '#0ea5e9',
  },
  {
    id: 4,
    phase: 'Pre-Election',
    title: 'Candidate Nomination',
    icon: 'FolderOpen',
    duration: '2 Weeks',
    description:
      'Candidates file their nomination papers, pay a security deposit, and submit affidavits disclosing assets, liabilities, and criminal cases.',
    details: [
      'Security deposit: ₹25,000 for LS; ₹10,000 for State Assembly (SC/ST half)',
      'Refunded if candidate secures ≥ 1/6th of valid votes polled',
      'Affidavit must disclose criminal antecedents, assets, and liabilities',
      'Scrutiny of nominations follows to check eligibility',
    ],
    color: '#7c3aed',
  },
  {
    id: 5,
    phase: 'Pre-Election',
    title: 'Election Campaign',
    icon: 'Speaker',
    duration: 'Until 48 hrs before polling',
    description:
      'Political parties and candidates campaign to persuade voters. Campaign expenditure is strictly monitored by election observers.',
    details: [
      'Expenditure limit for LS candidates: ₹95 lakh (large states)',
      'ECI deploys expenditure observers to monitor spending',
      'Campaigning must stop 48 hours before voting (Silence Period)',
      'Opinion polls are banned 48 hours before voting',
    ],
    color: '#059669',
  },
  {
    id: 6,
    phase: 'Election Day',
    title: 'Polling Day',
    icon: 'Vote',
    duration: '1 Day (typically 7 AM – 6 PM)',
    description:
      'Eligible voters cast their vote at their designated polling booth using an Electronic Voting Machine (EVM) + VVPAT.',
    details: [
      'Voter shows EPIC or any of 12 alternate photo IDs',
      'Voter\'s index finger is marked with indelible ink',
      'EVM records the vote; VVPAT provides a paper slip for 7 seconds',
      'Mock poll is conducted before polling begins to verify EVM accuracy',
    ],
    color: '#1a56db',
  },
  {
    id: 7,
    phase: 'Election Day',
    title: 'EVM & VVPAT',
    icon: 'Monitor',
    duration: 'Ongoing',
    description:
      'Electronic Voting Machines are used for secure voting. The Voter Verifiable Paper Audit Trail (VVPAT) lets voters verify their vote was correctly recorded.',
    details: [
      'EVM consists of Ballot Unit (BU) + Control Unit (CU)',
      'VVPAT prints a paper slip showing the candidate symbol',
      'Paper slip is visible for 7 seconds before dropping into a sealed compartment',
      'VVPAT count is done for 5 randomly selected booths per constituency',
    ],
    color: '#0ea5e9',
  },
  {
    id: 8,
    phase: 'Post-Election',
    title: 'Counting Day',
    icon: 'Hash',
    duration: '1 Day',
    description:
      'On the counting day, votes are tallied at Returning Officer\'s designated counting centers under strict security and observer presence.',
    details: [
      'Postal ballots are counted first',
      'EVM votes are counted round-by-round',
      'Candidates / agents can request re-totaling',
      'Form 20 (final result) is issued by the Returning Officer',
    ],
    color: '#d97706',
  },
  {
    id: 9,
    phase: 'Post-Election',
    title: 'Result Declaration & Formation of Government',
    icon: 'Landmark',
    duration: '2–4 Weeks',
    description:
      'The winning party or coalition forms the government. The President invites the majority party leader to form the government.',
    details: [
      'Simple majority = 272+ seats in Lok Sabha (out of 543)',
      'If no clear majority, coalition negotiations begin',
      'President invites leader who can prove majority',
      'Floor test is conducted if majority is disputed',
    ],
    color: '#138808',
  },
]

export const electionPhases: string[] = ['Pre-Election', 'Election Day', 'Post-Election']
