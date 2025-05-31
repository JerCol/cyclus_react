// src/components/JoinButton.jsx
export default function JoinButton({
  children = "JOIN",
  onClick = () => alert("Thanks for joining!"),
  className = "",
}) {
  return (
    <button className={`join-button ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}
