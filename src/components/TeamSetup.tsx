import React, { useState } from 'react';
import { Users, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Player, Team } from '../types/cricket';
import { createPlayer, createTeam } from '../utils/cricketLogic';

interface TeamSetupProps {
  onTeamsCreated: (teamA: Team, teamB: Team, playersPerTeam: number) => void;
}

const TeamSetup: React.FC<TeamSetupProps> = ({ onTeamsCreated }) => {
  const [teamAName, setTeamAName] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [playersPerTeam, setPlayersPerTeam] = useState(11);
  const [teamAPlayers, setTeamAPlayers] = useState<Array<{name: string, role: string}>>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<Array<{name: string, role: string}>>([]);
  const [currentPlayerName, setCurrentPlayerName] = useState('');
  const [currentPlayerRole, setCurrentPlayerRole] = useState('Batsman');
  const [currentTeam, setCurrentTeam] = useState<'A' | 'B'>('A');

  const addPlayer = () => {
    if (!currentPlayerName.trim()) return;
    
    const player = { name: currentPlayerName, role: currentPlayerRole };
    
    if (currentTeam === 'A' && teamAPlayers.length < playersPerTeam) {
      setTeamAPlayers([...teamAPlayers, player]);
      // Auto-switch to Team B when Team A is full
      if (teamAPlayers.length + 1 === playersPerTeam && teamBPlayers.length < playersPerTeam) {
        setCurrentTeam('B');
      }
    } else if (currentTeam === 'B' && teamBPlayers.length < playersPerTeam) {
      setTeamBPlayers([...teamBPlayers, player]);
    }
    
    setCurrentPlayerName('');
    setCurrentPlayerRole('Batsman');
  };

  const removePlayer = (team: 'A' | 'B', index: number) => {
    if (team === 'A') {
      setTeamAPlayers(teamAPlayers.filter((_, i) => i !== index));
    } else {
      setTeamBPlayers(teamBPlayers.filter((_, i) => i !== index));
    }
  };

  const handleCreateTeams = () => {
    if (teamAPlayers.length === playersPerTeam && teamBPlayers.length === playersPerTeam) {
      const teamAPlayerObjects = teamAPlayers.map(p => createPlayer(p.name, p.role as any));
      const teamBPlayerObjects = teamBPlayers.map(p => createPlayer(p.name, p.role as any));
      
      const teamA = createTeam(teamAName, teamAPlayerObjects);
      const teamB = createTeam(teamBName, teamBPlayerObjects);
      
      onTeamsCreated(teamA, teamB, playersPerTeam);
    }
  };

  const canProceed = teamAName && teamBName && teamAPlayers.length === playersPerTeam && teamBPlayers.length === playersPerTeam;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Your Teams</h1>
          <p className="text-gray-600">Set up your gully cricket match teams and players</p>
        </div>

        {/* Team Names and Player Count */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team A Name</label>
              <input
                type="text"
                value={teamAName}
                onChange={(e) => setTeamAName(e.target.value)}
                placeholder="Enter Team A name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team B Name</label>
              <input
                type="text"
                value={teamBName}
                onChange={(e) => setTeamBName(e.target.value)}
                placeholder="Enter Team B name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Players per Team</label>
              <select
                value={playersPerTeam}
                onChange={(e) => setPlayersPerTeam(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {[6, 7, 8, 9, 10, 11].map(num => (
                  <option key={num} value={num}>{num} Players</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Player Addition */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Players
          </h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Player Name</label>
              <input
                type="text"
                value={currentPlayerName}
                onChange={(e) => setCurrentPlayerName(e.target.value)}
                placeholder="Enter player name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={currentPlayerRole}
                onChange={(e) => setCurrentPlayerRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Batsman">Batsman</option>
                <option value="Bowler">Bowler</option>
                <option value="Allrounder">Allrounder</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Add to Team</label>
              <select
                value={currentTeam}
                onChange={(e) => setCurrentTeam(e.target.value as 'A' | 'B')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="A">{teamAName || 'Team A'}</option>
                <option value="B">{teamBName || 'Team B'}</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={addPlayer}
                disabled={!currentPlayerName.trim() || (currentTeam === 'A' && teamAPlayers.length >= playersPerTeam) || (currentTeam === 'B' && teamBPlayers.length >= playersPerTeam)}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Player
              </button>
            </div>
          </div>
        </div>

        {/* Teams Display */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Team A */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {teamAName || 'Team A'}
              </span>
              <span className="text-sm bg-blue-100 px-2 py-1 rounded">
                {teamAPlayers.length}/{playersPerTeam}
              </span>
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teamAPlayers.map((player, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{player.name}</div>
                    <div className="text-sm text-gray-500">{player.role}</div>
                  </div>
                  <button
                    onClick={() => removePlayer('A', index)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {teamAPlayers.length === 0 && (
                <p className="text-gray-500 text-center py-8">No players added yet</p>
              )}
            </div>
          </div>

          {/* Team B */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {teamBName || 'Team B'}
              </span>
              <span className="text-sm bg-red-100 px-2 py-1 rounded">
                {teamBPlayers.length}/{playersPerTeam}
              </span>
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teamBPlayers.map((player, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{player.name}</div>
                    <div className="text-sm text-gray-500">{player.role}</div>
                  </div>
                  <button
                    onClick={() => removePlayer('B', index)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {teamBPlayers.length === 0 && (
                <p className="text-gray-500 text-center py-8">No players added yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Proceed Button */}
        <div className="text-center">
          <button
            onClick={handleCreateTeams}
            disabled={!canProceed}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            Create Teams & Continue
            <ArrowRight className="w-5 h-5" />
          </button>
          {!canProceed && (
            <p className="text-gray-500 mt-2">
              Please fill team names and add {playersPerTeam} players to each team
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamSetup;