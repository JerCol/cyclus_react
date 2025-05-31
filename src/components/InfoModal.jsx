// src/components/InfoModal.jsx
import React from "react";
import "../styles/modal.css"; // make sure this file is present

export default function InfoModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="join-button close-button" onClick={onClose}>
          &times;
        </button>

        <div className="modal-body">
          {/* Main Heading */}
          <h2>CYCLUS – An Orbit of Festive Connection</h2>

          {/* Intro Paragraph */}
          <p>
            Cyclus is a collective exploring the power of shared connection. We believe a
            night can be more than a party — an arrival, a passage, a return, a journey.
            Cyclus invites you to move together through sound, taste, movement, and
            everything in between. We work in cycles. From beginning to end, and
            back again. Each phase of the night is part of the whole. It’s not just
            about dancing — it’s about arriving, witnessing, absorbing, letting go, and
            landing together.
          </p>

          {/* Event Details */}
          <h3>CYCLE 1: JULY 25 2025</h3>
          <p>
            <strong>Location:</strong> Brussel (Ganshoren),{" "}
            <a
              href="https://maps.app.goo.gl/M7cumcAkbPHygRAW6"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://maps.app.goo.gl/M7cumcAkbPHygRAW6
            </a>
          </p>

          <p>Our first gathering will guide you through a full cycle:</p>
          <ul>
            <li>
              <strong>Shared Dinner:</strong> A moment to slow down, arrive, and connect.
            </li>
            <li>
              <strong>Live Performances:</strong> Voices and sounds to tune us in.
            </li>
            <li>
              <strong>DJs:</strong> Lead us deeper — movement, release, collective pulse.
            </li>
            <li>
              <strong>Cool Down Act:</strong> A shift in energy, slowdown.
            </li>
            <li>
              <strong>Midnight Mouthful:</strong> A pause or ending, depending on how you feel.
            </li>
            <li>
              <strong>Final DJ:</strong> Carries us in the afterglow — the after at the party.
            </li>
            <li>
              <strong>Breakfast:</strong> As morning breaks, we share breakfast — a quiet
              landing, together.
            </li>
          </ul>

          {/* Footer & WhatsApp Link */}
          <p>
            For the latest updates, {" "}
            <a
              href="https://chat.whatsapp.com/LBvA1PzU6ztJmsRBAzrDJN"
              target="_blank"
              rel="noopener noreferrer"
            >
              check our channel
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
