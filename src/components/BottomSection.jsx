
// src/components/BottomSection.jsx
import JoinButton from "./JoinButton";

export default function BottomSection({ onJoinClick }) {
  return (
    <section className="bar bottom">
      <JoinButton onClick={onJoinClick}>JOIN</JoinButton>
    </section>
  );
}
