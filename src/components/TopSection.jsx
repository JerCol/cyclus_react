// src/components/TopSection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import JoinButton from "./JoinButton";
import "../styles/topsection.css";

export default function TopSection({ onInfoClick, attendeeCount }) {
  const navigate = useNavigate();
  const isVisible = attendeeCount !== null;

  return (
    <section className="bar top">
      <div className="button-stack">
        {/* INFO button keeps its existing callback */}
        <JoinButton onClick={onInfoClick} className="info-button">
          INFO
        </JoinButton>

        {/*   ↓ Navigate straight to /ticket   */}
        <JoinButton
          onClick={() => navigate("/ticket")}
          className="support-button"
        >
          TICKET
        </JoinButton>
      </div>

      <div className={`attendee-count counter${isVisible ? " visible" : ""}`}>
        {isVisible ? attendeeCount : null}
      </div>
    </section>
  );
}
