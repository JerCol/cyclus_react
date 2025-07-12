/* src/components/CostTransparencyModal.jsx – one Expenses bar (stacked red tints) vs Income bar (green) */

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import "../styles/modal.css";

// Red tints for expense categories
const EXPENSE_COLORS = [
  "#FFCDD2",
  "#EF9A9A",
  "#E57373",
  "#EF5350",
  "#F44336",
  "#E53935",
  "#D32F2F",
  "#C62828",
  "#B71C1C",
];

const INCOME_COLOR = "#2ECC71"; // green tint

export default function CostTransparencyModal({ onClose }) {
  const [chartData, setChartData] = useState([]); // [{name, ...cats, income}]
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        /* Aggregate expenses by category */
        const { data: expRows, error: expErr } = await supabase
          .from("expenses")
          .select("category, amount");
        if (expErr) throw expErr;
        const expAgg = expRows.reduce((acc, { category, amount }) => {
          acc[category] = (acc[category] || 0) + amount;
          return acc;
        }, {});
        const categories = Object.keys(expAgg).sort((a, b) => a.localeCompare(b));

        /* Total income */
        const { data: incRows, error: incErr } = await supabase
          .from("income")
          .select("amount");
        if (incErr) throw incErr;
        const totalIncome = incRows.reduce((sum, r) => sum + r.amount, 0);

        /* Build dataset */
        const expenseEntry = { name: "Expenses" };
        categories.forEach((cat) => {
          expenseEntry[cat] = expAgg[cat];
        });
        const incomeEntry = { name: "Income", income: totalIncome };

        setExpenseCategories(categories);
        setChartData([expenseEntry, incomeEntry]);
      } catch (err) {
        console.error("Cost transparency fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const width = 640;
  const height = 340;

  const colorForCat = (idx) => EXPENSE_COLORS[idx % EXPENSE_COLORS.length];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: width + 40 }}
      >
        <button className="join-button close-button" onClick={onClose}>
          &times;
        </button>
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Cost Transparency</h2>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading…</p>
        ) : (
          <BarChart
            width={width}
            height={height}
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 14 }} />
            <YAxis tickFormatter={(v) => `€${v}`} />
            <Tooltip formatter={(v) => `€${v.toFixed(2)}`} />

            {/* stacked expense segments */}
            {expenseCategories.map((cat, idx) => (
              <Bar
                key={cat}
                dataKey={cat}
                stackId="expenses"
                fill={colorForCat(idx)}
              />
            ))}

            {/* total income bar */}
            <Bar dataKey="income" fill={INCOME_COLOR} />
          </BarChart>
        )}
      </div>
    </div>
  );
}
