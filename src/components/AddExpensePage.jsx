/* src/components/AddExpensePage.jsx – gated by passphrase "euphrasyne" with mobile-friendly scrolling */

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "../styles/modal.css";

export default function AddExpensePage() {
  /* ─── access gate ───────────────────────────────────── */
  const [pass, setPass] = useState("");
  const [verified, setVerified] = useState(false);
  const [status, setStatus] = useState(null);

  const handleVerify = (e) => {
    e.preventDefault();
    if (pass.trim().toLowerCase() === "euphrasyne") {
      setVerified(true);
      setPass("");
      setStatus(null);
    } else {
      setStatus({ type: "error", msg: "Incorrect code." });
    }
  };

  /* ─── data state ────────────────────────────────────── */
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!verified) return;
    (async () => {
      setLoading(true);
      try {
        const { data: expRows, error: expErr } = await supabase
          .from("expenses")
          .select("id, name, category, amount")
          .order("id", { ascending: true });
        if (expErr) throw expErr;
        setExpenses(expRows);

        const { data: catRows, error: catErr } = await supabase
          .from("expense_categories")
          .select("name");
        if (catErr) throw catErr;
        setCategories(catRows.map((r) => r.name));
      } catch (err) {
        console.error("Fetch error:", err.message);
        setStatus({ type: "error", msg: "Failed loading data." });
      } finally {
        setLoading(false);
      }
    })();
  }, [verified]);

  /* ─── editing helpers ───────────────────────────────── */
  const handleFieldChange = (id, field, value) => {
    setExpenses((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleSaveRow = async (row) => {
    const amt = parseFloat(row.amount);
    if (!row.name.trim() || !row.category.trim() || isNaN(amt) || amt <= 0) {
      setStatus({ type: "error", msg: "Invalid values in row." });
      return;
    }
    const { error } = await supabase
      .from("expenses")
      .update({ name: row.name.trim(), category: row.category.trim(), amount: amt })
      .eq("id", row.id);
    if (error) {
      setStatus({ type: "error", msg: "Update failed." });
    } else {
      setStatus({ type: "success", msg: "Saved." });
      if (!categories.includes(row.category.trim())) {
        setCategories((prev) => [...prev, row.category.trim()]);
        await supabase.from("expense_categories").insert([{ name: row.category.trim() }]).catch(() => {});
      }
    }
  };

  const [newRow, setNewRow] = useState({ name: "", category: "", amount: "" });

  const handleAdd = async (e) => {
    e.preventDefault();
    const { name, category, amount } = newRow;
    const amt = parseFloat(amount);
    if (!name.trim() || !category.trim() || isNaN(amt) || amt <= 0) {
      setStatus({ type: "error", msg: "Fill all fields correctly." });
      return;
    }
    try {
      if (!categories.includes(category.trim())) {
        await supabase.from("expense_categories").insert([{ name: category.trim() }]);
        setCategories((prev) => [...prev, category.trim()]);
      }
      const { data, error } = await supabase
        .from("expenses")
        .insert([{ name: name.trim(), category: category.trim(), amount: amt }])
        .select()
        .single();
      if (error) throw error;
      setExpenses((prev) => [...prev, data]);
      setNewRow({ name: "", category: "", amount: "" });
      setStatus({ type: "success", msg: "Added." });
    } catch (err) {
      console.error("Add error:", err.message);
      setStatus({ type: "error", msg: "Failed to add." });
    }
  };

  /* ─── UI ─────────────────────────────────────────────── */
  if (!verified) {
    return (
      <div className="page" style={{ padding: "2rem", maxWidth: 360, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>Enter Access Code</h1>
        <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input type="text" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Code" required />
          <button className="join-button" type="submit">Submit</button>
        </form>
        {status && (
          <p style={{ color: status.type === "error" ? "#e63946" : "#2a9d8f", textAlign: "center", marginTop: "0.75rem" }}>{status.msg}</p>
        )}
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: "1rem", maxWidth: 900, margin: "0 auto", overflowX: "auto", overflowY: "auto", maxHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>Expenses</h1>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div style={{ minWidth: 640 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Name</th>
                <th style={{ textAlign: "left" }}>Category</th>
                <th style={{ textAlign: "right" }}>Amount (€)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((row) => (
                <tr key={row.id}>
                  <td><input value={row.name} onChange={(e) => handleFieldChange(row.id, "name", e.target.value)} /></td>
                  <td><input list="cat-list" value={row.category} onChange={(e) => handleFieldChange(row.id, "category", e.target.value)} /></td>
                  <td style={{ textAlign: "right" }}><input type="number" step="0.01" value={row.amount} onChange={(e) => handleFieldChange(row.id, "amount", e.target.value)} style={{ textAlign: "right" }} /></td>
                  <td><button className="join-button" onClick={() => handleSaveRow(row)}>Save</button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td><input value={newRow.name} onChange={(e) => setNewRow({ ...newRow, name: e.target.value })} placeholder="New name" /></td>
                <td><input list="cat-list" value={newRow.category} onChange={(e) => setNewRow({ ...newRow, category: e.target.value })} placeholder="Category" /></td>
                <td style={{ textAlign: "right" }}><input type="number" step="0.01" value={newRow.amount} onChange={(e) => setNewRow({ ...newRow, amount: e.target.value })} placeholder="0.00" style={{ textAlign: "right" }} /></td>
                <td><button className="join-button" onClick={handleAdd}>Add</button></td>
              </tr>
            </tfoot>
          </table>
          <datalist id="cat-list">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      )}
      {status && (
        <p style={{ color: status.type === "error" ? "#e63946" : "#2a9d8f", textAlign: "center", marginTop: "0.75rem" }}>{status.msg}</p>
      )}
    </div>
  );
}
