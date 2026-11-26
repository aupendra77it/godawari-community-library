"use client";

import { useEffect, useRef, useState } from "react";

type Props = { onBookScanned: (barcode: string) => void };

export default function BookBarcodeScanner({ onBookScanned }: Props) {
  const scannerRef = useRef<import("html5-qrcode").Html5QrcodeScanner | null>(null);
  const handledRef = useRef(false);
  const callbackRef = useRef(onBookScanned);
  const [error, setError] = useState("");
  callbackRef.current = onBookScanned;

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const { Html5QrcodeScanner, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5QrcodeScanner(
          "circulation-book-barcode-reader",
          {
            fps: 10,
            qrbox: { width: 280, height: 120 },
            rememberLastUsedCamera: true,
            formatsToSupport: [
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.CODE_39,
            ],
          },
          false
        );
        scannerRef.current = scanner;
        scanner.render(async (decodedText) => {
          if (handledRef.current) return;
          if (!decodedText.startsWith("GCL-BOOK:")) {
            setError("यो Godawari Library को पुस्तक Barcode होइन।");
            return;
          }
          const barcode = decodedText.slice("GCL-BOOK:".length).trim();
          if (!barcode) {
            setError("Barcode मा पुस्तकको कोड भेटिएन।");
            return;
          }
          handledRef.current = true;
          callbackRef.current(barcode);
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
  }, []);

  return <div>
    <p className="mb-2 text-sm text-gray-600">पुस्तकको Code 128 / EAN Barcode क्यामेराअगाडि राख्नुहोस्।</p>
    <div id="circulation-book-barcode-reader" className="w-full overflow-hidden rounded-lg" />
    {error && <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{error}</p>}
  </div>;
}
