// lib/teams-config.ts

// Import React types
import type { FC, ComponentType, SVGProps } from "react";
// Import all the necessary logo components
import {
  BOS,
  NYK,
  MIL,
  CLE,
  ORL,
  IND,
  PHI,
  MIA, // East
  OKC,
  DEN,
  MIN,
  LAC,
  DAL,
  PHX,
  LAL,
  NOP, // West
} from "react-nba-logos";

// Define props combining standard SVG props with our custom 'size'
export type LogoProps = SVGProps<SVGSVGElement> & {
  // Inherit all standard SVG element props
  size?: string | number;
  // Add other specific props the library might use, e.g., color, style? Check docs if needed.
};

export type NBATeam = {
  id: string;
  name: string;
  conference: "East" | "West";
  seed: number;
  // --- Use ComponentType with the more flexible LogoProps ---
  logo: ComponentType<LogoProps>;
  primaryColor: string;
  secondaryColor: string;
};

// --- Define the explicit keys for the NbaTeamsStructure ---
export type NbaTeamKey =
  | "BOS"
  | "NYK"
  | "MIL"
  | "CLE"
  | "ORL"
  | "IND"
  | "PHI"
  | "MIA"
  | "OKC"
  | "DEN"
  | "MIN"
  | "LAC"
  | "DAL"
  | "PHX"
  | "LAL"
  | "NOP";

// The Record key type needs to match the keys used below
type NbaTeamsStructure = Record<NbaTeamKey, NBATeam>;

// Assign the explicit type
export const nbaTeams: NbaTeamsStructure = {
  // Eastern Conference (Assign imported logos directly)
  BOS: {
    id: "BOS",
    name: "Boston Celtics",
    conference: "East",
    seed: 1,
    logo: BOS,
    primaryColor: "#007A33",
    secondaryColor: "#BA9653",
  },
  NYK: {
    id: "NYK",
    name: "New York Knicks",
    conference: "East",
    seed: 2,
    logo: NYK,
    primaryColor: "#F58426",
    secondaryColor: "#006BB6",
  },
  MIL: {
    id: "MIL",
    name: "Milwaukee Bucks",
    conference: "East",
    seed: 3,
    logo: MIL,
    primaryColor: "#00471B",
    secondaryColor: "#EEE1C6",
  },
  CLE: {
    id: "CLE",
    name: "Cleveland Cavaliers",
    conference: "East",
    seed: 4,
    logo: CLE,
    primaryColor: "#860038",
    secondaryColor: "#041E42",
  },
  ORL: {
    id: "ORL",
    name: "Orlando Magic",
    conference: "East",
    seed: 5,
    logo: ORL,
    primaryColor: "#0077C0",
    secondaryColor: "#C4CED4",
  },
  IND: {
    id: "IND",
    name: "Indiana Pacers",
    conference: "East",
    seed: 6,
    logo: IND,
    primaryColor: "#002D62",
    secondaryColor: "#FDBB30",
  },
  PHI: {
    id: "PHI",
    name: "Philadelphia 76ers",
    conference: "East",
    seed: 7,
    logo: PHI,
    primaryColor: "#006BB6",
    secondaryColor: "#ED174C",
  },
  MIA: {
    id: "MIA",
    name: "Miami Heat",
    conference: "East",
    seed: 8,
    logo: MIA,
    primaryColor: "#98002E",
    secondaryColor: "#F9A01B",
  },

  // Western Conference
  OKC: {
    id: "OKC",
    name: "Oklahoma City Thunder",
    conference: "West",
    seed: 1,
    logo: OKC,
    primaryColor: "#007AC1",
    secondaryColor: "#EF3B24",
  },
  DEN: {
    id: "DEN",
    name: "Denver Nuggets",
    conference: "West",
    seed: 2,
    logo: DEN,
    primaryColor: "#0E2240",
    secondaryColor: "#FEC524",
  },
  MIN: {
    id: "MIN",
    name: "Minnesota Timberwolves",
    conference: "West",
    seed: 3,
    logo: MIN,
    primaryColor: "#0C2340",
    secondaryColor: "#78BE20",
  },
  LAC: {
    id: "LAC",
    name: "Los Angeles Clippers",
    conference: "West",
    seed: 4,
    logo: LAC,
    primaryColor: "#C8102E",
    secondaryColor: "#1D428A",
  },
  DAL: {
    id: "DAL",
    name: "Dallas Mavericks",
    conference: "West",
    seed: 5,
    logo: DAL,
    primaryColor: "#00538C",
    secondaryColor: "#B8C4CA",
  },
  PHX: {
    id: "PHX",
    name: "Phoenix Suns",
    conference: "West",
    seed: 6,
    logo: PHX,
    primaryColor: "#1D1160",
    secondaryColor: "#E56020",
  },
  LAL: {
    id: "LAL",
    name: "Los Angeles Lakers",
    conference: "West",
    seed: 7,
    logo: LAL,
    primaryColor: "#552583",
    secondaryColor: "#FDB927",
  },
  NOP: {
    id: "NOP",
    name: "New Orleans Pelicans",
    conference: "West",
    seed: 8,
    logo: NOP,
    primaryColor: "#0C2340",
    secondaryColor: "#C8102E",
  },
};

