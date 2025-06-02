// src/components/ArtistPicker.jsx
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import "../styles/modal.css";

export default function ArtistPicker() {
  /* ─────────────────── state ─────────────────── */
  const [present, setPresent] = useState([]);   // artists with present=true
  const [all, setAll]         = useState([]);   // every artist row
  const [reels, setReels]     = useState([]);   // what each slot shows
  const [fixed, setFixed]     = useState([]);   // has this slot landed yet?
  const [loading, setLoading] = useState(true);
  const [maxLen, setMaxLen]   = useState(8);    // widest name → CSS width
  const timers = useRef([]);                    // to clear intervals on unmount

  /* ─────────────────── fetch once ─────────────────── */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("id, name, link, present");

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const pres = data.filter(r => r.present);
      setPresent(pres);
      setAll(data);

      // initial empty reels & flags
      setReels(Array(pres.length).fill(null));
      setFixed(Array(pres.length).fill(false));

      // for a neat grid give every slot the width of the longest name
      setMaxLen(
        data.reduce((acc, r) => Math.max(acc, r.name?.length || 0), 1)
      );

      setLoading(false);
    })();

    // clear any running intervals if the component unmounts
    return () => timers.current.forEach(clearInterval);
  }, []);

  /* ─────────────────── helpers ─────────────────── */
  const delay = ms => new Promise(res => setTimeout(res, ms));

  const markFixed = idx =>
    setFixed(prev => {
      const copy = [...prev];
      copy[idx] = true;
      return copy;
    });

  /** Spin one slot, then resolve when it lands on its final artist */
  const spinOneReel = (slotIdx, finalArtist, frames = 25, frameMs = 90) =>
    new Promise(resolve => {
      let tick = 0;
      const id = setInterval(() => {
        // show a random artist while spinning
        setReels(prev => {
          const copy = [...prev];
          copy[slotIdx] = all[Math.floor(Math.random() * all.length)];
          return copy;
        });

        if (++tick >= frames) {
          clearInterval(id);

          // land on the final artist
          setReels(prev => {
            const copy = [...prev];
            copy[slotIdx] = finalArtist;
            return copy;
          });
          markFixed(slotIdx); // make it clickable
          resolve();
        }
      }, frameMs);

      timers.current.push(id);
    });

  /* ─────────────────── main “spin” ─────────────────── */
  const spin = async () => {
    if (present.length === 0) return;

    // stop any earlier animations
    timers.current.forEach(clearInterval);
    timers.current = [];

    // reset reels & flags
    setReels(Array(present.length).fill(null));
    setFixed(Array(present.length).fill(false));

    // choose random final order for the landing state
    const finalOrder = [...present].sort(() => Math.random() - 0.5);

    // spin each reel sequentially (top → bottom)
    for (let i = 0; i < finalOrder.length; i++) {
      await spinOneReel(i, finalOrder[i]);
      await delay(150); // little gap before the next slot starts
    }
  };

  /* ─────────────────── render ─────────────────── */
  if (loading)               return <p>Loading artists…</p>;
  if (present.length === 0)  return <p>No artists marked “present”.</p>;

  return (
    <div className="slot-machine-wrapper">
      <button className="join-button" onClick={spin}>
        Discover Artists
      </button>

      <div className="slotmachine">
        {reels.map((artist, i) => {
          const isFixed   = fixed[i];
          const clickable = isFixed && artist && artist.link;

          return (
            <div
              key={i}
              className={`reel ${clickable ? "reel--clickable" : ""} ${
                artist ? "reel--visible" : ""
              }`}
              style={{ width: `${maxLen + 2}ch` }}   /* +2ch padding */
            >
              {artist ? (
                clickable ? (
                  <a
                    href={artist.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${artist.name}`}
                  >
                    {artist.name}
                  </a>
                ) : (
                  <span>{artist.name}</span>
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
