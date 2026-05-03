// src/data/glossaryTerms.ts

export interface GlossaryTerm {
  id: number
  term: string
  category: string
  definition: string
  example?: string
}

export const glossaryTerms: GlossaryTerm[] = [
  { id: 1, term: 'Election Commission of India (ECI)', category: 'Institution', definition: 'A permanent constitutional body under Article 324, responsible for administering elections for Parliament and state legislatures.' },
  { id: 2, term: 'Chief Election Commissioner (CEC)', category: 'Institution', definition: 'Head of the ECI, appointed by the President of India. Has the status of a Supreme Court judge.' },
  { id: 3, term: 'Model Code of Conduct (MCC)', category: 'Regulation', definition: 'Guidelines issued by ECI to regulate political parties and candidates during elections. Comes into effect upon election announcement.', example: 'Government cannot announce new schemes under MCC.' },
  { id: 4, term: 'Election Observer', category: 'Institution', definition: 'IAS/IPS officers deployed by ECI to monitor free and fair conduct. Types: General, Expenditure, and Police Observers.' },
  { id: 5, term: 'Returning Officer (RO)', category: 'Institution', definition: 'Government official responsible for conducting elections in a constituency from nominations to result declaration.' },
  { id: 6, term: 'Electoral Photo Identity Card (EPIC)', category: 'Voter', definition: 'The primary voter ID card issued by ECI, used to cast votes at polling booths.' },
  { id: 7, term: 'Electoral Roll', category: 'Voter', definition: 'Official list of all registered voters in a constituency, updated periodically by the BLO.' },
  { id: 8, term: 'Booth Level Officer (BLO)', category: 'Voter', definition: 'Government official assigned to a polling booth area, responsible for maintaining the electoral roll.' },
  { id: 9, term: 'Form 6', category: 'Voter', definition: 'Application form for first-time voter registration or enrolling in a new constituency.' },
  { id: 10, term: 'Form 7', category: 'Voter', definition: 'Form to object to or request deletion of a name from the electoral roll.' },
  { id: 11, term: 'Form 8', category: 'Voter', definition: 'Form to apply for corrections in existing voter registration (name, address, photo).' },
  { id: 12, term: 'Indelible Ink', category: 'Voter', definition: 'Special chemical ink applied on the left index finger after voting to prevent double-voting. Manufactured in Mysore, Karnataka.' },
  { id: 13, term: 'Postal Ballot', category: 'Voter', definition: 'A ballot cast remotely by service voters, senior citizens (85+), persons with disabilities, and essential service workers.' },
  { id: 14, term: 'Electronic Voting Machine (EVM)', category: 'Technology', definition: 'A standalone device to cast and record votes electronically. Consists of a Control Unit (CU) and Ballot Unit (BU).' },
  { id: 15, term: 'Voter Verifiable Paper Audit Trail (VVPAT)', category: 'Technology', definition: 'Device attached to EVM that prints a paper slip of the vote for the voter to verify. Visible for 7 seconds.' },
  { id: 16, term: 'None of the Above (NOTA)', category: 'Technology', definition: 'EVM option introduced in 2013 to register disapproval of all candidates without spoiling the ballot.' },
  { id: 17, term: 'Lok Sabha', category: 'Legislature', definition: "Lower house of India's Parliament with 543 directly elected constituencies. Elected every 5 years." },
  { id: 18, term: 'Rajya Sabha', category: 'Legislature', definition: "Upper house with 238 elected + 12 nominated members. Members elected by state legislatures for 6-year terms." },
  { id: 19, term: 'Parliamentary Constituency', category: 'Structure', definition: 'A geographic area electing one MP to the Lok Sabha. There are 543 such constituencies.' },
  { id: 20, term: 'Assembly Constituency', category: 'Structure', definition: 'An area electing one MLA to a state legislature. Each parliamentary constituency has several assembly constituencies.' },
  { id: 21, term: 'Reserved Constituency', category: 'Structure', definition: 'A constituency reserved for SC/ST candidates as mandated by the Constitution.' },
  { id: 22, term: 'Delimitation', category: 'Structure', definition: 'Redrawing constituency boundaries based on the latest census, conducted by the Delimitation Commission.' },
  { id: 23, term: 'Affidavit', category: 'Candidate', definition: 'Sworn statement by candidates disclosing criminal background, educational qualifications, assets, and liabilities. Mandatory for nomination.' },
  { id: 24, term: 'Security Deposit', category: 'Candidate', definition: 'Monetary deposit paid by candidates at nomination. Forfeited if they fail to secure ≥1/6 of valid votes. ₹25,000 for LS seats.' },
  { id: 25, term: 'Nomination Paper', category: 'Candidate', definition: 'Official document filed by a candidate to participate in an election, supported by proposers/seconders.' },
  { id: 26, term: 'Scrutiny', category: 'Candidate', definition: 'Process by which the Returning Officer checks nomination papers for validity and candidate eligibility.' },
  { id: 27, term: 'Recognized National Party', category: 'Political Party', definition: 'Party recognized by ECI having ≥6% votes in 4+ states plus 4 LS seats, or 2% of LS seats from 3 states.', example: 'BJP, INC, BSP, CPI(M), AAP, NCP.' },
  { id: 28, term: 'Independent Candidate', category: 'Candidate', definition: 'A candidate not affiliated with any registered political party.' },
  { id: 29, term: 'Mock Poll', category: 'Process', definition: 'Test poll of at least 50 votes before actual polling to verify EVM functionality.' },
  { id: 30, term: 'Presiding Officer', category: 'Process', definition: 'Official in charge of a polling station, verifying voter identity and operating the EVM Control Unit.' },
  { id: 31, term: 'Polling Agent', category: 'Process', definition: "Representative of a candidate who observes polling at a booth to ensure fairness." },
  { id: 32, term: 'Form 20', category: 'Process', definition: 'Official result sheet issued by the Returning Officer declaring final vote count and winner.' },
  { id: 33, term: 'Tendered Vote', category: 'Process', definition: 'Vote given to someone whose vote was already cast by another person. Recorded separately, not counted in EVM.' },
  { id: 34, term: 'Silence Period', category: 'Campaign', definition: '48-hour period before polling during which no election campaigning is allowed.' },
  { id: 35, term: 'Exit Poll', category: 'Campaign', definition: 'Survey of voters after casting votes, asking whom they voted for. Publication banned until final phase closes.' },
  { id: 36, term: 'Opinion Poll', category: 'Campaign', definition: 'Pre-election survey gauging voter preferences. Banned from publication 48 hours before polling.' },
  { id: 37, term: 'Campaign Expenditure Limit', category: 'Finance', definition: 'Maximum campaign spending set by ECI. For LS candidates in large states: ₹95 lakh.' },
  { id: 38, term: 'Electoral Bond', category: 'Finance', definition: 'Financial instrument for political donations, introduced 2018, struck down by Supreme Court in 2024.' },
  { id: 39, term: 'Anti-Defection Law', category: 'Governance', definition: 'Tenth Schedule provision disqualifying elected members who voluntarily give up party membership or vote against party whip.' },
  { id: 40, term: 'By-Election (Bye-Poll)', category: 'Process', definition: 'Election held to fill a seat vacated mid-term due to death, resignation, or disqualification.' },
  { id: 41, term: 'Floor Test', category: 'Governance', definition: 'Vote of confidence to determine if the government has majority support of elected members.' },
  { id: 42, term: 'Voter Turnout', category: 'Statistics', definition: "Percentage of registered voters who cast their vote. India's Lok Sabha average is ~65–70%." },
  { id: 43, term: 'Election Petition', category: 'Process', definition: 'Legal challenge to election outcome filed in High Court within 45 days of results.' },
  { id: 44, term: 'Snap Election', category: 'Process', definition: 'Election called before scheduled end of legislature term, typically after a no-confidence vote.' },
  { id: 45, term: 'Control Unit (CU)', category: 'Technology', definition: 'Part of EVM managed by presiding officer. Records and stores votes and controls the Ballot Unit.' },
  { id: 46, term: 'Ballot Unit (BU)', category: 'Technology', definition: 'Voting component of EVM placed in the voting compartment with candidate name/symbol buttons.' },
  { id: 47, term: 'Rajya Sabha Biennial Election', category: 'Legislature', definition: 'One-third of Rajya Sabha seats contested every 2 years on a rotational basis.' },
  { id: 48, term: 'State Party', category: 'Political Party', definition: 'Party recognized in a specific state based on vote share or seat wins. Gets reserved symbol in that state.' },
  { id: 49, term: 'Withdrawal of Candidacy', category: 'Candidate', definition: 'Period after scrutiny when a candidate can withdraw their nomination, typically 2 weeks before polling.' },
  { id: 50, term: 'Postal Ballot (ETPB)', category: 'Technology', definition: 'Electronic Transmission of Postal Ballots — allows service voters to receive/return ballots electronically.' },
  { id: 51, term: 'Counting Agent', category: 'Process', definition: "Candidate's representative present at the counting center to witness vote tallying." },
  { id: 52, term: 'Presiding Officer\'s Log', category: 'Process', definition: 'A detailed record maintained by the presiding officer of all events at the polling station.' },
  { id: 53, term: 'Booth Capturing', category: 'Regulation', definition: 'Illegal act of taking control of a polling booth to manipulate voting. A cognizable offence under election law.' },
  { id: 54, term: 'Paid News', category: 'Regulation', definition: 'News content published for consideration (money/favors) to influence elections, without disclosure. Prohibited by ECI.' },
  { id: 55, term: 'Voter Slip', category: 'Voter', definition: 'A slip issued to voters (by BLO or parties) showing their voter serial number, booth address, and polling time.' },
]

export const glossaryCategories: string[] = [
  'All', 'Institution', 'Regulation', 'Voter', 'Technology', 'Legislature',
  'Structure', 'Candidate', 'Political Party', 'Process', 'Finance',
  'Campaign', 'Governance', 'Statistics',
]
