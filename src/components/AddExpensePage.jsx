/* src/components/AddExpensePage.jsx – simple expense‑capture form at /add_expense */

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "../styles/modal.css"; // reuse existing button styles etc.

export default function AddExpensePage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState(null); // success / error message

  /* ── load categories once ──────────────────────────────────── */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("expense_categories")
        .select("name");
      if (error) {
        console.error("Error fetching categories:", error.message);
      } else {
        setCategories(data.map((r) => r.name));
      }
    })();
  }, []);

  /* ── helpers ──────────────────────────────────────────────── */
  const resetForm = () => {
    setName("");
    setCategory("");
    setAmount("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!name.trim() || !category.trim() || !amount) {
      setStatus({ type: "error", msg: "Please fill in all fields." });
      return;
    }

    const catName = category.trim();

    try {
      // 1) If category doesn’t exist yet, insert it (ignore duplicate error)
      if (!categories.includes(catName)) {
        const { error: catErr } = await supabase
          .from("expense_categories")
          .insert([{ name: catName }]);
        if (catErr && catErr.code !== "23505") { // unique violation code
          throw catErr;
        }
      }

      // 2) Insert expense row
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setStatus({ type: "error", msg: "Amount must be a positive number." });
        return;
      }

      const { error: expErr } = await supabase.from("expenses").insert([
        {
          name: name.trim(),
          category: catName,
          amount: amountNum,
        },
      ]);
      if (expErr) throw expErr;

      setStatus({ type: "success", msg: "Expense added successfully!" });
      resetForm();
      // refresh categories list so the new one appears in dropdown next time
      if (!categories.includes(catName)) setCategories((prev) => [...prev, catName]);
    } catch (err) {
      console.error("Insert expense error:", err.message);
      setStatus({ type: "error", msg: "Failed to add expense." });
    }
  };

  /* ── UI ───────────────────────────────────────────────────── */
  return (
    <div className="page" style={{ padding: "2rem", maxWidth: "420px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Add Expense</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Venue rent"
            required
          />
        </label>

        <label>
          Category
          <input
            list="category-options"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Choose or type new"
            required
          />
          <datalist id="category-options">
            {categories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </label>

        <label>
          Amount (€)
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 250.00"
            required
            min="0"
          />
        </label>

        <button className="join-button" type="submit">
          Save
        </button>

        {status && (
          <p
            style={{
              color: status.type === "error" ? "#e63946" : "#2a9d8f",
              textAlign: "center",
              marginTop: "0.5rem",
            }}
          >
            {status.msg}
          </p>
        )}
      </form>
    </div>
  );
}
