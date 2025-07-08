// src/components/ArtistPicker.jsx – now honours `order` & `time_slot`
// ------------------------------------------------------------------
// • Artists fetched in explicit order (ascending `order` column)
// • Each reel shows "{time_slot}: {name}" if a time_slot is present
// ------------------------------------------------------------------

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
  const timers = useRef([]);

  /* ───────────── fetch once ───────────── */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("id, name, link, present, order, time_slot")
        .order("order", { ascending: true }); // ensures the SQL result is ordered

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

      // longest display string length (time_slot + ": " + name)
      const longest = pres.reduce((acc, r) => {
        const str = `${r.time_slot ? r.time_slot + ": " : ""}${r.name}`;
        return Math.max(acc, str.length);
      }, 1);
      setMaxLen(longest);

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

    // keep the predetermined order, but still spin sequentially
    for (let i = 0; i < present.length; i++) {
      await spinOneReel(i, present[i]);
      await delay(10);
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
        Line-up?
      </button>

      <div className="slotmachine">
        {reels.map((artist, i) => {
          const isFixed = fixed[i];
          const hasLink = isFixed && artist && artist.link;
          const label = artist
            ? `${artist.time_slot ? artist.time_slot + ": " : ""}${artist.name}`
            : "–";

          return (
            <div
              key={i}
              className={`reel ${artist ? "reel--visible" : ""}`}
              style={{ width: `${maxLen + 2}ch` }}
            >
              {artist ? (
                hasLink ? (
                  <a
                    href={artist.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${artist.name}`}
                  >
                    {label}&nbsp;
                    <ExternalLink
                      size={14}
                      strokeWidth={1.5}
                      className="opacity-60"
                      aria-hidden="true"
                    />
                  </a>
                ) : (
                  <span>{label}</span>
                )
              ) : (
                "–"
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
