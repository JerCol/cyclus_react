/* src/App.jsx – React‑Router enabled version */

import "./App.css";
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

/* ─── assets & visual FX ─────────────────────────────────── */
import bg from "./assets/background.webp";
import RippleBackground from "./RippleBackground.jsx";
import WordSearchBackground from "./components/WordSearchBackground";

/* ─── shared UI components ───────────────────────────────── */
import TopSection      from "./components/TopSection";
import MiddleSection   from "./components/MiddleSection";
import BottomSection   from "./components/BottomSection";
import JoinForm        from "./components/JoinForm";
import ThankYouModal   from "./components/ThankYouModal";
import InfoModal       from "./components/InfoModal";
import TicketModal     from "./components/TicketModal"
import JoinButton      from "./components/JoinButton.jsx"; /* (kept for completeness) */

/* ─── stylesheets ────────────────────────────────────────── */
import "./styles/join-button.css";
import "./styles/modal.css";
import "./styles/info-button.css";

/* ─── data layer ─────────────────────────────────────────── */
import { supabase } from "./lib/supabaseClient";

/* ==========================================================
   MAIN APP COMPONENT
   ========================================================== */
export default function App() {
  /* ── page‑wide state ───────────────────────────────────── */
  const [showForm,   setShowForm]   = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [showInfo,   setShowInfo]   = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [attendeeNames, setAttendeeNames] = useState([]);
  const [newlyJoinedName, setNewlyJoinedName] = useState(null);

  /* ── fetch attendees once at mount ─────────────────────── */
  useEffect(() => {
    async function fetchAttendeesAndCount() {
      /* 1) Count rows */
      const { count, error: countError } = await supabase
        .from("attendees")
        .select("*", { head: true, count: "exact" });
      if (countError) {
        console.error("Error fetching attendee count:", countError.message);
        setAttendeeCount(0);
      } else {
        setAttendeeCount(count);
      }

      /* 2) Fetch names */
      const { data: rows, error: selectError } = await supabase
        .from("attendees")
        .select("name");
      if (selectError) {
        console.error("Error fetching attendee names:", selectError.message);
        setAttendeeNames([]);
      } else {
        setAttendeeNames(rows.map((r) => r.name.toUpperCase()));
      }
    }

    fetchAttendeesAndCount();
  }, []);

  /* ── handlers for various UI actions ───────────────────── */
  const handleJoinClick  = () => setShowForm(true);
  const handleInfoClick  = () => setShowInfo(true);

  const handleFormConfirm = async ({ nick, addCal }) => {
    /* Insert attendee */
    try {
      const upperNick = nick.trim().toUpperCase() || "ANONYMOUS";
      const newAttendee = {
        name: upperNick,
        event_added: addCal === "yes",
      };
      const { error } = await supabase.from("attendees").insert([newAttendee]);
      if (error) {
        console.error("Error inserting attendee:", error.message);
      } else {
        setAttendeeCount((prev) => (prev === null ? 1 : prev + 1));
        setAttendeeNames((prev) => [...prev, upperNick]);
        setNewlyJoinedName(upperNick);
      }
    } catch (err) {
      console.error("Unexpected error when inserting attendee:", err);
    }

    /* Optional calendar invite */
    if (addCal === "yes") {
      const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const dtStart = "20250725T200000";
      const dtEnd   = "20250726T060000";
      const icsLines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Cyclus//EN",
        "BEGIN:VEVENT",
        `UID:${Date.now()}@cyclus`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        "SUMMARY:Cyclus 1",
        "DESCRIPTION:Info -> www.cyclus-bxl.be\\nLocation -> https://maps.app.goo.gl/M7cumcAkbPHygRAW6",
        "END:VEVENT",
        "END:VCALENDAR",
      ];
      const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
      const url  = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement("a"), { href: url, download: "cyclus1.ics" });
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    /* Close form ➜ show thanks */
    setShowForm(false);
    setShowThanks(true);
  };

  /* ─────────────────────────────────────────────────────────
     ROUTING LAYER
     ───────────────────────────────────────────────────────── */
  return (
    <Routes>
      {/* ===== /ticket : ONLY InfoModal and background ===== */}
      <Route path="/ticket" element={<TicketPage />} />

      {/* ===== everything else : normal event page ===== */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );

  /* ─── Ticket‑only page — internal component ───────────── */
  function TicketPage() {
    const navigate = useNavigate();
    return (
      <>
        <div className="bg-image" style={{ backgroundImage: `url(${bg})` }} />
        <TicketModal onClose={() => navigate("/", { replace: true })} />
        <RippleBackground />
      </>
    );
  }

  /* ─── Full event page — internal component ─────────────── */
  function HomePage() {
    return (
      <>
        {/* static background image */}
        <div className="bg-image" style={{ backgroundImage: `url(${bg})` }} />

        {/* animated word‑search overlay */}
        <WordSearchBackground
          words={attendeeNames.slice().reverse()}
          highlightWord={newlyJoinedName}
        />

        {/* main content stack */}
        <div className="page">
          <TopSection onInfoClick={handleInfoClick} attendeeCount={attendeeCount} />
          <MiddleSection />
          <BottomSection onJoinClick={handleJoinClick}>JOIN</BottomSection>

          {showForm   && <JoinForm      onConfirm={handleFormConfirm} onClose={() => setShowForm(false)} />}
          {showThanks && <ThankYouModal onClose={() => setShowThanks(false)} />}   
          {showInfo   && <InfoModal     onClose={() => setShowInfo(false)} />}   
        </div>

        <RippleBackground />
      </>
    );
  }
}
