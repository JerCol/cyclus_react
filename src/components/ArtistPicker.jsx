import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import "../styles/modal.css";
import { ExternalLink } from "lucide-react";

export default function ArtistPicker({ onScrollBottom }) {
  /* ───────────── state ───────────── */
  const [present, setPresent] = useState([]);   // ordered & filtered list
  const [all, setAll] = useState([]);           // full artist list (for spinning)
  const [reels, setReels] = useState([]);
  const [fixed, setFixed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxLen, setMaxLen] = useState(8);
  const [visibleRows, setVisibleRows] = useState(0); // controls sequential reveal
  const timers = useRef([]);

  /* ───────────── fetch once ───────────── */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("id, name, link, present, order, time_slot")
        .order("order", { ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const pres = data.filter((r) => r.present);
      setPresent(pres);             // already ordered by SQL
      setAll(data);

      // initialise reels / fixed arrays to correct length
      setReels(Array(pres.length).fill(null));
      setFixed(Array(pres.length).fill(false));

      // longest display string length (just the name; time_slot is separate)
      const longestName = pres.reduce((acc, r) => Math.max(acc, r.name.length), 1);
      setMaxLen(longestName);

      setLoading(false);
    })();

    return () => timers.current.forEach(clearInterval);
  }, []);

  /* ───────────── helpers ───────────── */
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const markFixed = (idx) =>
    setFixed((prev) => {
      const copy = [...prev];
      copy[idx] = true;
      return copy;
    });

  const spinOneReel = (slotIdx, finalArtist, frames = 10, frameMs = 40) =>
    new Promise((resolve) => {
      let tick = 0;
      const id = setInterval(() => {
        setReels((prev) => {
          const copy = [...prev];
          copy[slotIdx] = all[Math.floor(Math.random() * all.length)];
          return copy;
        });

        if (++tick >= frames) {
          clearInterval(id);
          setReels((prev) => {
            const copy = [...prev];
            copy[slotIdx] = finalArtist;
            return copy;
          });
          markFixed(slotIdx);
          resolve();
        }
      }, frameMs);

      timers.current.push(id);
    });

  /* ───────────── main spin ───────────── */
  const spin = async () => {
    if (present.length === 0) return;

    timers.current.forEach(clearInterval);
    timers.current = [];

    setReels(Array(present.length).fill(null));
    setFixed(Array(present.length).fill(false));
    setVisibleRows(0);

    // sequentially reveal time_slot labels and spin rows one‑by‑one
    for (let i = 0; i < present.length; i++) {
      setVisibleRows(i + 1);          // show label for the next row first
      await delay(50);                // allow paint
      await spinOneReel(i, present[i]);
      await delay(100);               // small pause before moving on
    }
  };

  /* ───────────── render ───────────── */
  if (loading) return <p>Loading artists…</p>;
  if (present.length === 0) return <p>No artists marked “present”.</p>;

  return (
    <div className="slot-machine-wrapper">
      <button
        className="join-button"
        onClick={() => {
          onScrollBottom?.();
          spin();
        }}
      >
        Line‑up?
      </button>

      <div className="slotmachine">
        {present.slice(0, visibleRows).map((artist, i) => {
          const reelArtist = reels[i];
          const isFixed = fixed[i];
          const hasLink = isFixed && reelArtist && reelArtist.link;
          const nameLabel = reelArtist ? reelArtist.name : "–";

          return (
            <div key={i} className="slot-row">
              <strong className="time-slot">{artist.time_slot}</strong>

              <div
                className={`reel ${reelArtist ? "reel--visible" : ""}`}
                style={{ width: `${maxLen + 2}ch` }}
              >
                {reelArtist ? (
                  hasLink ? (
                    <a
                      href={reelArtist.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${reelArtist.name}`}
                    >
                      {nameLabel}&nbsp;
                      <ExternalLink
                        size={14}
                        strokeWidth={1.5}
                        className="opacity-60"
                        aria-hidden="true"
                      />
                    </a>
                  ) : (
                    <span>{nameLabel}</span>
                  )
                ) : (
                  "–"
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
