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
import ThankYouModal from "./components/ThankYouModal";



export default function App() {
  
  const [showForm, setShowForm] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const handleJoinClick = () => setShowForm(true);
  const handleFormConfirm = ({ nick, addCal }) => {
    // do whatever you like with `nick`
    console.log("Nickname:", nick);

    if (addCal === "yes") {
      // 1) Build ICS content
      const dtStamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0] + "Z";
      const dtStart = "20250725T200000";
      const dtEnd   = "20250726T060000";
      const icsLines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//YourApp//EN",
        "BEGIN:VEVENT",
        `UID:${Date.now()}@yourapp`,       // simple unique ID
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        "SUMMARY:Cyclus 1",
        "DESCRIPTION:location: Brussel, Ganshoren - https://maps.app.goo.gl/M7cumcAkbPHygRAW6",
        "END:VEVENT",
        "END:VCALENDAR",
      ];
      const icsContent = icsLines.join("\r\n");

      // 2) Create a blob & download link
      const blob = new Blob([icsContent], {
        type: "text/calendar;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cyclus1.ics";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    setShowForm(false);
    setShowThanks(true);
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
       {showThanks && (
       <ThankYouModal onClose={() => setShowThanks(false)} />
     )}
    </div>
    <RippleBackground />
    </>
  );
}
