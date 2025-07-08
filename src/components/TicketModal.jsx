// src/components/InfoModal.jsx – two‑button ticket modal with iOS‑safe PDF download

import React, { useEffect, useState } from "react";
import "../styles/modal.css";
import concept from "../assets/concept.webp";
import JoinButton from "./JoinButton";
import { jsPDF } from "jspdf";            // npm i jspdf
import { supabase } from "../lib/supabaseClient";

/**
 * Convert the poster to a PDF and either:
 *   • trigger a direct download (desktop & Android)
 *   • open it in a new tab for iOS Safari, which lacks download support
 */
function downloadPosterAsPDF() {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = concept;

  img.onload = () => {
    const pdf = new jsPDF({
      orientation: img.width > img.height ? "l" : "p",
      unit: "px",
      format: [img.width, img.height],
    });

    /* paint white background to avoid black fill behind transparencies */
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, img.width, img.height, "F");

    pdf.addImage(img, "WEBP", 0, 0, img.width, img.height);

    const isiOS = /iP(hone|od|ad)/i.test(navigator.userAgent);

    if (isiOS) {
      // iOS Safari can’t download blobs – open in a new tab instead
      const blobUrl = pdf.output("bloburl");
      window.open(blobUrl, "_blank");
    } else {
      pdf.save("cyclus_ticket.pdf");
    }
  };
}

export default function InfoModal({ onClose }) {
  const [links, setLinks] = useState([]); // [{ name, link }]

  /* Fetch the two payment links once */
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

  /* Handler – opens the payment link, then downloads/show PDF */
  function handleTicket(name) {
    const row = links.find((r) => r.name === name);
    if (!row) return;

    // 1) generate / show the PDF first (counts as the user gesture)
    downloadPosterAsPDF();

    // 2) then open the external payment link a moment later
    //    (iOS Safari blocks only *additional* pop‑ups that are not
    //     tied to the original gesture; a short delay still works)
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
          {/* Vertically stacked ticket buttons */}
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
