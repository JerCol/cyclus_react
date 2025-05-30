// src/RippleBackground.jsx
export default function RippleBackground() {
  // four <span>s give four staggered pulses
  return (
    <div className="bg-ripple">
      {[...Array(10)].map((_, i) => (
        <span key={i} style={{ animationDelay: `${i * 2}s` }} />
      ))}
    </div>
  );
}
