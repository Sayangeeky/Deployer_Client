import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';
const socket = io('http://localhost:9001'); // WebSocket server URL

function App() {
  const [githubUrl, setGithubUrl] = useState('');
  const [projectSlug, setProjectSlug] = useState('');
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (projectSlug) {
      // Join the WebSocket room for logs
      socket.emit('subscribe', `logs:${projectSlug}`);

      // Receive logs and append to logs state
      socket.on('message', (message) => {
        setLogs((prevLogs) => [...prevLogs, message]);
      });

      return () => {
        socket.off('message');
      };
    }
  }, [projectSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:9000/project', { githubUrl });
      setProjectSlug(response.data.data.projectSlug);
      setStatus(response.data.status);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <div className="App">
      <h1>Project Deployment</h1>
      
      {/* Form to submit the GitHub URL */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter GitHub Repository URL"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
        />
        <button type="submit">Deploy</button>
      </form>

      {/* Display project details */}
      {projectSlug && (
        <div>
          <h2>Project Slug: {projectSlug}</h2>
          <p>Status: {status}</p>
          <p>URL: http://{projectSlug}.localhost:8000</p>
        </div>
      )}

      {/* Display real-time logs */}
      {logs.length > 0 && (
        <div>
          <h2>Logs:</h2>
          <div style={{ backgroundColor: '#f4f4f4', padding: '1rem', height: '300px', overflowY: 'scroll' }}>
            {logs.map((log, index) => (
              <p key={index}>{log}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
