import "./App.css";
import drawing from "./assets/drawing.png";   // or "/drawing.png" if it’s in public/
import bg        from './assets/background.png';
import RippleBackground from './RippleBackground.jsx';


export default function App() {
  return (
     <>
      {/* static background image (stays at the very back) */}
      <div
        className="bg-image"
        style={{ backgroundImage: `url(${bg})` }}
      />

    <div className="page">
      <section className="bar top">
        <button
          className="join-button"
          onClick={() => alert('Thanks for joining!')}
        >
          INFO
        </button>
      </section>

      <section className="bar middle">
        <img src={drawing} alt="Illustration" />
      </section>

      <section className="bar bottom">
        <button
          className="join-button"
          onClick={() => alert('Thanks for joining!')}
        >
          JOIN
        </button>
      </section>
    </div>
    <RippleBackground />
  </>
  );
}
