// lib/fetchPaymentLinks.js
import { supabase } from "../lib/supabaseClient";

/** Fetch all payment links ordered by creation date */
export async function getPaymentLinks() {
  const { data, error } = await supabase
    .from("payment_links")
    .select("name, link, date_created_at")
    .order("date_created_at", { ascending: true });

  if (error) throw error;
  return data;         // [{ name: 'Support Ticket', link: 'https://…', ... }, …]
}
