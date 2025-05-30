export default function JoinButton({ onClick, className = '' }) {
  return (
    <button className={`join-button ${className}`} onClick={onClick}>
      JOIN
    </button>
  );
}
