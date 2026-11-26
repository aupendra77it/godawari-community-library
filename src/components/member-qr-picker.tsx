"use client";

import { useEffect, useRef, useState } from "react";

type Props = { onMemberScanned: (membershipNo: string) => void };

export default function MemberQrPicker({ onMemberScanned }: Props) {
  const scannerRef = useRef<import("html5-qrcode").Html5QrcodeScanner | null>(null);
  const handledRef = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5QrcodeScanner(
          "circulation-member-qr-reader",
          { fps: 10, qrbox: { width: 220, height: 220 }, rememberLastUsedCamera: true },
          false
        );
        scannerRef.current = scanner;
        scanner.render(async (decodedText) => {
          if (handledRef.current) return;
          if (!decodedText.startsWith("GCL-MEMBER:")) {
            setError("यो Godawari Library सदस्य परिचयपत्रको QR Code होइन।");
            return;
          }
          handledRef.current = true;
          const membershipNo = decodedText.slice("GCL-MEMBER:".length).trim();
          if (!membershipNo) {
            setError("QR Code मा सदस्य नम्बर भेटिएन।");
            handledRef.current = false;
            return;
          }
          onMemberScanned(membershipNo);
          try { await scanner.clear(); } catch { /* Scanner may already be stopped. */ }
        }, () => {
          // Ignore continuous scan misses.
        });
      } catch {
        setError("क्यामेरा सुरु हुन सकेन। Browser मा Camera Permission अनुमति दिनुहोस्।");
      }
    }
    void start();
    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner) {
        void scanner.clear().catch(() => undefined);
        scannerRef.current = null;
      }
    };
  }, [onMemberScanned]);

  return <div>
    <p className="mb-2 text-sm text-gray-600">सदस्य परिचयपत्रको QR Code क्यामेराअगाडि राख्नुहोस्।</p>
    <div id="circulation-member-qr-reader" className="w-full overflow-hidden rounded-lg" />
    {error && <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{error}</p>}
  </div>;
}
