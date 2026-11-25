"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase सेटअप भएको छैन। पहिले .env.local मा URL र Publishable Key राख्नुहोस्।");
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (signInError) {
      setError("लगइन सफल भएन। इमेल र पासवर्ड जाँच गर्नुहोस् वा Supabase Auth मा प्रयोगकर्ता सिर्जना भएको सुनिश्चित गर्नुहोस्।");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen grid place-items-center px-4 py-10">
      <section className="panel w-full max-w-md p-7 sm:p-9">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-green-100 text-3xl">📚</div>
        <p className="mt-5 text-center text-xs font-bold tracking-[.18em] text-green-800">GODAWARI COMMUNITY LIBRARY</p>
        <h1 className="mt-2 text-center text-2xl font-bold">प्रशासन लगइन</h1>
        <p className="mt-1 text-center text-sm text-gray-500">Staff Administration Portal</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium">
            इमेल ठेगाना
            <input type="email" autoComplete="username" required value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
              placeholder="admin@example.com" />
          </label>
          <label className="block text-sm font-medium">
            पासवर्ड
            <input type="password" autoComplete="current-password" required value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
              placeholder="पासवर्ड लेख्नुहोस्" />
          </label>

          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-green-800 px-4 py-3 font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "लगइन हुँदैछ..." : "लगइन गर्नुहोस्"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-6 text-gray-500">
          पहुँच प्राप्त कर्मचारीका लागि मात्र। नयाँ खाता सार्वजनिक रूपमा दर्ता गर्न मिल्दैन।
        </p>
        <Link href="/" className="mt-5 block text-center text-sm font-semibold text-green-800">← सार्वजनिक वेबसाइटमा फर्कनुहोस्</Link>
      </section>
    </main>
  );
}
