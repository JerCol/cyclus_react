// src/components/TopSection.jsx
import React from "react";
import JoinButton from "./JoinButton";
import "../styles/topsection.css";

export default function TopSection({ onInfoClick, attendeeCount }) {
  // We’ll only show/fade‐in the counter once attendeeCount is a number
  const isVisible = attendeeCount !== null;

  return (
    <section className="bar top">
      {/* Centered INFO button (absolute‐positioned in CSS) */}
      <JoinButton onClick={onInfoClick} className="info-button">
        INFO
      </JoinButton>

      {/* 
        The count uses both "attendee-count" (for flex layout, if needed) 
        and "counter" (for the look/animation). We append "visible" 
        only if isVisible===true, so it fades in via opacity.
      */}
      <div
        className={`attendee-count counter${isVisible ? " visible" : ""}`}
      >
        {isVisible
          ? `${attendeeCount}`
          : /* while loading, you could render nothing or "Loading..." */ null}
      </div>
    </section>
  );
}
