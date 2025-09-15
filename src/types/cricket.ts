export interface Player {
  id: string;
  name: string;
  role: 'Batsman' | 'Bowler' | 'Allrounder';
  battingStats: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate: number;
    isOut: boolean;
    dismissalType?: string;
    dismissedBy?: string;
  };
  bowlingStats: {
    overs: number;
    balls: number;
    runs: number;
    wickets: number;
    economyRate: number;
  };
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  totalBalls: number;
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
  };
}

export interface MatchSettings {
  totalOvers: number;
  playersPerTeam: number;
  maxOversPerBowler: number;
}

export interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  tossWinner: string;
  tossDecision: 'Batting' | 'Bowling';
  battingTeam: Team;
  bowlingTeam: Team;
  currentInnings: 1 | 2;
  settings: MatchSettings;
  isComplete: boolean;
  winner?: string;
  winMargin?: string;
}

export interface Ball {
  runs: number;
  isExtra: boolean;
  extraType?: 'wide' | 'noball' | 'bye' | 'legbye';
  isWicket: boolean;
  wicketType?: string;
  batsmanOnStrike: string;
  bowler: string;
}

export interface CurrentBatsmen {
  striker: Player;
  nonStriker: Player;
}