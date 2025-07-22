// src/components/DrinkModal.jsx
import React, { useEffect, useState } from "react";
import "../styles/modal.css";
import JoinButton from "./JoinButton";
import { supabase } from "../lib/supabaseClient";

/* ------------------------------------------------------------------
 * Optional: a thank‑you popup exactly like the one you already have.
 * You can import the existing one if you prefer.
 * ----------------------------------------------------------------- */
function ThankYouModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="join-button close-button" onClick={onClose}>
          &times;
        </button>
        <div className="modal-body">
          <p><strong>Thanks for grabbing some drink tokens!</strong></p>
          <p>See you at the bar 🥂</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
 * DRINK TOKEN MODAL – main component
 * ----------------------------------------------------------------- */
export default function DrinkModal({ onClose }) {
  const [links, setLinks] = useState([]);
  const [extraText, setExtraText] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);

  /* Fetch Payconiq links for the three packs */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("payment_links")
        .select("name, link")
        .in("name", ["drink_tokens_5", "drink_tokens_10", "drink_tokens_15"]);
      if (!error) setLinks(data);
    })();
  }, []);

  /* Optional paragraph + footer just like the ticket modal */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("text")
        .select("paragraph, footer")
        .eq("name", "drink_explanation")
        .single();
      if (!error) setExtraText(data);
    })();
  }, []);

  /* --------------------------------------------------------------
     Pay & log handler – almost a 1‑to‑1 copy of ticket handler
  -------------------------------------------------------------- */
  const handleDrinkClick = async (tokenName, price) => {
    const row = links.find((r) => r.name === tokenName);
    if (!row) return;

    const isMobile = /iP(hone|od|ad)|Android/i.test(navigator.userAgent);

    /* 1️⃣ Log the sale */
    const { error } = await supabase.from("income").insert([
      {
        name: `drink_sale_${Date.now()}`,
        category: "drink_tokens",
        amount: price,
      },
    ]);
    if (error) console.error("Could not log drink sale:", error);

    /* 2️⃣ Open Payconiq */
    const payOptions = isMobile ? "_blank" : "_blank,noopener,noreferrer";
    const payWindow  = window.open(row.link, payOptions);

    /* 3️⃣ Show thank‑you modal */
    setShowThankYou(true);

    /* 4️⃣ Fallback for blocked pop‑up on mobile */
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
            <JoinButton onClick={() => handleDrinkClick("drink_tokens_5", 10)}>
              5 TOKENS&nbsp;=&nbsp;€10
            </JoinButton>
            <JoinButton onClick={() => handleDrinkClick("drink_tokens_10", 20)}>
              10 TOKENS&nbsp;=&nbsp;€20
            </JoinButton>
            <JoinButton onClick={() => handleDrinkClick("drink_tokens_15", 30)}>
              15 TOKENS&nbsp;=&nbsp;€30
            </JoinButton>
          </div>
        </div>

        {extraText && (
          <div className="modal-extra">
            <p>{extraText.paragraph}</p>
            {extraText.footer && (
              <p className="modal-footer">{extraText.footer}</p>
            )}
          </div>
        )}
      </div>

      {showThankYou && <ThankYouModal onClose={() => setShowThankYou(false)} />}
    </div>
  );
}
