import React, { useEffect, useState } from "react";
import "../styles/modal.css";
import concept from "../assets/concept.webp";
import JoinButton from "./JoinButton";
import { jsPDF } from "jspdf";
import { supabase } from "../lib/supabaseClient";
import CostTransparencyModal from "./CostTransparencyModal";

/* ------------------------------------------------------------------
 * Helper: build the poster PDF and return a jsPDF instance.
 * (Kept here in case you still need the function elsewhere.)
 * ----------------------------------------------------------------- */
export function createPosterPDF() {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = concept;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const jpgData = canvas.toDataURL("image/jpeg", 1.0);

      const pdf = new jsPDF({
        orientation: img.width > img.height ? "l" : "p",
        unit: "px",
        format: [img.width, img.height],
      });

      pdf.addImage(jpgData, "JPEG", 0, 0, img.width, img.height);
      pdf.setFontSize(48);
      pdf.setTextColor(255, 215, 0);
      pdf.setFont("helvetica", "bold");
      pdf.text("THANKS FOR YOUR SUPPORT", img.width / 2, img.height / 2, {
        align: "center",
      });

      resolve(pdf);
    };
  });
}

/* ------------------------------------------------------------------
 * Helper: trigger a browser download of the poster PDF.
 * iOS Safari requires the blobUrl hack to show the share sheet.
 * ----------------------------------------------------------------- */
export async function savePosterPDF() {
  const isiOS = /iP(hone|od|ad)/i.test(navigator.userAgent);
  const pdf = await createPosterPDF();

  if (isiOS) {
    const a = document.createElement("a");
    a.href = pdf.output("bloburl");
    a.download = "cyclus_ticket.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    pdf.save("cyclus_ticket.pdf");
  }
}

/* ------------------------------------------------------------------
 * Thank‑You modal shown after ticket purchase
 * ----------------------------------------------------------------- */
function ThankYouModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="join-button close-button" onClick={onClose}>
          &times;
        </button>
        <div className="modal-body">
          <p><strong>Thanks for your support!</strong></p>
          <p>
            Doors open at <strong>19h30</strong> for our shared dinner (vegan option
            available).<br />We’d love you to dine with us so the adventure starts
            collectively from the very beginning.
          </p>
          <p>See you soon!</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
 * InfoModal – main component
 * ----------------------------------------------------------------- */
export default function InfoModal({ onClose }) {
  const [links, setLinks] = useState([]);
  const [extraText, setExtraText] = useState(null);
  const [showCosts, setShowCosts] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  /* Fetch payment links */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("payment_links")
        .select("name, link")
        .in("name", ["support_ticket", "booster_ticket"]);
      if (!error) setLinks(data);
    })();
  }, []);

  /* Fetch explanatory paragraph + footer */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("text")
        .select("paragraph, footer")
        .eq("name", "ticket_explanation")
        .single();
      if (!error) setExtraText(data);
    })();
  }, []);

  /* --------------------------------------------------------------
     Ticket click handler – Payconiq first, then show thank‑you modal
  -------------------------------------------------------------- */
  const handleTicketClick = (ticketName) => {
    const row = links.find((r) => r.name === ticketName);
    if (!row) return;

    const isMobile = /iP(hone|od|ad)|Android/i.test(navigator.userAgent);
    const price = ticketName === "support_ticket" ? 10 : 15;

    /* Log income (fire‑and‑forget) */
    supabase
      .from("income")
      .insert([{ name: `ticket_sale_${Date.now()}`, category: "ticket", amount: price }]);

    /* 1️⃣ Open the Payconiq link */
    let payWindow;
    if (isMobile) {
      payWindow = window.open(row.link, "_blank");
    } else {
      payWindow = window.open(row.link, "_blank", "noopener,noreferrer");
    }

    /* 2️⃣ Show the Thank‑You modal */
    setShowThankYou(true);

    /* 3️⃣ If the popup was blocked on mobile, fall back to same‑tab redirect */
    if (isMobile && !payWindow) {
      window.location.href = row.link;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="join-button close-button" onClick={onClose}>
          &times;
        </button>

        <div className="modal-body">
          <div className="ticket-buttons">
            <JoinButton onClick={() => handleTicketClick("support_ticket")}>SUPPORT&nbsp;=&nbsp;€10</JoinButton>
            <JoinButton onClick={() => handleTicketClick("booster_ticket")}>BOOSTER&nbsp;=&nbsp;€15</JoinButton>
          </div>
        </div>

        {extraText && (
          <div className="modal-extra">
            <p>{extraText.paragraph}</p>
            {extraText.footer && <p className="modal-footer">{extraText.footer}</p>}
          </div>
        )}
      </div>

      {showCosts && <CostTransparencyModal onClose={() => setShowCosts(false)} />}

      {showThankYou && <ThankYouModal onClose={() => setShowThankYou(false)} />}
    </div>
  );
}
