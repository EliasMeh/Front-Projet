import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

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
    return currentUser ? currentUser.team : '';
  };

  const getTeamMembers = (teamName: string) => {
    return lobbyState.users.filter(user => user.team === teamName);
  };

  return (
    <div className="App">
      <h1>Number Guessing Game</h1>
      {!isJoined ? (
        <form onSubmit={handleJoin}>
          <input
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
          <button type="submit">Join Game</button>
        </form>
      ) : (
        <div className="game-container">
          <div className="left-panel">
            <h2>Welcome, {username}! (Current Lobby: {currentLobby})</h2>
            <form onSubmit={handleGuess}>
              <input
                type="number"
                min="1"
                max="10"
                value={guess}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuess(e.target.value)}
                placeholder="Enter your guess (1-10)"
              />
              <button type="submit">Submit Guess</button>
            </form>
            <p>{guessResult}</p>
            <h3>Available Lobbies</h3>
            <ul>
              {lobbies.map((lobby, index) => (
                <li key={index}>
                  {lobby} 
                  {lobby !== currentLobby && (
                    <button onClick={() => handleJoinLobby(lobby)}>Join</button>
                  )}
                </li>
              ))}
            </ul>
            <form onSubmit={handleCreateLobby}>
              <input
                type="text"
                value={newLobbyName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLobbyName(e.target.value)}
                placeholder="New lobby name"
              />
              <button type="submit">Create Lobby</button>
            </form>
            <h3>Leaderboard for {currentLobby}</h3>
            <ul>
              {lobbyState.users.map((user, index) => (
                <li key={index}>
                  {user.username} ({user.team}): {user.score} points
                </li>
              ))}
            </ul>
          </div>
          <div className="right-panel">
            <h3>Your Team: {getCurrentUserTeam()}</h3>
            <h4>Team Members:</h4>
            <ul>
              {getTeamMembers(getCurrentUserTeam()).map((member, index) => (
                <li key={index}>{member.username}</li>
              ))}
            </ul>
            <h3>All Teams in {currentLobby}</h3>
            <ul>
              {Object.entries(lobbyState.teams).map(([teamName, members]) => (
                <li key={teamName}>
                  {teamName}: {members.length} member(s)
                  <button onClick={() => socket.emit('joinTeam', { teamName, lobby: currentLobby })}>
                    Join Team
                  </button>
                </li>
              ))}
            </ul>
            <form onSubmit={handleJoinTeam}>
              <input
                type="text"
                value={newTeamName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTeamName(e.target.value)}
                placeholder="New team name"
              />
              <button type="submit">Create/Join Team</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;