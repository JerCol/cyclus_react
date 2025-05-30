// src/components/JoinForm.jsx
import { useState } from "react";
import "../styles/modal.css";

export default function JoinForm({ onConfirm, onClose }) {
  const [nick, setNick] = useState("");
  const [addCal, setAddCal] = useState("no");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Join Us</h2>

        <label>
          Nickname (optional):
          <input
            type="text"
            value={nick}
            onChange={e => setNick(e.target.value)}
            placeholder="Your nickname"
          />
        </label>

        <fieldset>
          <legend>Add to calendar?</legend>
          <label>
            <input
              type="radio"
              name="addCal"
              value="yes"
              checked={addCal === "yes"}
              onChange={() => setAddCal("yes")}
            />{" "}
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="addCal"
              value="no"
              checked={addCal === "no"}
              onChange={() => setAddCal("no")}
            />{" "}
            No
          </label>
        </fieldset>

        <button
          className="join-button"
          onClick={() => onConfirm({ nick, addCal })}
        >
          OK
        </button>
      </div>
    </div>
  );
}
