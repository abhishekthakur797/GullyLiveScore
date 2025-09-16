import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import TeamSetup from './components/TeamSetup';
import TossSetup from './components/TossSetup';
import LiveScoring from './components/LiveScoring';
import MatchSummary from './components/MatchSummary';
import { Match, Team, MatchSettings } from './types/cricket';

type AppState = 'team-setup' | 'toss' | 'live-scoring' | 'innings-break' | 'match-summary';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('team-setup');
  const [match, setMatch] = useState<Match | null>(null);
  const [showInningsBreak, setShowInningsBreak] = useState(false);

  // Save match to localStorage whenever it updates
  useEffect(() => {
    if (match) {
      localStorage.setItem('currentMatch', JSON.stringify(match));
    }
  }, [match]);

  // Load match from localStorage on app start
  useEffect(() => {
    const savedMatch = localStorage.getItem('currentMatch');
    if (savedMatch) {
      const parsedMatch = JSON.parse(savedMatch);
      setMatch(parsedMatch);
      
      if (parsedMatch.isComplete) {
        setCurrentState('match-summary');
      } else {
        setCurrentState('live-scoring');
      }
    }
  }, []);

  const handleTeamsCreated = (teamA: Team, teamB: Team, playersPerTeam: number) => {
    const settings: MatchSettings = {
      totalOvers: 10, // Default, will be set in toss
      playersPerTeam,
      maxOversPerBowler: Math.ceil(10 / 5) || 2, // Rough calculation
    };

    setCurrentState('toss');
  };

  const handleTossComplete = (tossWinner: Team, tossDecision: 'Batting' | 'Bowling', totalOvers: number, maxOversPerBowler: number) => {
    const teamA = JSON.parse(localStorage.getItem('teamA') || '{}') as Team;
    const teamB = JSON.parse(localStorage.getItem('teamB') || '{}') as Team;
    
    // Store teams temporarily for match creation
    const settings: MatchSettings = {
      totalOvers,
      playersPerTeam: teamA.players.length,
      maxOversPerBowler,
    };

    const battingTeam = tossDecision === 'Batting' ? tossWinner : 
                       (tossWinner.id === teamA.id ? teamB : teamA);
    const bowlingTeam = tossDecision === 'Bowling' ? tossWinner : 
                       (tossWinner.id === teamA.id ? teamB : teamA);

    const newMatch: Match = {
      id: Math.random().toString(36).substr(2, 9),
      teamA,
      teamB,
      tossWinner: tossWinner.name,
      tossDecision,
      battingTeam,
      bowlingTeam,
      currentInnings: 1,
      settings,
      isComplete: false,
    };

    setMatch(newMatch);
    setCurrentState('live-scoring');
  };

  // Modified to properly handle team creation
  const handleTeamsCreatedWithStorage = (teamA: Team, teamB: Team, playersPerTeam: number) => {
    // Store teams in localStorage temporarily
    localStorage.setItem('teamA', JSON.stringify(teamA));
    localStorage.setItem('teamB', JSON.stringify(teamB));
    localStorage.setItem('playersPerTeam', playersPerTeam.toString());
    
    setCurrentState('toss');
  };

  const handleInningsComplete = () => {
    if (!match) return;

    if (match.currentInnings === 1) {
      // Switch innings
      const updatedMatch = {
        ...match,
        currentInnings: 2 as const,
        battingTeam: { 
          ...match.bowlingTeam,
          totalRuns: 0,
          totalWickets: 0,
          totalOvers: 0,
          totalBalls: 0,
          extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
          players: match.bowlingTeam.players.map(p => ({
            ...p,
            battingStats: {
              runs: 0,
              balls: 0,
              fours: 0,
              sixes: 0,
              strikeRate: 0,
              isOut: false,
            }
          }))
        },
        bowlingTeam: { 
          ...match.battingTeam,
          players: match.battingTeam.players.map(p => ({
            ...p,
            bowlingStats: {
              overs: 0,
              balls: 0,
              runs: 0,
              wickets: 0,
              economyRate: 0,
            }
          }))
        },
      };
      setMatch(updatedMatch);
      setShowInningsBreak(true);
      
      // Auto-continue after 3 seconds
      setTimeout(() => {
        setShowInningsBreak(false);
      }, 3000);
    } else {
      // Match complete
      const updatedMatch = {
        ...match,
        isComplete: true,
      };
      setMatch(updatedMatch);
      setCurrentState('match-summary');
    }
  };

  const handleNewMatch = () => {
    localStorage.removeItem('currentMatch');
    localStorage.removeItem('teamA');
    localStorage.removeItem('teamB');
    localStorage.removeItem('playersPerTeam');
    setMatch(null);
    setCurrentState('team-setup');
  };

  const renderInningsBreak = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-lg">
        <Activity className="w-16 h-16 text-blue-500 mx-auto mb-6 animate-pulse" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Innings Break</h1>
        <p className="text-gray-600 mb-6">
          {match?.bowlingTeam.name} scored {match?.bowlingTeam.totalRuns}/{match?.bowlingTeam.totalWickets} 
          in {Math.floor(match?.bowlingTeam.totalBalls / 6)}.{match?.bowlingTeam.totalBalls % 6} overs
        </p>
        <p className="text-lg font-semibold text-blue-600 mb-4">
          {match?.battingTeam.name} needs {(match?.bowlingTeam.totalRuns || 0) + 1} runs to win
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 font-medium">
            Target: {(match?.bowlingTeam.totalRuns || 0) + 1} runs in {match?.settings.totalOvers} overs
          </p>
          <p className="text-yellow-700 text-sm mt-1">
            Required Run Rate: {(((match?.bowlingTeam.totalRuns || 0) + 1) / match?.settings.totalOvers).toFixed(2)} per over
          </p>
          <p className="text-yellow-700 text-sm mt-1">
            Wickets available: {(match?.settings.playersPerTeam || 11) - 1}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Second innings starting...
        </div>
      </div>
    </div>
  );

  if (showInningsBreak) {
    return renderInningsBreak();
  }

  switch (currentState) {
    case 'team-setup':
      return <TeamSetup onTeamsCreated={handleTeamsCreatedWithStorage} />;
    
    case 'toss':
      const teamA = JSON.parse(localStorage.getItem('teamA') || '{}') as Team;
      const teamB = JSON.parse(localStorage.getItem('teamB') || '{}') as Team;
      const playersPerTeam = parseInt(localStorage.getItem('playersPerTeam') || '11');
      
      return (
        <TossSetup 
          teamA={teamA}
          teamB={teamB}
          playersPerTeam={playersPerTeam}
          onTossComplete={(winner, decision, overs, maxOvers) => handleTossComplete(winner, decision, overs, maxOvers)}
        />
      );
    
    case 'live-scoring':
      return match ? (
        <LiveScoring 
          match={match}
          onMatchUpdate={setMatch}
          onInningsComplete={handleInningsComplete}
        />
      ) : null;
    
    case 'match-summary':
      return match ? (
        <MatchSummary 
          match={match}
          onNewMatch={handleNewMatch}
        />
      ) : null;
    
    default:
      return <TeamSetup onTeamsCreated={handleTeamsCreatedWithStorage} />;
  }
}

export default App;