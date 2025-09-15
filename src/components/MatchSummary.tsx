import React from 'react';
import { Trophy, Award, BarChart3, Download, RotateCcw } from 'lucide-react';
import { Match } from '../types/cricket';

interface MatchSummaryProps {
  match: Match;
  onNewMatch: () => void;
}

const MatchSummary: React.FC<MatchSummaryProps> = ({ match, onNewMatch }) => {
  const firstInnings = match.currentInnings === 2 ? match.bowlingTeam : match.battingTeam;
  const secondInnings = match.currentInnings === 2 ? match.battingTeam : match.bowlingTeam;
  
  const winner = secondInnings.totalRuns > firstInnings.totalRuns ? secondInnings : 
                 firstInnings.totalRuns > secondInnings.totalRuns ? firstInnings : null;
  
  const winMargin = winner ? 
    (winner.id === secondInnings.id ? 
      `${match.settings.playersPerTeam - secondInnings.totalWickets - 1} wickets` :
      `${firstInnings.totalRuns - secondInnings.totalRuns} runs`) : 
    'Match Tied';

  const bestBatsman = [...match.teamA.players, ...match.teamB.players]
    .filter(p => p.battingStats.runs > 0)
    .sort((a, b) => b.battingStats.runs - a.battingStats.runs)[0];

  const bestBowler = [...match.teamA.players, ...match.teamB.players]
    .filter(p => p.bowlingStats.wickets > 0)
    .sort((a, b) => b.bowlingStats.wickets - a.bowlingStats.wickets)[0];

  const exportScorecard = () => {
    const scorecardText = `
MATCH SCORECARD
===============

${match.teamA.name} vs ${match.teamB.name}
Toss: ${match.tossWinner} - chose to ${match.tossDecision.toLowerCase()}

FIRST INNINGS - ${firstInnings.name}
Total: ${firstInnings.totalRuns}/${firstInnings.totalWickets} (${Math.floor(firstInnings.totalBalls / 6)}.${firstInnings.totalBalls % 6} overs)

BATTING:
${firstInnings.players.map(p => 
  `${p.name.padEnd(20)} ${p.battingStats.runs.toString().padStart(3)} (${p.battingStats.balls}) [${p.battingStats.fours}x4, ${p.battingStats.sixes}x6] SR: ${p.battingStats.strikeRate.toFixed(1)}`
).join('\n')}

SECOND INNINGS - ${secondInnings.name}
Total: ${secondInnings.totalRuns}/${secondInnings.totalWickets} (${Math.floor(secondInnings.totalBalls / 6)}.${secondInnings.totalBalls % 6} overs)

BATTING:
${secondInnings.players.map(p => 
  `${p.name.padEnd(20)} ${p.battingStats.runs.toString().padStart(3)} (${p.battingStats.balls}) [${p.battingStats.fours}x4, ${p.battingStats.sixes}x6] SR: ${p.battingStats.strikeRate.toFixed(1)}`
).join('\n')}

RESULT: ${winner ? `${winner.name} won by ${winMargin}` : 'Match Tied'}
    `;

    const blob = new Blob([scorecardText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${match.teamA.name}-vs-${match.teamB.name}-scorecard.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Match Result Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
          <div className="mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Match Complete!</h1>
            {winner ? (
              <>
                <div className="text-2xl font-bold text-green-600 mb-2">{winner.name} Wins!</div>
                <div className="text-lg text-gray-600">by {winMargin}</div>
              </>
            ) : (
              <div className="text-2xl font-bold text-blue-600">Match Tied!</div>
            )}
          </div>
          
          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{firstInnings.totalRuns}/{firstInnings.totalWickets}</div>
              <div className="text-gray-600">{firstInnings.name}</div>
              <div className="text-sm text-gray-500">({Math.floor(firstInnings.totalBalls / 6)}.{firstInnings.totalBalls % 6} overs)</div>
            </div>
            <div className="text-2xl font-bold text-gray-400 flex items-center">vs</div>
            <div>
              <div className="text-3xl font-bold text-red-600">{secondInnings.totalRuns}/{secondInnings.totalWickets}</div>
              <div className="text-gray-600">{secondInnings.name}</div>
              <div className="text-sm text-gray-500">({Math.floor(secondInnings.totalBalls / 6)}.{secondInnings.totalBalls % 6} overs)</div>
            </div>
          </div>
        </div>

        {/* Awards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {bestBatsman && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                Best Batsman
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-lg">{bestBatsman.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-bold text-gray-800">{bestBatsman.name}</div>
                  <div className="text-gray-600">
                    {bestBatsman.battingStats.runs} runs ({bestBatsman.battingStats.balls} balls)
                  </div>
                  <div className="text-sm text-gray-500">
                    SR: {bestBatsman.battingStats.strikeRate.toFixed(1)} | 
                    {bestBatsman.battingStats.fours}x4, {bestBatsman.battingStats.sixes}x6
                  </div>
                </div>
              </div>
            </div>
          )}

          {bestBowler && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                Best Bowler
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">{bestBowler.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-bold text-gray-800">{bestBowler.name}</div>
                  <div className="text-gray-600">
                    {bestBowler.bowlingStats.wickets} wickets ({bestBowler.bowlingStats.runs} runs)
                  </div>
                  <div className="text-sm text-gray-500">
                    {bestBowler.bowlingStats.overs.toFixed(1)} overs | Econ: {bestBowler.bowlingStats.economyRate.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Full Scorecard */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* First Innings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4">{firstInnings.name} - First Innings</h2>
            <div className="mb-4">
              <div className="text-2xl font-bold">{firstInnings.totalRuns}/{firstInnings.totalWickets}</div>
              <div className="text-gray-600">({Math.floor(firstInnings.totalBalls / 6)}.{firstInnings.totalBalls % 6} overs)</div>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="grid grid-cols-5 gap-2 text-sm font-semibold text-gray-600 border-b pb-2">
                <span>Batsman</span>
                <span>Runs</span>
                <span>Balls</span>
                <span>4s/6s</span>
                <span>SR</span>
              </div>
              {firstInnings.players
                .filter(p => p.battingStats.balls > 0 || p.battingStats.runs > 0)
                .map(player => (
                <div key={player.id} className="grid grid-cols-5 gap-2 text-sm py-2">
                  <span className="font-medium">{player.name}</span>
                  <span>{player.battingStats.runs}</span>
                  <span>{player.battingStats.balls}</span>
                  <span>{player.battingStats.fours}/{player.battingStats.sixes}</span>
                  <span>{player.battingStats.strikeRate.toFixed(1)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Bowling Figures</h3>
              <div className="grid grid-cols-4 gap-2 text-sm font-semibold text-gray-600 border-b pb-2">
                <span>Bowler</span>
                <span>Overs</span>
                <span>Runs</span>
                <span>Wkts</span>
              </div>
              {secondInnings.players
                .filter(p => p.bowlingStats.balls > 0)
                .map(player => (
                <div key={player.id} className="grid grid-cols-4 gap-2 text-sm py-2">
                  <span className="font-medium">{player.name}</span>
                  <span>{player.bowlingStats.overs.toFixed(1)}</span>
                  <span>{player.bowlingStats.runs}</span>
                  <span>{player.bowlingStats.wickets}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Second Innings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">{secondInnings.name} - Second Innings</h2>
            <div className="mb-4">
              <div className="text-2xl font-bold">{secondInnings.totalRuns}/{secondInnings.totalWickets}</div>
              <div className="text-gray-600">({Math.floor(secondInnings.totalBalls / 6)}.{secondInnings.totalBalls % 6} overs)</div>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="grid grid-cols-5 gap-2 text-sm font-semibold text-gray-600 border-b pb-2">
                <span>Batsman</span>
                <span>Runs</span>
                <span>Balls</span>
                <span>4s/6s</span>
                <span>SR</span>
              </div>
              {secondInnings.players
                .filter(p => p.battingStats.balls > 0 || p.battingStats.runs > 0)
                .map(player => (
                <div key={player.id} className="grid grid-cols-5 gap-2 text-sm py-2">
                  <span className="font-medium">{player.name}</span>
                  <span>{player.battingStats.runs}</span>
                  <span>{player.battingStats.balls}</span>
                  <span>{player.battingStats.fours}/{player.battingStats.sixes}</span>
                  <span>{player.battingStats.strikeRate.toFixed(1)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Bowling Figures</h3>
              <div className="grid grid-cols-4 gap-2 text-sm font-semibold text-gray-600 border-b pb-2">
                <span>Bowler</span>
                <span>Overs</span>
                <span>Runs</span>
                <span>Wkts</span>
              </div>
              {firstInnings.players
                .filter(p => p.bowlingStats.balls > 0)
                .map(player => (
                <div key={player.id} className="grid grid-cols-4 gap-2 text-sm py-2">
                  <span className="font-medium">{player.name}</span>
                  <span>{player.bowlingStats.overs.toFixed(1)}</span>
                  <span>{player.bowlingStats.runs}</span>
                  <span>{player.bowlingStats.wickets}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex gap-4 justify-center">
            <button
              onClick={exportScorecard}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Scorecard
            </button>
            <button
              onClick={onNewMatch}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              New Match
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Match ID: {match.id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchSummary;