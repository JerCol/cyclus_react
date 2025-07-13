
// src/components/BottomSection.jsx
import JoinButton from "./JoinButton";

export default function BottomSection({ onJoinClick }) {
  return (
    <section className="bar bottom">
      <JoinButton className="support-button" onClick={onJoinClick}>RSVP</JoinButton>
    </section>
  );
}
