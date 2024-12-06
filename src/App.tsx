import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Leaderboard from './components/leaderboard';

const socket = io('http://localhost:3001', { transports: ['websocket'] });

function App() {
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.on('correct_guess', (data: { guess: number; points: number }) => {
      setMessage(`Correct guess! The number was ${data.guess}. You now have ${data.points} points.`);
    });

    socket.on('incorrect_guess', () => {
      setMessage(`Incorrect guess. Try again!`);
    });

    return () => {
      socket.off('correct_guess');
      socket.off('incorrect_guess');
    };
  }, []);

  const sendGuess = () => {
    socket.emit('send_guess', parseInt(guess));
    setGuess('');
  }

  return (
    <div className="App">
      <h1>Guess the Number Game</h1>
      <Leaderboard />
      <input 
        type="number" 
        value={guess} 
        onChange={(e) => setGuess(e.target.value)} 
        placeholder="Enter your guess"
      />
      <button onClick={sendGuess}>Send Guess</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;