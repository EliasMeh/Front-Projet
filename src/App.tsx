import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:3001');

interface User {
  username: string;
  score: number;
}

function App() {
  const [username, setUsername] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [guess, setGuess] = useState<string>('');
  const [guessResult, setGuessResult] = useState<string>('');
  const [lobbies, setLobbies] = useState<string[]>(['general']);
  const [currentLobby, setCurrentLobby] = useState<string>('general');
  const [newLobbyName, setNewLobbyName] = useState<string>('');

  useEffect(() => {
    socket.on('updateUsers', (updatedUsers: User[]) => {
      setUsers(updatedUsers);
    });

    socket.on('guessResult', (result: string) => {
      setGuessResult(result);
    });

    socket.on('updateLobbies', (updatedLobbies: string[]) => {
      setLobbies(updatedLobbies);
    });

    return () => {
      socket.off('updateUsers');
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
        <div>
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
          <h3>Leaderboard for {currentLobby}</h3>
          <ul>
            {users.map((user, index) => (
              <li key={index}>
                {user.username}: {user.score} points
              </li>
            ))}
          </ul>
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
        </div>
      )}
    </div>
  );
}

export default App;