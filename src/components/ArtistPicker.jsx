// src/components/ArtistPicker.jsx
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import "../styles/modal.css";
import { ExternalLink } from "lucide-react";

export default function ArtistPicker({ onScrollBottom }) {
  /* ───────────── state ───────────── */
  const [present, setPresent] = useState([]);
  const [all, setAll] = useState([]);
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
        .select("id, name, link, present");

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const pres = data.filter((r) => r.present);
      setPresent(pres);
      setAll(data);

      setReels(Array(pres.length).fill(null));
      setFixed(Array(pres.length).fill(false));
      setMaxLen(data.reduce((acc, r) => Math.max(acc, r.name?.length || 0), 1));

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

    const finalOrder = [...present].sort(() => Math.random() - 0.5);

    for (let i = 0; i < finalOrder.length; i++) {
      await spinOneReel(i, finalOrder[i]);
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
          onScrollBottom?.(); // scroll first
          spin(); // then start spinning
        }}
      >
        Discover Artists
      </button>

      <div className="slotmachine">
        {reels.map((artist, i) => {
          const isFixed = fixed[i];
          const hasLink = isFixed && artist && artist.link;

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
                    {artist.name}&nbsp;
                    <ExternalLink
                      size={14}
                      strokeWidth={1.5}
                      className="opacity-60"
                      aria-hidden="true"
                    />
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
