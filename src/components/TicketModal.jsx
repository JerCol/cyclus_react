/* src/components/InfoModal.jsx – two‑button modal fetching payment_links table
   Names expected in DB: "support_ticket", "booster_ticket" */

import React, { useEffect, useState } from "react";
import "../styles/modal.css";
import concept from "../assets/concept.webp";
import JoinButton from "./JoinButton";
import { jsPDF } from "jspdf";           // ensure: npm i jspdf
import { supabase } from "../lib/supabaseClient";

/**
 * Converts `concept.webp` to a one‑page PDF *with white background*
 * and triggers an immediate download.
 */
async function downloadPosterAsPDF() {
  const img = new Image();
  img.src = concept;
  await new Promise((res) => (img.onload = res));

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  const dataURL = canvas.toDataURL("image/jpeg", 1.0);

  const pdf = new jsPDF({
    orientation: img.width > img.height ? "l" : "p",
    unit: "px",
    format: [img.width, img.height],
  });
  pdf.addImage(dataURL, "JPEG", 0, 0, img.width, img.height);
  pdf.save("cyclus_ticket.pdf");
}

// Price labels stay the same
const PRICE_LABEL = {
  support_ticket: "€10",
  booster_ticket: "€15",
};

// Display text for button labels (uppercase, no "Ticket")
const DISPLAY_LABEL = {
  support_ticket: "SUPPORT",
  booster_ticket: "BOOSTER",
};

export default function InfoModal({ onClose }) {
  const [links, setLinks] = useState({});

  // Fetch payment links for the two known ticket names
  useEffect(() => {
    const fetchLinks = async () => {
      const { data, error } = await supabase
        .from("payment_links")
        .select("name, link")
        .in("name", ["support_ticket", "booster_ticket"]);

      if (!error && data) {
        const map = {};
        data.forEach(({ name, link }) => {
          map[name] = link;
        });
        setLinks(map);
      } else {
        console.error("Supabase payment_links fetch error:", error);
      }
    };

    fetchLinks();
  }, []);

  const handleTicketClick = (ticketName) => {
    const url = links[ticketName];
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    downloadPosterAsPDF();
  };

  const TICKETS = ["support_ticket", "booster_ticket"];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="join-button close-button" onClick={onClose}>
          &times;
        </button>

        <div className="modal-body ticket-buttons">
          {TICKETS.map((name) => (
            <JoinButton key={name} onClick={() => handleTicketClick(name)}>
              {DISPLAY_LABEL[name]} =&nbsp;{PRICE_LABEL[name]}
            </JoinButton>
          ))}
        </div>
      </div>
    </div>
  );
}
