import React, { useEffect, useState } from "react";
import "../styles/modal.css";
import concept from "../assets/concept.webp";
import JoinButton from "./JoinButton";
import { jsPDF } from "jspdf";
import { supabase } from "../lib/supabaseClient";
import CostTransparencyModal from "./CostTransparencyModal";
import TicketReceivalModal from "./TicketReceivalModal";

/* ------------------------------------------------------------------
 * Helper: build the poster PDF and return a jsPDF instance.
 * Used by both the download-to-disk flow and the email flow.
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
 * Helper: send the generated PDF to an email address (async).
 * Uses Supabase Edge Function "send-ticket" that accepts JSON:
 *   { email: string, pdfBase64: string }
 * ----------------------------------------------------------------- */
export async function emailPosterPDF(email) {
  const pdf = await createPosterPDF();
  const pdfBase64 = pdf.output('datauristring').split(',')[1];   // strip the prefix

  // ‼️  The string here must be the function’s **slug** (folder name),
  //     *not* the full URL.  In your project that slug is `resend-email`.
  const { data, error } = await supabase.functions.invoke('resend-email', {
    body: { email, pdfBase64 },          // JSON payload
    // method, headers, apikey are filled-in automatically by supabase-js
  });

  if (error) throw error;
  return data;                           // whatever you return from the Edge Function
}

export default function InfoModal({ onClose }) {
  const [links, setLinks] = useState([]);
  const [extraText, setExtraText] = useState(null);
  const [showCosts, setShowCosts] = useState(false);
  const [showReceival, setShowReceival] = useState(false);

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
     Ticket click handler – Payconiq first, then show receival modal
  -------------------------------------------------------------- */
  const handleTicketClick = (ticketName) => {
    const row = links.find((r) => r.name === ticketName);
    if (!row) return;

    const isMobile = /iP(hone|od|ad)|Android/i.test(navigator.userAgent);
    const price = ticketName === "support_ticket" ? 10 : 15;

    /* Log income (fire-and-forget) */
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

    /* 2️⃣ Show the Receival modal */
    setShowReceival(true);

    /* 3️⃣ If the popup was blocked on mobile, fall back to same-tab redirect */
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

      {showReceival && (
        <TicketReceivalModal
          onEmail={emailPosterPDF}
          onClose={() => setShowReceival(false)}
        />
      )}
    </div>
  );
}
