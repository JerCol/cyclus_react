/* src/components/InfoModal.jsx – two‑step ticket & dinner modal
   with white‑background PDF export + cost transparency link + income insert */

import React, { useEffect, useState } from "react";
import "../styles/modal.css";
import concept from "../assets/concept.webp";
import JoinButton from "./JoinButton";
import { jsPDF } from "jspdf";
import { supabase } from "../lib/supabaseClient";
import CostTransparencyModal from "./CostTransparencyModal";

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
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [askDinner, setAskDinner] = useState(false);
  const [showCosts, setShowCosts] = useState(false);

  /* Fetch payment links once */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("payment_links")
        .select("name, link")
        .in("name", [
          "support_ticket",
          "booster_ticket",
          "support_dinner_ticket",
          "booster_dinner_ticket",
        ]);
      if (error) {
        console.error("Supabase payment_links fetch error:", error);
      } else {
        setLinks(data);
      }
    })();
  }, []);

  /* --------------------------------------------------------------
     STEP 1: Ticket button clicked – ask for dinner opt‑in
  -------------------------------------------------------------- */
  const handleTicketClick = (ticketName) => {
    setSelectedTicket(ticketName);
    setAskDinner(true);
  };

  /* --------------------------------------------------------------
     STEP 2: Dinner choice answered – open link + record income
  -------------------------------------------------------------- */
  const handleDinnerChoice = async (choice) => {
    const baseRow = links.find((r) => r.name === selectedTicket);
    if (!baseRow) return;

    const dinnerRowName =
      selectedTicket === "support_ticket"
        ? "support_dinner_ticket"
        : "booster_dinner_ticket";
    const dinnerRow = links.find((r) => r.name === dinnerRowName);

    /* 1) Determine amount */
    const basePrice = selectedTicket === "support_ticket" ? 10 : 15;
    const dinnerExtra = choice === "yes" ? 8 : 0;
    const totalAmount = basePrice + dinnerExtra;

    /* Log dinner choice */
try {
  await supabase.from("dinner").insert([
    {
      name: `dinner_choice_${Date.now()}`, // arbitrary identifier
      attendance: choice,                  // "yes" | "not-sure" | "no"
    },
  ]);
} catch (err) {
  console.error("Failed inserting dinner choice:", err.message);
}


    /* 2) Insert into income table */
    try {
      await supabase.from("income").insert([
        {
          name: `ticket_sale_${Date.now()}`,
          category: "ticket",
          amount: totalAmount,
        },
      ]);
    } catch (err) {
      console.error("Failed inserting income:", err.message);
    }

    /* 3) Open payment link */
    if (choice === "yes" && dinnerRow) {
      window.open(dinnerRow.link, "_blank");
    } else {
      window.open(baseRow.link, "_blank");
    }

    /* 4) Generate / share PDF after slight delay */
    setTimeout(downloadPosterAsPDF, 600);

    /* 5) Reset dialog state */
    setAskDinner(false);
    setSelectedTicket(null);
  };

  /* ------------------------------------------------------------------
     UI helpers
  ------------------------------------------------------------------ */
  const DinnerPrompt = () => (
    <div className="dinner-prompt">
      <h2 className="dinner-title" style={{ textAlign: "center" }}>
        Join our dinner?
        <br />
        <small style={{ fontSize: "0.8rem", display: "block", marginTop: "0.25rem" }}>
          (starts from 19:30)
        </small>
      </h2>
      <div className="dinner-buttons" style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <JoinButton onClick={() => handleDinnerChoice("yes")}>Yes (+€8)</JoinButton>
        <JoinButton onClick={() => handleDinnerChoice("not-sure")}>Not&nbsp;sure&nbsp;yet</JoinButton>
        <JoinButton onClick={() => handleDinnerChoice("no")}>No</JoinButton>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="join-button close-button" onClick={onClose}>
          &times;
        </button>

        <div className="modal-body">
          {askDinner ? (
            <DinnerPrompt />
          ) : (
            <>
              <div className="ticket-buttons">
                <JoinButton onClick={() => handleTicketClick("support_ticket")}>SUPPORT&nbsp;=&nbsp;€10</JoinButton>
                <JoinButton onClick={() => handleTicketClick("booster_ticket")}>BOOSTER&nbsp;=&nbsp;€15</JoinButton>
              </div>
              {/* <div style={{ marginTop: "1rem", textAlign: "center" }}>
                <button
                  style={{ background: "none", border: "none", color: "#00C49F", cursor: "pointer", textDecoration: "underline", fontSize: "0.9rem" }}
                  onClick={() => setShowCosts(true)}
                >
                  cost transparency
                </button>
              </div> */}
            </>
          )}
        </div>
      </div>

      {showCosts && <CostTransparencyModal onClose={() => setShowCosts(false)} />}
    </div>
  );
}
