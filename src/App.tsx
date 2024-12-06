import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

interface User {
  username: string;
  score: number;
  team: string;
}

interface LobbyState {
  users: User[];
  teams: { [key: string]: string[] };
}

function App() {
  const [username, setUsername] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [lobbyState, setLobbyState] = useState<LobbyState>({ users: [], teams: {} });
  const [guess, setGuess] = useState<string>('');
  const [guessResult, setGuessResult] = useState<string>('');
  const [lobbies, setLobbies] = useState<string[]>(['general']);
  const [currentLobby, setCurrentLobby] = useState<string>('general');
  const [newLobbyName, setNewLobbyName] = useState<string>('');
  const [newTeamName, setNewTeamName] = useState<string>('');

  useEffect(() => {
    socket.on('updateLobbyState', (state: LobbyState) => {
      console.log('Received lobby state:', state);
      setLobbyState(state);
    });

    socket.on('guessResult', (result: string) => {
      setGuessResult(result);
    });

    socket.on('updateLobbies', (updatedLobbies: string[]) => {
      setLobbies(updatedLobbies);
    });

    return () => {
      socket.off('updateLobbyState');
      socket.off('guessResult');
      socket.off('updateLobbies');
    };
  }, []);

  const handleJoin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit('join', { username, lobby: currentLobby });
      setIsJoined(true);
    }
  };

  const handleGuess = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (guess.trim()) {
      socket.emit('guess', { guess, lobby: currentLobby });
      setGuess('');
    }
  };

  const handleCreateLobby = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newLobbyName.trim()) {
      socket.emit('createLobby', newLobbyName);
      setNewLobbyName('');
    }
  };

  const handleJoinLobby = (lobby: string) => {
    socket.emit('join', { username, lobby });
    setCurrentLobby(lobby);
  };

  const handleJoinTeam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newTeamName.trim()) {
      socket.emit('joinTeam', { teamName: newTeamName, lobby: currentLobby });
      setNewTeamName('');
    }
  };

  const getCurrentUserTeam = () => {
    const currentUser = lobbyState.users.find(user => user.username === username);
    console.log('Current user:', currentUser);
    return currentUser ? currentUser.team : '';
  };

  const getTeamMembers = (teamName: string) => {
    const members = lobbyState.users.filter(user => user.team === teamName);
    console.log('Team members for', teamName, ':', members);
    return members;
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Numerous</h1>
      {!isJoined ? (
        <form onSubmit={handleJoin} className="mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="border border-gray-300 rounded p-2 mr-2 w-44"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Rejoindre une partie</button>
        </form>
      ) : (
        <div className="flex w-full max-w-6xl">
          <div className="flex-grow bg-white rounded-lg shadow-md p-4 mr-4">
            <h2 className="text-xl font-semibold mb-2">Bienvenue, {username}! (Ton lobby: <span className="text-red-500">{currentLobby}</span>)</h2>
            <h1>Fais ton choix</h1>
            <form onSubmit={handleGuess} className="mb-4">
              <input
                type="number"
                min="1"
                max="999999"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Enter your guess (1-999999)"
                className="border border-gray-300 rounded p-2 mr-2 w-72"
              />
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Submit</button>
            </form>
            <p>{guessResult}</p>
            <h3 className="text-lg font-semibold mt-4">Liste des lobbies</h3>
            <ul className="mb-4">
              {lobbies.map((lobby) => (
                <li key={lobby} className="flex justify-between items-center mb-2">
                  <span className='text-red-500'>{lobby}</span>
                  {lobby !== currentLobby && (
                    <button onClick={() => handleJoinLobby(lobby)} className="bg-blue-400 text-white px-2 py-1 rounded">Join</button>
                  )}
                </li>
              ))}
            </ul>
            <form onSubmit={handleCreateLobby} className="mb-4">
              <input
                type="text"
                value={newLobbyName}
                onChange={(e) => setNewLobbyName(e.target.value)}
                placeholder="New lobby name"
                className="border border-gray-300 rounded p-2 mr-2 w-40"
              />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Créer Lobby</button>
            </form>
            <h3 className="text-lg font-semibold mt-4">Leaderboard de <span className="text-red-500">{currentLobby}</span></h3>
            <ul>
              {lobbyState.users
                .sort((a, b) => b.score - a.score)
                .map((user) => (
                  <li key={user.username}>
                    {user.username} (<span className="text-green-500">{user.team}</span>): {user.score} points
                  </li>
                ))}
            </ul>
          </div>

          <div className="w-1/3 bg-gray-50 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold">Ta Team: <span className="text-green-500">{getCurrentUserTeam() || 'No Team'}</span></h3>
            <h4 className="mt-2">Membres de la team:</h4>
            {getCurrentUserTeam() ? (
              <ul>
                {getTeamMembers(getCurrentUserTeam()).map((member) => (
                  <li key={member.username}>{member.username}</li>
                ))}
              </ul>
            ) : (
              <p>You are not in a team yet.</p>
            )}
            <h3 className="text-lg font-semibold mt-4">Toutes les teams <span className="text-red-500">{currentLobby}</span></h3>
            {Object.keys(lobbyState.teams).length > 0 ? (
              <ul>
                {Object.entries(lobbyState.teams).map(([teamName, members]) => (
                  <li key={teamName} className="flex justify-between items-center mb-2">
                    <span className="text-green-500">{teamName}</span>: {members.length} membre(s)
                    <button 
                      onClick={() => socket.emit('joinTeam', { teamName, lobby: currentLobby })} 
                      className="bg-blue-400 text-white px-2 py-1 rounded"
                    >
                      Rejoindre
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Pas de team dans ce lobby.</p>
            )}
            <form onSubmit={handleJoinTeam} className="mt-4">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="New team name"
                className="border border-gray-300 rounded p-2 mr-2 w-full mb-2"
              />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">Créer/Rejoindre Team</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;