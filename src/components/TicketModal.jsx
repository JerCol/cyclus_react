/* src/components/InfoModal.jsx – cleaned‑up two‑button ticket modal */

import React, { useEffect, useState } from "react";
import "../styles/modal.css";
import concept from "../assets/concept.webp";
import JoinButton from "./JoinButton";
import { jsPDF } from "jspdf"; // npm i jspdf
import { supabase } from "../lib/supabaseClient";

/**
 * Generate the poster PDF and either
 * – download it directly (desktop & Android)
 * – trigger iOS Safari’s share‑sheet via a hidden <a download>
 */
function downloadPosterAsPDF() {
  const isiOS = /iP(hone|od|ad)/i.test(navigator.userAgent);

  const img = new Image();
  img.src = concept;
  img.onload = () => {
    const pdf = new jsPDF({
      orientation: img.width > img.height ? "l" : "p",
      unit: "px",
      format: [img.width, img.height],
    });

    // white background behind the WEBP
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, img.width, img.height, "F");
    pdf.addImage(img, "WEBP", 0, 0, img.width, img.height);

    const blob = pdf.output("blob");
    const blobUrl = URL.createObjectURL(blob);

    if (isiOS) {
      // iOS Safari: open share‑sheet so user can “Save to Files”
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "cyclus_ticket.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      pdf.save("cyclus_ticket.pdf");
    }
  };
}

export default function InfoModal({ onClose }) {
  const [links, setLinks] = useState([]);

  /* Fetch payment links once */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("payment_links")
        .select("name, link")
        .in("name", ["support_ticket", "booster_ticket"]);

      if (error) {
        console.error("Supabase payment_links fetch error:", error);
      } else {
        setLinks(data);
      }
    })();
  }, []);

  function handleTicket(name) {
    const row = links.find((r) => r.name === name);
    if (!row) return;

    // 1) download / show PDF first (gesture‑based)
    downloadPosterAsPDF();

    // 2) open external payment link shortly after to avoid popup block
    setTimeout(() => {
      window.open(row.link, "_blank");
    }, 600);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="join-button close-button" onClick={onClose}>
          &times;
        </button>

        <div className="modal-body">
          <div className="ticket-buttons">
            <JoinButton onClick={() => handleTicket("support_ticket")}> 
              SUPPORT = €10
            </JoinButton>
            <JoinButton onClick={() => handleTicket("booster_ticket")}> 
              BOOSTER = €15
            </JoinButton>
          </div>
        </div>
      </div>
    </div>
  );
}
