import RippleBackground from './RippleBackground.jsx';
import bg        from './assets/background.png';
import drawing   from './assets/drawing.png';
import JoinButton from './JoinButton.jsx';

export default function App() {
  return (
    <>
      {/* static background image (stays at the very back) */}
      <div
        className="bg-image"
        style={{ backgroundImage: `url(${bg})` }}
      />

      {/* drawing + grid overlay */}
      <div className="image-container">
  <img src={drawing} alt="drawing" className="responsive-drawing" />
  <button
    className="join-button"
    onClick={() => alert('Thanks for joining!')}
  >
    JOIN
  </button>
</div>


      <RippleBackground />
    </>
  );
}