// --- Define types for Bracket ---
export type BracketKey =
  | "E1"
  | "E2"
  | "E3"
  | "E4"
  | "W1"
  | "W2"
  | "W3"
  | "W4"
  | "E5"
  | "E6"
  | "W5"
  | "W6"
  | "E7"
  | "W7"
  | "F1";

// Use the specific NbaTeamKey type derived from NbaTeamsStructure keys
export type TeamKey = NbaTeamKey;

export type MatchupData = {
  round: number;
  matchupId: BracketKey;
  team1: TeamKey | null;
  team2: TeamKey | null;
  nextMatchup: BracketKey | null;
  winnerPosition: "team1" | "team2" | null;
};

export type BracketStructure = Record<BracketKey, MatchupData>;

// --- Initial Bracket ---
export const initialBracket: BracketStructure = {
  // (Make sure keys like "BOS", "MIA" etc. are valid NbaTeamKey)
  E1: {
    round: 1,
    matchupId: "E1",
    team1: "BOS",
    team2: "MIA",
    nextMatchup: "E5",
    winnerPosition: "team1",
  },
  E2: {
    round: 1,
    matchupId: "E2",
    team1: "CLE",
    team2: "ORL",
    nextMatchup: "E5",
    winnerPosition: "team2",
  },
  E3: {
    round: 1,
    matchupId: "E3",
    team1: "MIL",
    team2: "IND",
    nextMatchup: "E6",
    winnerPosition: "team1",
  },
  E4: {
    round: 1,
    matchupId: "E4",
    team1: "NYK",
    team2: "PHI",
    nextMatchup: "E6",
    winnerPosition: "team2",
  },
  W1: {
    round: 1,
    matchupId: "W1",
    team1: "OKC",
    team2: "NOP",
    nextMatchup: "W5",
    winnerPosition: "team1",
  },
  W2: {
    round: 1,
    matchupId: "W2",
    team1: "LAC",
    team2: "DAL",
    nextMatchup: "W5",
    winnerPosition: "team2",
  },
  W3: {
    round: 1,
    matchupId: "W3",
    team1: "MIN",
    team2: "PHX",
    nextMatchup: "W6",
    winnerPosition: "team1",
  },
  W4: {
    round: 1,
    matchupId: "W4",
    team1: "DEN",
    team2: "LAL",
    nextMatchup: "W6",
    winnerPosition: "team2",
  },
  E5: {
    round: 2,
    matchupId: "E5",
    team1: null,
    team2: null,
    nextMatchup: "E7",
    winnerPosition: "team1",
  },
  E6: {
    round: 2,
    matchupId: "E6",
    team1: null,
    team2: null,
    nextMatchup: "E7",
    winnerPosition: "team2",
  },
  W5: {
    round: 2,
    matchupId: "W5",
    team1: null,
    team2: null,
    nextMatchup: "W7",
    winnerPosition: "team1",
  },
  W6: {
    round: 2,
    matchupId: "W6",
    team1: null,
    team2: null,
    nextMatchup: "W7",
    winnerPosition: "team2",
  },
  E7: {
    round: 3,
    matchupId: "E7",
    team1: null,
    team2: null,
    nextMatchup: "F1",
    winnerPosition: "team1",
  },
  W7: {
    round: 3,
    matchupId: "W7",
    team1: null,
    team2: null,
    nextMatchup: "F1",
    winnerPosition: "team2",
  },
  F1: {
    round: 4,
    matchupId: "F1",
    team1: null,
    team2: null,
    nextMatchup: null,
    winnerPosition: null,
  },
};

// --- Helper Functions (with types) ---

// This function merges new team data, ensuring structure matches NBATeam
export function updatePlayoffTeams(
  currentTeams: NbaTeamsStructure,
  newTeams: Partial<NbaTeamsStructure> // Allow partial updates using the correct structure
): NbaTeamsStructure {
  // Return the full structure type
  // Ensure proper merging if needed, shallow spread replaces top-level keys
  return { ...currentTeams, ...newTeams };
}

// This function merges new bracket data, assuming structure matches MatchupData
export function updateBracketStructure(
  currentBracket: BracketStructure,
  newBracketData: Partial<BracketStructure> // Allow partial updates
): BracketStructure {
  // Deep merge might be needed if updating nested properties,
  // but for replacing entire matchup objects, shallow merge is fine.
  return { ...currentBracket, ...newBracketData };
}
