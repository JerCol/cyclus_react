
// src/components/BottomSection.jsx
import JoinButton from "./JoinButton";

export default function BottomSection({ onInfoClick }) {
  return (
    <section className="bar bottom">
      <JoinButton onClick={onInfoClick}>INFO</JoinButton>
    </section>
  );
}
