// src/components/ThankYouModal.jsx – “Support us?” now a real JoinButton, no blue link

import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/modal.css";
import "../styles/join-button.css";
import JoinButton from "./JoinButton";

export default function ThankYouModal({ onClose }) {
  const navigate = useNavigate();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Thanks for joining &amp; see you soon!</h2>
        <p>
          For the latest updates, follow our{' '}
          <a
            href="https://chat.whatsapp.com/LBvA1PzU6ztJmsRBAzrDJN"
            target="_blank"
            rel="noopener noreferrer"
          >
            channel
          </a>
        </p>

        {/* Action buttons */}
        <div
          className="ticket-buttons"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {/* Navigate to /ticket */}
          <JoinButton
            onClick={() => {
              onClose();
              navigate('/ticket');
            }}
          >
            Support&nbsp;us?
          </JoinButton>

          
        </div>
      </div>
    </div>
  );
}
