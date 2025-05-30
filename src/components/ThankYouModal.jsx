// src/components/ThankYouModal.jsx
export default function ThankYouModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Thanks for joining & see you soon!</h2>
        <p>
          For the latest updates, follow our {" "}
          <a
            href="https://chat.whatsapp.com/LBvA1PzU6ztJmsRBAzrDJN"
            target="_blank"
            rel="noopener noreferrer"
          >
            channel
          </a>
        </p>
        <button className="join-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
