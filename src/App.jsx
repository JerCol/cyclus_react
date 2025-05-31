import "./App.css";
import React, { useState, useEffect } from "react";
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
import InfoModal from "./components/InfoModal"; // <— import your new InfoModal
import { supabase } from "./lib/supabaseClient"; 
import WordSearchBackground from "./components/WordSearchBackground";





export default function App() {
  
  const [showForm, setShowForm] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [showInfo, setShowInfo] = useState(false); // <— new state for Info
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [attendeeNames, setAttendeeNames] = useState([]); 
  const [newlyJoinedName, setNewlyJoinedName] = useState(null);


    useEffect(() => {
    async function fetchAttendeesAndCount() {
      // 1a) Haal de count op
      let { count, error: countError } = await supabase
        .from("attendees")
        .select("*", { head: true, count: "exact" });
      if (countError) {
        console.error("Error fetching attendee count:", countError.message);
        setAttendeeCount(0);
      } else {
        setAttendeeCount(count);
      }

      // 1b) Haal alle namen op uit de tabel
      let { data: rows, error: selectError } = await supabase
        .from("attendees")
        .select("name");
      if (selectError) {
        console.error("Error fetching attendee names:", selectError.message);
        setAttendeeNames([]);
      } else {
        // rows is array van objecten { name: "…" }
        setAttendeeNames(rows.map((r) => r.name.toUpperCase()));
      }
    }

    fetchAttendeesAndCount();
  }, []);
  const handleJoinClick = () => setShowForm(true);
  const handleInfoClick = () => setShowInfo(true);

  const handleFormConfirm = async ({ nick, addCal }) => {
    // do whatever you like with `nick`

    try {
       // Zet de nickname om in hoofdletters, want we willen de woordzoeker zonder hoofdletter‐gevoeligheid
      const upperNick = nick.trim().toUpperCase() || "ANONYMOUS";

      // 2a) Invoegen in Supabase
      const newAttendee = {
        name: upperNick,
        event_added: addCal === "yes",
      };
      const { data, error } = await supabase
        .from("attendees")
        .insert([newAttendee]);

      if (error) {
        console.error("Error inserting attendee:", error.message);
      } else {
        // Succesvol: update attendeeCount en attendeeNames
        setAttendeeCount((prev) => (prev === null ? 1 : prev + 1));
        setAttendeeNames((prevArray) => [...prevArray, upperNick]);
        setNewlyJoinedName(upperNick);
      }
    } catch (err) {
      console.error("Unexpected error when inserting attendee:", err);
    }

    // ——————————————————————————
    // 2) IF addCal === "yes", generate & download ICS
    // ——————————————————————————
    if (addCal === "yes") {
      const dtStamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0] + "Z";
      const dtStart = "20250725T200000";
      const dtEnd = "20250726T060000";
      const icsLines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//YourApp//EN",
        "BEGIN:VEVENT",
        `UID:${Date.now()}@yourapp`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        "SUMMARY:Cyclus 1",
        "DESCRIPTION:location: Brussel, Ganshoren - https://maps.app.goo.gl/M7cumcAkbPHygRAW6",
        "END:VEVENT",
        "END:VCALENDAR",
      ];
      const icsContent = icsLines.join("\r\n");

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

    // ——————————————
    // 3) CLOSE FORM & OPEN THANK YOU
    // ——————————————
    setShowForm(false);
    setShowThanks(true);
  };

  return (
    <>
     <div
        className="bg-image"
        style={{ backgroundImage: `url(${bg})` }}
      /> 
     {/* 3) Render de WordSearch‐achtergrond op de hele pagina */}
      <WordSearchBackground
        words={attendeeNames}
        highlightWord={newlyJoinedName}
      />

     
    <div className="page">
      <TopSection 
          onInfoClick={handleInfoClick}
          attendeeCount={attendeeCount}
      />
      <MiddleSection />
      <BottomSection onJoinClick={handleJoinClick}>JOIN</BottomSection>
      {showForm && (
        <JoinForm
          onConfirm={handleFormConfirm}
          onClose={() => setShowForm(false)}
        />
      )}
       {showThanks && (
       <ThankYouModal onClose={() => setShowThanks(false)} />
       
     )}
     {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
    <RippleBackground />
    </>
  );
}
