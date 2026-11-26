"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";

type Member = {
  id: string;
  membership_no: string;
  full_name: string;
  full_name_ne: string | null;
  member_type: "general" | "child" | "youth" | "women" | "institutional";
  status: "active" | "inactive" | "suspended";
  joined_on: string;
};

const typeLabels: Record<Member["member_type"], string> = {
  general: "सामान्य सदस्य",
  child: "बाल सदस्य",
  youth: "युवा सदस्य",
  women: "महिला सदस्य",
  institutional: "संस्थागत सदस्य",
};
const statusLabels: Record<Member["status"], string> = {
  active: "सक्रिय सदस्य",
  inactive: "निष्क्रिय",
  suspended: "निलम्बित",
};

export default function MemberCards() {
  const supabase = createClient();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setError("Supabase सेटअप जाँच गर्नुहोस्।");
        setLoading(false);
        return;
      }
      const { data, error: queryError } = await supabase
        .from("members")
        .select("id,membership_no,full_name,full_name_ne,member_type,status,joined_on")
        .order("membership_no", { ascending: true });
      if (queryError) setError("सदस्य सूची ल्याउन समस्या भयो: " + queryError.message);
      else {
        const rows = (data ?? []) as Member[];
        setMembers(rows);
        if (rows[0]) setSelectedId(rows[0].id);
      }
      setLoading(false);
    }
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.membership_no, m.full_name, m.full_name_ne ?? ""].some((v) => v.toLowerCase().includes(q))
    );
  }, [members, search]);

  const selected = members.find((m) => m.id === selectedId) ?? null;

  return (
    <main className="min-h-screen bg-gray-50 member-card-page">
      <style jsx global>{`
        @media print {
          @page { size: 90mm 60mm; margin: 2mm; }
          body { background: white !important; }
          body * { visibility: hidden !important; }
          #print-member-card, #print-member-card * { visibility: visible !important; }
          #print-member-card {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 86mm !important;
            height: 54mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            break-inside: avoid !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
      <header className="border-b bg-white no-print">
        <div className="container flex items-center justify-between py-4">
          <div>
            <p className="text-xs font-bold tracking-wider text-green-800">GODAWARI COMMUNITY LIBRARY</p>
            <h1 className="text-xl font-bold">सदस्य QR Code तथा परिचयपत्र</h1>
          </div>
          <a href="/admin" className="font-semibold text-green-800">← Dashboard</a>
        </div>
      </header>

      <div className="container grid gap-6 py-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <section className="panel p-6 no-print">
          <h2 className="text-lg font-bold">सदस्य छान्नुहोस्</h2>
          <p className="mt-1 text-sm text-gray-600">दर्ता भएका सदस्यबाट परिचयपत्र तयार गर्नुहोस्।</p>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="नाम वा सदस्य नम्बर खोज्नुहोस्..."
            className="mt-4 w-full rounded-lg border p-3"
          />
          {loading ? <p className="py-8 text-center text-gray-500">सदस्य सूची लोड हुँदैछ...</p> :
            error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> :
            filtered.length === 0 ? <p className="py-8 text-center text-gray-500">सदस्य भेटिएन।</p> :
            <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto">
              {filtered.map((m) => (
                <button key={m.id} type="button" onClick={() => setSelectedId(m.id)}
                  className={`w-full rounded-lg border p-3 text-left ${selectedId === m.id ? "border-green-700 bg-green-50" : "bg-white hover:bg-gray-50"}`}>
                  <span className="block font-semibold">{m.full_name_ne || m.full_name}</span>
                  <span className="text-sm text-gray-600">{m.membership_no} · {typeLabels[m.member_type]}</span>
                </button>
              ))}
            </div>}
        </section>

        <section className="space-y-4">
          {selected ? <>
            <div id="print-member-card" className="mx-auto flex h-[54mm] w-[86mm] overflow-hidden rounded-xl border-2 border-green-800 bg-white shadow-lg">
              <div className="flex min-w-0 flex-1 flex-col p-3">
                <div className="border-b border-green-200 pb-2">
                  <p className="text-[8px] font-extrabold tracking-wider text-green-800">GODAWARI COMMUNITY LIBRARY</p>
                  <p className="text-[7px] text-gray-600">RESOURCE CENTER · GODAWARI, LALITPUR</p>
                  <p className="mt-1 text-[10px] font-bold text-green-900">सदस्य परिचयपत्र / MEMBER ID</p>
                </div>
                <div className="min-h-0 flex-1 pt-2">
                  <p className="text-[12px] font-bold leading-tight">{selected.full_name_ne || selected.full_name}</p>
                  {selected.full_name_ne && <p className="text-[8px] text-gray-600">{selected.full_name}</p>}
                  <p className="mt-2 text-[8px] text-gray-600">सदस्य नम्बर / ID No.</p>
                  <p className="text-[12px] font-extrabold tracking-wide text-green-900">{selected.membership_no}</p>
                  <p className="mt-1 text-[8px]">{typeLabels[selected.member_type]}</p>
                  <p className={`mt-1 text-[8px] font-bold ${selected.status === "active" ? "text-green-700" : "text-red-700"}`}>{statusLabels[selected.status]}</p>
                </div>
                <p className="text-[7px] text-gray-500">यो कार्ड पुस्तकालयको सम्पत्ति हो।</p>
              </div>
              <div className="flex w-[27mm] flex-col items-center justify-center border-l border-green-100 bg-green-50 p-2">
                <QRCodeSVG value={`GCL-MEMBER:${selected.membership_no}`} size={88} level="M" includeMargin />
                <p className="mt-1 text-center text-[7px] font-semibold text-green-900">SCAN MEMBER ID</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 no-print">
              <button type="button" onClick={() => window.print()} className="rounded-lg bg-green-800 px-5 py-2.5 font-semibold text-white">कार्ड प्रिन्ट गर्नुहोस्</button>
            </div>
            <p className="text-center text-xs text-gray-500 no-print">QR Code मा सदस्य नम्बर मात्र समावेश हुन्छ। प्रिन्ट गर्दा कार्डको आकार करिब 86 × 54 mm हुन्छ।</p>
          </> : <div className="panel p-8 text-center text-gray-500">परिचयपत्र हेर्न सदस्य छान्नुहोस्।</div>}
        </section>
      </div>
    </main>
  );
}
