import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Target, Timer } from 'lucide-react';
import { Match, Player, Ball, CurrentBatsmen } from '../types/cricket';
import { 
  updateBattingStats, 
  updateBowlingStats, 
  shouldChangeStrike, 
  isOverComplete, 
  getNextBatsman,
  getAvailableBowlers 
} from '../utils/cricketLogic';

interface LiveScoringProps {
  match: Match;
  onMatchUpdate: (match: Match) => void;
  onInningsComplete: () => void;
}

const LiveScoring: React.FC<LiveScoringProps> = ({ match, onMatchUpdate, onInningsComplete }) => {
  const [currentBatsmen, setCurrentBatsmen] = useState<CurrentBatsmen>({
    striker: match.battingTeam.players[0],
    nonStriker: match.battingTeam.players[1],
  });
  const [currentBowler, setCurrentBowler] = useState<Player>(
    match.bowlingTeam.players[0]
  );
  const [ballsInCurrentOver, setBallsInCurrentOver] = useState(0);
  const [currentOverBalls, setCurrentOverBalls] = useState<Ball[]>([]);
  const [showExtras, setShowExtras] = useState(false);
  const [showWicket, setShowWicket] = useState(false);
  const [showBowlerSelection, setShowBowlerSelection] = useState(false);
  const [showBatsmanSelection, setShowBatsmanSelection] = useState(false);
  const [showInitialSelection, setShowInitialSelection] = useState(true);
  const [pendingWicket, setPendingWicket] = useState<Ball | null>(null);

  const recordBall = (ball: Ball) => {
    const updatedMatch = { ...match };
    const battingTeam = { ...updatedMatch.battingTeam };
    const bowlingTeam = { ...updatedMatch.bowlingTeam };

    // Update batsman stats
    const strikerIndex = battingTeam.players.findIndex(p => p.id === currentBatsmen.striker.id);
    if (strikerIndex !== -1) {
      battingTeam.players[strikerIndex] = updateBattingStats(battingTeam.players[strikerIndex], ball);
    }

    // Update bowler stats
    const bowlerIndex = bowlingTeam.players.findIndex(p => p.id === currentBowler.id);
    if (bowlerIndex !== -1) {
      bowlingTeam.players[bowlerIndex] = updateBowlingStats(bowlingTeam.players[bowlerIndex], ball);
    }

    // Update team totals
    battingTeam.totalRuns += ball.runs;
    
    // Check if target is achieved in second innings
    if (match.currentInnings === 2 && battingTeam.totalRuns > bowlingTeam.totalRuns) {
      // Target achieved! Match complete
      updatedMatch.battingTeam = battingTeam;
      updatedMatch.bowlingTeam = bowlingTeam;
      updatedMatch.isComplete = true;
      updatedMatch.winner = battingTeam.name;
      updatedMatch.winMargin = `${match.settings.playersPerTeam - battingTeam.totalWickets} wickets`;
      onMatchUpdate(updatedMatch);
      onInningsComplete();
      return;
    }
    
    if (ball.isExtra) {
      if (ball.extraType === 'wide') battingTeam.extras.wides += 1;
      else if (ball.extraType === 'noball') battingTeam.extras.noBalls += 1;
      else if (ball.extraType === 'bye') battingTeam.extras.byes += ball.runs;
      else if (ball.extraType === 'legbye') battingTeam.extras.legByes += ball.runs;
    }

    if (ball.isWicket) {
      battingTeam.totalWickets += 1;
      battingTeam.players[strikerIndex].battingStats.isOut = true;
      
      // Don't auto-select next batsman, let user choose
      setPendingWicket(ball);
      setShowBatsmanSelection(true);
    }

    // Update balls and overs (only for legal deliveries)
    if (!ball.isExtra || ball.extraType === 'bye' || ball.extraType === 'legbye') {
      battingTeam.totalBalls += 1;
      setBallsInCurrentOver(prev => prev + 1);
      
      if (ballsInCurrentOver + 1 >= 6) {
        const completedOvers = Math.floor(battingTeam.totalBalls / 6);
        battingTeam.totalOvers = completedOvers;
        setBallsInCurrentOver(0);
        setCurrentOverBalls([]);
        
        // Change strike and potentially change bowler
        setCurrentBatsmen(prev => ({
          striker: prev.nonStriker,
          nonStriker: prev.striker
        }));
        
        // Check if innings is complete after this over
        if (completedOvers >= match.settings.totalOvers) {
          // Innings complete - don't show bowler selection
          onInningsComplete();
          return;
        } else {
          // Show bowler selection for new over
          setShowBowlerSelection(true);
        }
      } else if (shouldChangeStrike(ball)) {
        setCurrentBatsmen(prev => ({
          striker: prev.nonStriker,
          nonStriker: prev.striker
        }));
      }
    }

    if (!ball.isWicket) {
      setCurrentOverBalls(prev => [...prev, ball]);
    }
    
    updatedMatch.battingTeam = battingTeam;
    updatedMatch.bowlingTeam = bowlingTeam;
    
    // Check if innings is complete
    if (battingTeam.totalWickets >= match.settings.playersPerTeam - 1 || 
        Math.floor(battingTeam.totalBalls / 6) >= match.settings.totalOvers) {
      onInningsComplete();
      return;
    }
    
    if (!ball.isWicket) {
      onMatchUpdate(updatedMatch);
    }
  };

  const handleRunScored = (runs: number) => {
    const ball: Ball = {
      runs,
      isExtra: false,
      isWicket: false,
      batsmanOnStrike: currentBatsmen.striker.id,
      bowler: currentBowler.id,
    };
    recordBall(ball);
  };

  const handleExtra = (extraType: 'wide' | 'noball' | 'bye' | 'legbye', runs: number = 1) => {
    const ball: Ball = {
      runs,
      isExtra: true,
      extraType,
      isWicket: false,
      batsmanOnStrike: currentBatsmen.striker.id,
      bowler: currentBowler.id,
    };
    recordBall(ball);
    setShowExtras(false);
  };

  const handleWicket = (wicketType: string, runs: number = 0) => {
    const ball: Ball = {
      runs,
      isExtra: false,
      isWicket: true,
      wicketType,
      batsmanOnStrike: currentBatsmen.striker.id,
      bowler: currentBowler.id,
    };
    recordBall(ball);
    setShowWicket(false);
  };

  const handleBowlerSelection = (bowler: Player) => {
    setCurrentBowler(bowler);
    setShowBowlerSelection(false);
    setShowInitialSelection(false);
  };

  const handleBatsmanSelection = (batsman: Player) => {
    setCurrentBatsmen(prev => ({
      ...prev,
      striker: batsman
    }));
    
    if (pendingWicket) {
      setCurrentOverBalls(prev => [...prev, pendingWicket]);
      const updatedMatch = { ...match };
      onMatchUpdate(updatedMatch);
      setPendingWicket(null);
    }
    
    setShowBatsmanSelection(false);
  };

  const handleInitialPlayerSelection = (striker: Player, nonStriker: Player, bowler: Player) => {
    setCurrentBatsmen({ striker, nonStriker });
    setCurrentBowler(bowler);
    setShowInitialSelection(false);
  };

  const availableBowlers = getAvailableBowlers(match.bowlingTeam, currentBowler, match.settings);
  const availableBatsmen = match.battingTeam.players.filter(p => 
    !p.battingStats.isOut && 
    p.id !== currentBatsmen.striker.id && 
    p.id !== currentBatsmen.nonStriker.id
  );

  const requiredRunRate = match.currentInnings === 2 
    ? ((match.bowlingTeam.totalRuns - match.battingTeam.totalRuns + 1) / 
       ((match.settings.totalOvers - match.battingTeam.totalOvers) || 1)) * 6
    : 0;

  // Initial player selection modal
  if (showInitialSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Select Starting Players</h1>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Batsmen Selection */}
              <div>
                <h2 className="text-xl font-bold text-green-600 mb-4">Choose Opening Batsmen</h2>
                <div className="space-y-3">
                  {match.battingTeam.players.slice(0, 6).map(player => (
                    <div key={player.id} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="striker"
                        value={player.id}
                        onChange={() => setCurrentBatsmen(prev => ({ ...prev, striker: player }))}
                        className="w-4 h-4 text-green-600"
                      />
                      <label className="flex-1 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-gray-600">{player.role}</div>
                      </label>
                    </div>
                  ))}
                </div>
                
                <h3 className="text-lg font-semibold text-green-600 mt-6 mb-3">Non-Striker</h3>
                <div className="space-y-3">
                  {match.battingTeam.players.slice(0, 6).filter(p => p.id !== currentBatsmen.striker.id).map(player => (
                    <div key={player.id} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="nonStriker"
                        value={player.id}
                        onChange={() => setCurrentBatsmen(prev => ({ ...prev, nonStriker: player }))}
                        className="w-4 h-4 text-green-600"
                      />
                      <label className="flex-1 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-gray-600">{player.role}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bowler Selection */}
              <div>
                <h2 className="text-xl font-bold text-blue-600 mb-4">Choose Opening Bowler</h2>
                <div className="space-y-3">
                  {match.bowlingTeam.players.map(player => (
                    <div key={player.id} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="bowler"
                        value={player.id}
                        onChange={() => setCurrentBowler(player)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label className="flex-1 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-gray-600">{player.role}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => handleInitialPlayerSelection(currentBatsmen.striker, currentBatsmen.nonStriker, currentBowler)}
                disabled={!currentBatsmen.striker || !currentBatsmen.nonStriker || !currentBowler}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Start Match
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Live Score Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h1 className="text-2xl font-bold text-gray-800">Live Scoring</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Innings {match.currentInnings}</div>
              <div className="text-lg font-semibold text-gray-800">
                Over {Math.floor(match.battingTeam.totalBalls / 6)}.{match.battingTeam.totalBalls % 6} / {match.settings.totalOvers}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Score */}
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                {match.battingTeam.totalRuns}/{match.battingTeam.totalWickets}
              </div>
              <div className="text-gray-600">{match.battingTeam.name}</div>
              <div className="text-sm text-gray-500">
                ({Math.floor(match.battingTeam.totalBalls / 6)}.{match.battingTeam.totalBalls % 6}/{match.settings.totalOvers} overs)
              </div>
            </div>

            {/* Target/RRR */}
            {match.currentInnings === 2 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-2">
                  <Target className="w-6 h-6" />
                  Target: {match.bowlingTeam.totalRuns + 1}
                </div>
                <div className="text-gray-600">Need {match.bowlingTeam.totalRuns - match.battingTeam.totalRuns + 1} runs</div>
                <div className="text-sm text-gray-500">
                  RRR: {requiredRunRate > 0 ? requiredRunRate.toFixed(2) : '0.00'}
                </div>
              </div>
            )}

            {/* Current Over */}
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800 mb-2">This Over</div>
              <div className="flex gap-2 justify-center flex-wrap">
                {currentOverBalls.map((ball, index) => (
                  <span 
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      ball.isWicket ? 'bg-red-500 text-white' :
                      ball.isExtra ? 'bg-yellow-400 text-gray-800' :
                      ball.runs === 4 ? 'bg-blue-500 text-white' :
                      ball.runs === 6 ? 'bg-purple-500 text-white' :
                      'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {ball.isWicket ? 'W' : ball.runs}
                  </span>
                ))}
                {Array.from({ length: 6 - currentOverBalls.length }, (_, i) => (
                  <span key={`empty-${i}`} className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300"></span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Current Players */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Current Players</h2>
            
            {/* Batsmen */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Batsmen</h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${currentBatsmen.striker.id === currentBatsmen.striker.id ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{currentBatsmen.striker.name} *</div>
                      <div className="text-sm text-gray-600">{currentBatsmen.striker.battingStats.runs} ({currentBatsmen.striker.battingStats.balls})</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">SR: {currentBatsmen.striker.battingStats.strikeRate.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">{currentBatsmen.striker.battingStats.fours}x4, {currentBatsmen.striker.battingStats.sixes}x6</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{currentBatsmen.nonStriker.name}</div>
                      <div className="text-sm text-gray-600">{currentBatsmen.nonStriker.battingStats.runs} ({currentBatsmen.nonStriker.battingStats.balls})</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">SR: {currentBatsmen.nonStriker.battingStats.strikeRate.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">{currentBatsmen.nonStriker.battingStats.fours}x4, {currentBatsmen.nonStriker.battingStats.sixes}x6</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bowler */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Bowler</h3>
              <div className="p-3 rounded-lg bg-blue-50">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{currentBowler.name}</div>
                    <div className="text-sm text-gray-600">{currentBowler.bowlingStats.overs.toFixed(1)}-0-{currentBowler.bowlingStats.runs}-{currentBowler.bowlingStats.wickets}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">Econ: {currentBowler.bowlingStats.economyRate.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scoring Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Score Ball</h2>
            
            {/* Runs */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3">Runs</h3>
              <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3, 4, 5, 6].map(runs => (
                  <button
                    key={runs}
                    onClick={() => handleRunScored(runs)}
                    className={`h-12 rounded-lg font-bold transition-colors ${
                      runs === 4 ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                      runs === 6 ? 'bg-purple-500 hover:bg-purple-600 text-white' :
                      'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    {runs}
                  </button>
                ))}
              </div>
            </div>

            {/* Extras */}
            <div className="mb-6">
              <button
                onClick={() => setShowExtras(!showExtras)}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium py-3 rounded-lg mb-3"
              >
                Extras
              </button>
              {showExtras && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleExtra('wide')} className="bg-yellow-200 hover:bg-yellow-300 text-gray-800 py-2 rounded">Wide</button>
                  <button onClick={() => handleExtra('noball')} className="bg-yellow-200 hover:bg-yellow-300 text-gray-800 py-2 rounded">No Ball</button>
                  <button onClick={() => handleExtra('bye')} className="bg-yellow-200 hover:bg-yellow-300 text-gray-800 py-2 rounded">Bye</button>
                  <button onClick={() => handleExtra('legbye')} className="bg-yellow-200 hover:bg-yellow-300 text-gray-800 py-2 rounded">Leg Bye</button>
                </div>
              )}
            </div>

            {/* Wicket */}
            <div>
              <button
                onClick={() => setShowWicket(!showWicket)}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg mb-3"
              >
                Wicket
              </button>
              {showWicket && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleWicket('Bowled')} className="bg-red-200 hover:bg-red-300 text-gray-800 py-2 rounded text-sm">Bowled</button>
                  <button onClick={() => handleWicket('Caught')} className="bg-red-200 hover:bg-red-300 text-gray-800 py-2 rounded text-sm">Caught</button>
                  <button onClick={() => handleWicket('LBW')} className="bg-red-200 hover:bg-red-300 text-gray-800 py-2 rounded text-sm">LBW</button>
                  <button onClick={() => handleWicket('Run Out')} className="bg-red-200 hover:bg-red-300 text-gray-800 py-2 rounded text-sm">Run Out</button>
                  <button onClick={() => handleWicket('Stumped')} className="bg-red-200 hover:bg-red-300 text-gray-800 py-2 rounded text-sm">Stumped</button>
                  <button onClick={() => handleWicket('Hit Wicket')} className="bg-red-200 hover:bg-red-300 text-gray-800 py-2 rounded text-sm">Hit Wicket</button>
                </div>
              )}
            </div>
          </div>

          {/* Partnership & Stats */}
          <div className="space-y-6">
            {/* Partnership */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Partnership</h2>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {currentBatsmen.striker.battingStats.runs + currentBatsmen.nonStriker.battingStats.runs}
                </div>
                <div className="text-gray-600">runs</div>
                <div className="text-sm text-gray-500 mt-2">
                  ({currentBatsmen.striker.battingStats.balls + currentBatsmen.nonStriker.battingStats.balls} balls)
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Match Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Run Rate:</span>
                  <span className="font-semibold">
                    {match.battingTeam.totalOvers > 0 ? (match.battingTeam.totalRuns / match.battingTeam.totalOvers).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Boundaries:</span>
                  <span className="font-semibold">
                    {match.battingTeam.players.reduce((sum, p) => sum + p.battingStats.fours + p.battingStats.sixes, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Extras:</span>
                  <span className="font-semibold">
                    {Object.values(match.battingTeam.extras).reduce((sum, val) => sum + val, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bowler Selection Modal */}
      {showBowlerSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Select New Bowler</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {availableBowlers.map(bowler => (
                <button
                  key={bowler.id}
                  onClick={() => handleBowlerSelection(bowler)}
                  className="w-full p-3 text-left bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <div className="font-medium">{bowler.name}</div>
                  <div className="text-sm text-gray-600">
                    {bowler.bowlingStats.overs.toFixed(1)} overs, {bowler.bowlingStats.wickets} wickets
                  </div>
                </button>
              ))}
            </div>
            {availableBowlers.length === 0 && (
              <p className="text-gray-500 text-center py-4">No available bowlers (all have bowled maximum overs)</p>
            )}
          </div>
        </div>
      )}

      {/* Batsman Selection Modal */}
      {showBatsmanSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Select Next Batsman</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {availableBatsmen.map(batsman => (
                <button
                  key={batsman.id}
                  onClick={() => handleBatsmanSelection(batsman)}
                  className="w-full p-3 text-left bg-gray-50 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <div className="font-medium">{batsman.name}</div>
                  <div className="text-sm text-gray-600">{batsman.role}</div>
                </button>
              ))}
            </div>
            {availableBatsmen.length === 0 && (
              <p className="text-gray-500 text-center py-4">No more batsmen available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveScoring;