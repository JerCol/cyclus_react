/* src/components/InfoModal.jsx – two‑button ticket modal with white‑background PDF export */

import React, { useEffect, useState } from "react";
import "../styles/modal.css";
import concept from "../assets/concept.webp";
import JoinButton from "./JoinButton";
import { jsPDF } from "jspdf";
import { supabase } from "../lib/supabaseClient";

/* ------------------------------------------------------------------
   Helper: create poster PDF with a solid white background and trigger
   download (desktop/Android) or share‑sheet (iOS Safari).
------------------------------------------------------------------- */
function downloadPosterAsPDF() {
  const isiOS = /iP(hone|od|ad)/i.test(navigator.userAgent);

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = concept;
  img.onload = () => {
    // 1. Flatten onto white canvas to eliminate transparency
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 2. Export canvas as JPEG (no alpha)
    const jpegData = canvas.toDataURL("image/jpeg", 0.95);

    // 3. Build PDF the same size as the image
    const orientation = canvas.width > canvas.height ? "l" : "p";
    const pdf = new jsPDF({
      orientation,
      unit: "px",
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(jpegData, "JPEG", 0, 0, canvas.width, canvas.height);

    // 4. Download logic
    if (isiOS) {
      // iOS Safari: use <a download> so user gets the share‑sheet
      const url = pdf.output("bloburl");
      const a = document.createElement("a");
      a.href = url;
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

  /* Click handler */
  const handleTicket = (name) => {
    const row = links.find((r) => r.name === name);
    if (!row) return;

    // 1) Generate / share PDF (counts as user gesture)
   
    window.open(row.link, "_blank");

    // 2) Open payment link shortly after so Safari doesn’t block it
    setTimeout(() => {
      downloadPosterAsPDF();
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="join-button close-button" onClick={onClose}>
          &times;
        </button>

        <div className="modal-body">
          <div className="ticket-buttons">
            <JoinButton onClick={() => handleTicket("support_ticket")}> 
              SUPPORT&nbsp;=&nbsp;€10
            </JoinButton>
            <JoinButton onClick={() => handleTicket("booster_ticket")}> 
              BOOSTER&nbsp;=&nbsp;€15
            </JoinButton>
          </div>
        </div>
      </div>
    </div>
  );
}
