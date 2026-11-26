"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MemberResult = {
  membership_no: string;
  full_name: string;
  full_name_ne: string | null;
  member_type: "general" | "child" | "youth" | "women" | "institutional";
  status: "active" | "inactive" | "suspended";
};

const typeLabels: Record<MemberResult["member_type"], string> = {
  general: "सामान्य सदस्य",
  child: "बाल सदस्य",
  youth: "युवा सदस्य",
  women: "महिला सदस्य",
  institutional: "संस्थागत सदस्य",
};

const statusLabels: Record<MemberResult["status"], string> = {
  active: "सक्रिय सदस्य",
  inactive: "निष्क्रिय सदस्य",
  suspended: "निलम्बित सदस्य",
};

export default function MemberQrScanner() {
  const supabase = createClient();
  const [member, setMember] = useState<MemberResult | null>(null);
  const [manualNo, setManualNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [lookupMessage, setLookupMessage] = useState("");
  const scannerRef = useRef<import("html5-qrcode").Html5QrcodeScanner | null>(null);
  const handledRef = useRef(false);

  async function findMember(rawValue: string) {
    const value = rawValue.trim();
    const membershipNo = value.startsWith("GCL-MEMBER:")
      ? value.slice("GCL-MEMBER:".length).trim()
      : value;

    if (!membershipNo) {
      setLookupMessage("सदस्य नम्बर खाली छ।");
      return;
    }
    if (!supabase) {
      setLookupMessage("Supabase सेटअप जाँच गर्नुहोस्।");
      return;
    }

    setLoading(true);
    setMember(null);
    setLookupMessage("");
    const { data, error } = await supabase
      .from("members")
      .select("membership_no,full_name,full_name_ne,member_type,status")
      .eq("membership_no", membershipNo)
      .maybeSingle();

    if (error) {
      setLookupMessage("सदस्य खोज्दा समस्या भयो: " + error.message);
    } else if (!data) {
      setLookupMessage("यो सदस्य नम्बर भएको सदस्य भेटिएन।");
    } else {
      setMember(data as MemberResult);
      setLookupMessage("सदस्यको विवरण सफलतापूर्वक भेटियो।");
    }
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function startScanner() {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5QrcodeScanner(
          "member-qr-reader",
          { fps: 10, qrbox: { width: 230, height: 230 }, rememberLastUsedCamera: true },
          false
        );
        scannerRef.current = scanner;
        scanner.render(
          async (decodedText) => {
            if (handledRef.current) return;
            handledRef.current = true;
            if (!decodedText.startsWith("GCL-MEMBER:")) {
              setLookupMessage("यो Godawari Library सदस्य परिचयपत्रको QR Code होइन।");
              handledRef.current = false;
              return;
            }
            await findMember(decodedText);
            try {
              await scanner.clear();
            } catch {
              // The scanner may already have stopped after a successful scan.
            }
          },
          () => {
            // Ignore continuous frame-by-frame scan misses.
          }
        );
      } catch {
        setScannerError("क्यामेरा सुरु हुन सकेन। Browser मा Camera Permission अनुमति दिनुहोस् वा सदस्य नम्बर आफैँ प्रविष्ट गर्नुहोस्।");
      }
    }

    void startScanner();
    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner) {
        void scanner.clear().catch(() => undefined);
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container flex items-center justify-between py-4">
          <div>
            <p className="text-xs font-bold tracking-wider text-green-800">GODAWARI COMMUNITY LIBRARY</p>
            <h1 className="text-xl font-bold">सदस्य QR Code स्क्यान</h1>
          </div>
          <a href="/admin" className="font-semibold text-green-800">← Dashboard</a>
        </div>
      </header>

      <div className="container grid gap-6 py-7 lg:grid-cols-2">
        <section className="panel p-6">
          <h2 className="text-lg font-bold">क्यामेराबाट QR Code स्क्यान गर्नुहोस्</h2>
          <p className="mt-1 text-sm text-gray-600">सदस्य परिचयपत्रको QR Code क्यामेराअगाडि राख्नुहोस्।</p>
          <div id="member-qr-reader" className="mt-5 w-full overflow-hidden rounded-lg" />
          {scannerError && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{scannerError}</p>}
          <div className="mt-6 border-t pt-5">
            <h3 className="font-semibold">वा सदस्य नम्बर प्रविष्ट गर्नुहोस्</h3>
            <form
              className="mt-3 flex flex-wrap gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                handledRef.current = true;
                void findMember(manualNo);
              }}
            >
              <input
                value={manualNo}
                onChange={(event) => setManualNo(event.target.value)}
                placeholder="जस्तै: TEST-999"
                className="min-w-0 flex-1 rounded-lg border p-3"
              />
              <button type="submit" disabled={loading || !manualNo.trim()} className="rounded-lg bg-green-800 px-5 py-3 font-semibold text-white disabled:opacity-50">
                खोज्नुहोस्
              </button>
            </form>
          </div>
        </section>

        <section className="panel min-h-64 p-6">
          <h2 className="text-lg font-bold">सदस्यको विवरण</h2>
          {loading ? <p className="mt-6 text-gray-500">सदस्य खोजिँदैछ...</p> :
            member ? <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-5">
              <p className="text-sm text-green-800">सदस्य भेटियो</p>
              <h3 className="mt-2 text-xl font-bold">{member.full_name_ne || member.full_name}</h3>
              {member.full_name_ne && <p className="mt-1 text-sm text-gray-600">{member.full_name}</p>}
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-500">सदस्य नम्बर</p><p className="font-bold">{member.membership_no}</p></div>
                <div><p className="text-gray-500">सदस्य प्रकार</p><p className="font-semibold">{typeLabels[member.member_type]}</p></div>
                <div className="col-span-2"><p className="text-gray-500">स्थिति</p><p className={member.status === "active" ? "font-bold text-green-700" : "font-bold text-red-700"}>{statusLabels[member.status]}</p></div>
              </div>
            </div> :
            <p className="mt-6 text-sm text-gray-500">{lookupMessage || "QR Code स्क्यान गरेपछि सदस्यको विवरण यहाँ देखिन्छ।"}</p>}
          {member && <p className="mt-4 text-xs text-gray-500">{lookupMessage}</p>}
          <button type="button" onClick={() => { setMember(null); setLookupMessage(""); setManualNo(""); handledRef.current = false; window.location.reload(); }} className="mt-5 rounded-lg border px-4 py-2 text-sm font-semibold">
            अर्को सदस्य स्क्यान गर्नुहोस्
          </button>
        </section>
      </div>
    </main>
  );
}
