// src/components/TicketReceivalModal.jsx
import React, { useState } from "react";
import "../styles/modal.css";
import JoinButton from "./JoinButton";

export default function TicketReceivalModal({ onDownload, onEmail, onClose }) {
  const [emailSending, setEmailSending] = useState(false);
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState(null);

  /* ---- Handlers -------------------------------------------------- */

  const handleDownloadClick = async () => {
    setDownloading(true);
    setFeedback(null);
    try {
      await onDownload();           // generate + save the PDF
    } finally {
      setDownloading(false);
    }
  };

  const handleEmailClick = async () => {
    const trimmed = email.trim();
    const emailRegex =/^[^\s@]+(?:\.[^\s@]+)*@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      setFeedback({ type: "error", msg: "Please enter a valid e-mail address." });
      return;
    }

    setEmailSending(true);
    setFeedback(null);
    try {
      await onEmail(email);         // send the PDF via e-mail
      setFeedback({ type: "success", msg: "Ticket sent! Check your inbox (or spam)." });
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", msg: "Oops, something went wrong. Please try again." });
    } finally {
      setEmailSending(false);
    }
  };

  /* ---- UI -------------------------------------------------------- */

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="join-button close-button" onClick={onClose}>
          &times;
        </button>

        <div className="modal-body">
          <p>
            Your payment link has opened in a new tab. Once you’ve completed the payment,
            you can e-mail your ticket:
          </p>

          <div className="pdf-actions flex flex-col gap-4 mt-4">
            
            {/* E-mail */}
            <div className="flex flex-col gap-2 w-full">
              <input
                className="email-input"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              /><br></br><br></br>
              <JoinButton onClick={handleEmailClick} disabled={emailSending}>
                {emailSending ? "Sending…" : "Send to e-mail"}
              </JoinButton>
            </div>
          </div>

          {/* Status feedback */}
          {feedback && (
            <p className={feedback.type === "error" ? "text-red-600" : "text-green-600"}>
              {feedback.msg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
