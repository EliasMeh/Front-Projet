import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001', { transports: ['websocket'] });

function Leaderboard() {
  const [users, setUsers] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  
  useEffect(() => {
    socket.on('connect', () => {
      setCurrentUserId(socket.id);
      socket.emit('request_leaderboard');
    });

    socket.on('update_leaderboard', (connectedUsers) => {
      setUsers(connectedUsers);
    });

    return () => {
      socket.off('connect');
      socket.off('update_leaderboard');
    };
  }, []);

  return (
    <div className="Leaderboard">
      <h2>Leaderboard</h2>
      {Object.keys(users).length === 0 ? (
        <p>Waiting for leaderboard data...</p>
      ) : (
        <ul>
          {Object.entries(users)
            .sort(([, a], [, b]) => b - a)
            .map(([userId, points]) => (
              <li key={userId}>
                User ID: {userId.slice(0, 6)}... {userId === currentUserId ? '(You)' : ''}, Points: {points}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export default Leaderboard;