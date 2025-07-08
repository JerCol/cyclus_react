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
    /* 1.   Draw onto a white canvas so there is never transparency */
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    /* 2.   Export canvas → JPEG data URL (no alpha) */
    const jpgData = canvas.toDataURL("image/jpeg", 1.0);

    /* 3.   Build the PDF */
    const pdf = new jsPDF({
      orientation: img.width > img.height ? "l" : "p",
      unit: "px",
      format: [img.width, img.height],
    });

    // full‑page white already, but embed the image anyway
    pdf.addImage(jpgData, "JPEG", 0, 0, img.width, img.height);

    /* 4.   Overlay THANK‑YOU banner at the vertical centre */
    pdf.setFontSize(48);
    pdf.setTextColor(255, 215, 0); // golden yellow
    pdf.setFont("helvetica", "bold");
    pdf.text(
      "THANKS FOR YOUR SUPPORT",
      img.width / 2,
      img.height / 2,
      { align: "center" }
    );

    /* 5.   Download / share */
    const blob = pdf.output("blob");
    const blobUrl = URL.createObjectURL(blob);

    if (isiOS) {
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
