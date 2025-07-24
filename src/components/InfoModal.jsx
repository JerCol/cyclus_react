import React, { useEffect, useState, useRef } from "react";
import "../styles/modal.css"; // ensure this file is present
import concept from "../assets/concept.webp";
import ArtistPicker from "./ArtistPicker";
import { supabase } from "../lib/supabaseClient";
import { ExternalLink } from "lucide-react"; // or your preferred icon library


export default function InfoModal({ onClose }) {
  const [aboutText, setAboutText] = useState("");
  const [footerText, setFooterText] = useState("");
  const bodyRef = useRef(null);          // container that scrolls
  const bottomRef = useRef(null);        // sentinel we scroll into view

  useEffect(() => {
    const fetchCopy = async () => {
      const { data, error } = await supabase
        .from("text")
        .select("paragraph, footer")
        .eq("name", "about_us")
        .single();

      if (!error && data) {
        setAboutText(data.paragraph || "");
        setFooterText(data.footer || "");
      } else {
        console.error("Supabase fetch error:", error);
      }
    };

    fetchCopy();
  }, []);

  const renderAboutParagraphs = () => {
    if (!aboutText) return <p>Loading…</p>;

    return aboutText
      .split(/\n\s*\n|\n/)
      .filter(Boolean)
      .map((para, idx) => (
        <p key={idx} style={{ fontSize: "0.75rem" }}>
          {para.trim()}
        </p>
      ));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="join-button close-button" onClick={onClose}>
          &times;
        </button>

        {/* Make sure .modal-body has overflow-y: auto and a max-height in CSS */}
        <div className="modal-body" ref={bodyRef}>
          {/* Main heading */}
          <h2>CYCLUS 1</h2>

          {/* Event details */}
          <p>
  <strong>Date:</strong> 25.07.2025&nbsp;(19:30 – 05:30)
  <br />
  <strong>Location:</strong>{" "}
  <a
    href="https://maps.app.goo.gl/M7cumcAkbPHygRAW6"
    target="_blank"
    rel="noopener noreferrer"
  >
    Brussel (Ganshoren)
  </a>
  <br />
  <strong>Follow on:&nbsp;</strong>

  {/* Instagram */}
  <a
    href="https://www.instagram.com/cyclus.bxl?igsh=am9nYjhpcXJtOW15"
    target="_blank"
    rel="noopener noreferrer"
    style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
  >
    <img
      src="https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/instagram.svg"
      alt="Instagram"
      style={{ width: 24, height: 24 }}
    />
    <ExternalLink
      size={14}
      strokeWidth={1.5}
      className="opacity-60"
      aria-hidden="true"
    />
  </a>

  and/or&nbsp;

  {/* WhatsApp */}
  <a
    href="https://chat.whatsapp.com/LBvA1PzU6ztJmsRBAzrDJN?mode=r_c"
    target="_blank"
    rel="noopener noreferrer"
    style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
  >
    <img
      src="https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/whatsapp.svg"
      alt="WhatsApp"
      style={{ width: 24, height: 24 }}
    />
    <ExternalLink
      size={14}
      strokeWidth={1.5}
      className="opacity-60"
      aria-hidden="true"
    />
  </a>
</p>



          {/* Poster / hero image */}
          <img
            src={concept}
            alt="Cyclus event poster"
            className="modal-image"
          />

          {/* Artist picker */}
          <ArtistPicker
            onScrollBottom={() => {
              // scroll the sentinel into view; this works regardless of container size
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          

          {/* Expandable About Us section */}
          <details className="about-section">
            <summary>About Us</summary>
            {renderAboutParagraphs()}
            {footerText && (
              <p
                className="about-footer"
                style={{ fontStyle: "italic", fontSize: "0.6rem" }}
              >
                {footerText}
              </p>
            )}
          </details>

          {/* sentinel element to scroll to */}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}