import React, { useState } from 'react';
import { Coins, ArrowRight } from 'lucide-react';
import { Team } from '../types/cricket';

interface TossSetupProps {
  teamA: Team;
  teamB: Team;
  playersPerTeam: number;
  onTossComplete: (tossWinner: Team, tossDecision: 'Batting' | 'Bowling', totalOvers: number) => void;
}

const TossSetup: React.FC<TossSetupProps> = ({ teamA, teamB, playersPerTeam, onTossComplete }) => {
  const [tossWinner, setTossWinner] = useState<Team | null>(null);
  const [tossDecision, setTossDecision] = useState<'Batting' | 'Bowling' | ''>('');
  const [totalOvers, setTotalOvers] = useState(5);
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinCaller, setCoinCaller] = useState<Team | null>(null);
  const [coinCall, setCoinCall] = useState<'Heads' | 'Tails' | ''>('');
  const [coinResult, setCoinResult] = useState<'Heads' | 'Tails' | ''>('');
  const [showCoinCall, setShowCoinCall] = useState(true);

  const flipCoin = async () => {
    if (!coinCaller || !coinCall) return;
    
    setIsFlipping(true);
    
    // Simulate coin flip animation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result: 'Heads' | 'Tails' = Math.random() > 0.5 ? 'Heads' : 'Tails';
    setCoinResult(result);
    
    const winner = coinCall === result ? coinCaller : (coinCaller.id === teamA.id ? teamB : teamA);
    setTossWinner(winner);
    setIsFlipping(false);
    setShowCoinCall(false);
  };

  const handleProceed = () => {
    if (tossWinner && tossDecision) {
      onTossComplete(tossWinner, tossDecision as 'Batting' | 'Bowling', totalOvers);
    }
  };

  const maxOversPerBowler = Math.floor(totalOvers / 5) || 1; // Rough calculation
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Toss Time!</h1>
          <p className="text-gray-600">Decide who gets to choose first</p>
        </div>

        {/* Match Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ Match Settings</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Overs per Innings</label>
              <select
                value={totalOvers}
                onChange={(e) => setTotalOvers(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
              >
                <option value={3}>3 Overs (Quick Match)</option>
                <option value={5}>5 Overs</option>
                <option value={8}>8 Overs</option>
                <option value={10}>10 Overs</option>
                <option value={15}>15 Overs</option>
                <option value={20}>20 Overs</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Choose match duration</p>
            </div>
            <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{maxOversPerBowler}</div>
                <div className="text-sm text-gray-600">Max overs per bowler</div>
                <div className="text-xs text-gray-500 mt-1">
                  ({Math.floor(totalOvers / maxOversPerBowler)} bowlers minimum)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teams Display */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-colors ${
            tossWinner?.id === teamA.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">{teamA.name.charAt(0)}</span>
              </div>
              <h3 className="text-xl font-bold text-blue-600 mb-2">{teamA.name}</h3>
              <p className="text-gray-600">{playersPerTeam} Players</p>
              {tossWinner?.id === teamA.id && (
                <div className="mt-3 text-green-600 font-medium">🏆 Toss Winner!</div>
              )}
            </div>
          </div>

          <div className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-colors ${
            tossWinner?.id === teamB.id ? 'border-red-500 bg-red-50' : 'border-gray-200'
          }`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">{teamB.name.charAt(0)}</span>
              </div>
              <h3 className="text-xl font-bold text-red-600 mb-2">{teamB.name}</h3>
              <p className="text-gray-600">{playersPerTeam} Players</p>
              {tossWinner?.id === teamB.id && (
                <div className="mt-3 text-green-600 font-medium">🏆 Toss Winner!</div>
              )}
            </div>
          </div>
        </div>

        {/* Toss Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {showCoinCall ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Who will call the coin?</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <button
                  onClick={() => setCoinCaller(teamA)}
                  className={`p-6 rounded-lg border-2 transition-colors ${
                    coinCaller?.id === teamA.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">{teamA.name.charAt(0)}</span>
                  </div>
                  <div className="font-bold text-gray-800">{teamA.name}</div>
                </button>
                
                <button
                  onClick={() => setCoinCaller(teamB)}
                  className={`p-6 rounded-lg border-2 transition-colors ${
                    coinCaller?.id === teamB.id 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">{teamB.name.charAt(0)}</span>
                  </div>
                  <div className="font-bold text-gray-800">{teamB.name}</div>
                </button>
              </div>
              
              {coinCaller && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    {coinCaller.name}, call the coin:
                  </h3>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setCoinCall('Heads')}
                      className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                        coinCall === 'Heads'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Heads
                    </button>
                    <button
                      onClick={() => setCoinCall('Tails')}
                      className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                        coinCall === 'Tails'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Tails
                    </button>
                  </div>
                </div>
              )}
              
              {coinCaller && coinCall && (
                <button
                  onClick={flipCoin}
                  disabled={isFlipping}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
                >
                  {isFlipping ? 'Flipping...' : 'Flip Coin'}
                </button>
              )}
            </div>
          ) : !tossWinner ? (
            <div className="text-center">
              <div className={`w-32 h-32 mx-auto mb-6 rounded-full bg-yellow-400 flex items-center justify-center transition-transform duration-1000 ${
                isFlipping ? 'animate-spin' : ''
              }`}>
                <Coins className="w-16 h-16 text-yellow-800" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Flip?</h2>
              <button
                onClick={flipCoin}
                disabled={isFlipping}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                {isFlipping ? 'Flipping...' : 'Flip Coin'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Coin landed on: <span className="text-yellow-600">{coinResult}</span>
              </h2>
              <p className="text-gray-600 mb-4">
                {coinCaller?.name} called {coinCall}
              </p>
              <h3 className="text-xl font-bold text-green-600 mb-6">
                {tossWinner.name} wins the toss!
              </h3>
              <div className="mb-6">
                <p className="text-gray-600 mb-4">Choose to bat or bowl first:</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setTossDecision('Batting')}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      tossDecision === 'Batting'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Choose to Bat
                  </button>
                  <button
                    onClick={() => setTossDecision('Bowling')}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      tossDecision === 'Bowling'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Choose to Bowl
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Proceed Button */}
        {tossWinner && tossDecision && (
          <div className="text-center">
            <button
              onClick={handleProceed}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              Start Match
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-gray-600 mt-3">
              {tossWinner.name} chose to {tossDecision.toLowerCase()} first in this {totalOvers}-over match
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TossSetup;