import JoinButton from "./JoinButton";

export default function TopSection({ onJoinClick }) {
  return (
    <section className="bar top">
      <JoinButton onClick={onJoinClick}>JOIN</JoinButton>
    </section>
  );
}
