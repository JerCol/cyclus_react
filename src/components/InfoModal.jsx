// src/components/InfoModal.jsx
import React from "react";
import "../styles/modal.css"; // make sure this file is present
import concept from "../assets/concept.png";  // ⬅️ update the path/name
import SlotMachine from "./ArtistPicker";      //  ← new line
import ArtistPicker from "./ArtistPicker";


export default function InfoModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="join-button close-button" onClick={onClose}>
          &times;
        </button>
        

        <div className="modal-body">
          {/* Main heading */}
          <h2>CYCLUS 1</h2>
          
          {/* Event details */}
          <p>
            <strong>Date:</strong> 25.07.2025<br />
            <strong>Location:</strong> <a
              href="https://maps.app.goo.gl/M7cumcAkbPHygRAW6"
              target="_blank"
              rel="noopener noreferrer"
            >
              Brussel (Ganshoren)
            </a>
          </p>
         

          {/* NEW – poster / hero image */}
          <img
            src={concept}
            alt="Cyclus event poster"
            className="modal-image"
          />

          <ArtistPicker />

          
          {/* Footer & WhatsApp link */}
          <p>
            For the latest updates,{" "}
            <a
              href="https://chat.whatsapp.com/LBvA1PzU6ztJmsRBAzrDJN"
              target="_blank"
              rel="noopener noreferrer"
            >
              follow our channel
            </a>
          </p>


        </div>
      </div>
    </div>
  );
}