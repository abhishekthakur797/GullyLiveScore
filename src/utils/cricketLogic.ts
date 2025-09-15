import { Player, Team, Ball, MatchSettings } from '../types/cricket';

export const createPlayer = (name: string, role: 'Batsman' | 'Bowler' | 'Allrounder'): Player => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  role,
  battingStats: {
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    strikeRate: 0,
    isOut: false,
  },
  bowlingStats: {
    overs: 0,
    balls: 0,
    runs: 0,
    wickets: 0,
    economyRate: 0,
  },
});

export const createTeam = (name: string, players: Player[]): Team => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  players,
  totalRuns: 0,
  totalWickets: 0,
  totalOvers: 0,
  totalBalls: 0,
  extras: {
    wides: 0,
    noBalls: 0,
    byes: 0,
    legByes: 0,
  },
});

export const updateBattingStats = (player: Player, ball: Ball): Player => {
  const updatedPlayer = { ...player };
  
  if (!ball.isExtra || ball.extraType === 'bye' || ball.extraType === 'legbye') {
    updatedPlayer.battingStats.balls += 1;
  }
  
  if (!ball.isExtra) {
    updatedPlayer.battingStats.runs += ball.runs;
    if (ball.runs === 4) updatedPlayer.battingStats.fours += 1;
    if (ball.runs === 6) updatedPlayer.battingStats.sixes += 1;
  }
  
  updatedPlayer.battingStats.strikeRate = 
    updatedPlayer.battingStats.balls > 0 
      ? (updatedPlayer.battingStats.runs / updatedPlayer.battingStats.balls) * 100 
      : 0;
  
  return updatedPlayer;
};

export const updateBowlingStats = (player: Player, ball: Ball): Player => {
  const updatedPlayer = { ...player };
  
  if (!ball.isExtra || ball.extraType === 'bye' || ball.extraType === 'legbye') {
    updatedPlayer.bowlingStats.balls += 1;
    updatedPlayer.bowlingStats.overs = Math.floor(updatedPlayer.bowlingStats.balls / 6) + 
      (updatedPlayer.bowlingStats.balls % 6) / 10;
  }
  
  updatedPlayer.bowlingStats.runs += ball.runs;
  if (ball.isWicket) updatedPlayer.bowlingStats.wickets += 1;
  
  updatedPlayer.bowlingStats.economyRate = 
    updatedPlayer.bowlingStats.overs > 0 
      ? updatedPlayer.bowlingStats.runs / updatedPlayer.bowlingStats.overs 
      : 0;
  
  return updatedPlayer;
};

export const shouldChangeStrike = (ball: Ball): boolean => {
  // Change strike on odd runs, or end of over (handled separately)
  return !ball.isExtra && ball.runs % 2 === 1;
};

export const isOverComplete = (ballsInOver: number): boolean => {
  return ballsInOver >= 6;
};

export const canBowlerContinue = (bowler: Player, settings: MatchSettings): boolean => {
  const oversBowled = bowler.bowlingStats.overs;
  return oversBowled < settings.maxOversPerBowler;
};

export const getAvailableBowlers = (team: Team, currentBowler: Player, settings: MatchSettings): Player[] => {
  return team.players.filter(player => 
    player.id !== currentBowler.id && 
    canBowlerContinue(player, settings)
  );
};

export const getNextBatsman = (team: Team): Player | null => {
  const availableBatsmen = team.players.filter(player => 
    !player.battingStats.isOut && 
    player.battingStats.balls === 0
  );
  return availableBatsmen.length > 0 ? availableBatsmen[0] : null;
};

export const generateTeamLogos = (): string[] => {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  return colors.map(color => color);
};

export const calculateWinMargin = (battingTeam: Team, bowlingTeam: Team, isChasing: boolean): string => {
  if (isChasing) {
    const runDifference = battingTeam.totalRuns - bowlingTeam.totalRuns;
    const wicketsLeft = 11 - battingTeam.totalWickets;
    return runDifference > 0 ? `${wicketsLeft} wickets` : '';
  } else {
    const runDifference = battingTeam.totalRuns - bowlingTeam.totalRuns;
    return runDifference > 0 ? `${runDifference} runs` : '';
  }
};