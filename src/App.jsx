import "./App.css";
import { useState } from "react";
import drawing from "./assets/drawing.png";   // or "/drawing.png" if it’s in public/
import bg        from './assets/background.png';
import RippleBackground from './RippleBackground.jsx';
import JoinButton from "./components/JoinButton.jsx";
import "./styles/join-button.css";  // ensure your button skin is loaded
import "./styles/modal.css"; 
import "./styles/info-button.css"; 

import TopSection from "./components/TopSection";
import MiddleSection from "./components/MiddleSection";
import BottomSection from "./components/BottomSection";
import JoinForm from "./components/JoinForm";



export default function App() {
  
  const [showForm, setShowForm] = useState(false);
  const handleJoinClick = () => setShowForm(true);
  const handleFormConfirm = ({ nick, addCal }) => {
    // you can send this data to your server or schedule a calendar event
    console.log("Nickname:", nick);
    console.log("Add to calendar:", addCal);
    setShowForm(false);
    alert("Thanks for joining!"); 
  };

  return (
    <>
     <div
        className="bg-image"
        style={{ backgroundImage: `url(${bg})` }}
      />
    <div className="page">
      <TopSection onJoinClick={handleJoinClick} />
      <MiddleSection />
      <BottomSection />
      {showForm && (
        <JoinForm
          onConfirm={handleFormConfirm}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
    <RippleBackground />
    </>
  );
}
