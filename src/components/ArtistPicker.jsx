import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";      // ← adjust path if needed
import "../styles/modal.css";               // keeps the same fonts / colours

export default function ArtistPicker() {
  /* ------------- state ------------- */
  const [present, setPresent]  = useState([]);   // present = true rows
  const [all, setAll]          = useState([]);   // every row (for spinning)
  const [reels, setReels]     = useState([]);   // current items showing
  const [loading, setLoading] = useState(true);
  const [maxLen, setMaxLen]   = useState(8);
  const timers = useRef([]);                    // to clear intervals

  /* ------------- fetch rows once on mount ------------- */
  useEffect(() => {
    (async () => {
       /* 1️⃣  fetch ALL rows once */
    const { data, error } = await supabase
     .from("artists")
     .select("id, name, link, present");
      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

       const pres = data.filter((r) => r.present);   // only present = true

    setPresent(pres);
    setAll(data);
    setReels(Array(pres.length).fill(null));      // one reel per PRESENT artist

    /* width should fit the longest name among ALL artists */
    setMaxLen(
      data.reduce((acc, row) => Math.max(acc, row.name?.length || 0), 1)
    );

      setLoading(false);
    })();

    return () => timers.current.forEach(clearInterval); // cleanup on unmount
  }, []);

  /* ------------- spin animation ------------- */
const spin = () => {
  if (present.length === 0) return;

  // clear any previous intervals
  timers.current.forEach(clearInterval);
  timers.current = [];

  let ticks = 0;
  const totalTicks = 30; // how many “frames” before it stops

  const t = setInterval(() => {
    /* Fisher-Yates shuffle for uniqueness */
    const shuffledAll = [...all].sort(() => Math.random() - 0.5);

    /* …and show only the first N items (N = #present) */
    setReels(shuffledAll.slice(0, present.length));

    ticks += 1;
        if (ticks > totalTicks) {
      /* final frame: shuffle only PRESENT artists for the resting state */
      const final = [...present].sort(() => Math.random() - 0.5);
      setReels(final);
      clearInterval(t);
    }
  }, 100);

  timers.current.push(t);
};


  /* ------------- render ------------- */
  if (loading) return <p>Loading artists…</p>;
  if (present.length === 0) return <p>No artists marked “present”.</p>;

  return (
    <div className="slot-machine-wrapper">
      

      <div className="slotmachine">
  {reels.map((artist, i) => (
    <div
      className="reel"
      key={i}
      style={{ width: `${maxLen + 2}ch` }}
    >
      {artist ? (
        /* clickable only when link is present & non-empty */
        artist.link ? (
          <a
            href={artist.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {artist.name}
          </a>
        ) : (
          <span>{artist.name}</span>
        )
      ) : (
        "-"
      )}
    </div>
  ))}
</div>

      <button className="join-button" onClick={spin}>
        Discover Artists
      </button>

      
    </div>
  );
}
