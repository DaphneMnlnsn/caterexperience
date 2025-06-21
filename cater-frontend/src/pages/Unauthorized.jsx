import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Unauthorized.css';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="not-authorized-container">
      <h1>🚫 Access Denied</h1>
      <p>You are not authorized to view this page.</p>
      <button onClick={() => navigate('/')} className="back-btn">
        Go to Login
      </button>
    </div>
  );
}
