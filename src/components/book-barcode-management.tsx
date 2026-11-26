"use client";

import { useEffect, useState } from "react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";

type Book = { id: string; title: string; title_ne: string | null; isbn: string | null; barcode: string | null };

export default function BookBarcodeManagement() {
  const supabase = createClient();
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    if (!supabase) { setMessage("Supabase सेटअप जाँच गर्नुहोस्।"); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("books")
      .select("id,title,title_ne,isbn,barcode").order("title");
    if (error) setMessage("पुस्तक सूची ल्याउन समस्या भयो: " + error.message);
    else setBooks((data ?? []) as Book[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function assignBarcode(book: Book) {
    if (!supabase || book.barcode) return;
    setSavingId(book.id); setMessage("");
    const code = "GCLB-" + crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
    const { error } = await supabase.from("books").update({ barcode: code }).eq("id", book.id).is("barcode", null);
    setSavingId(null);
    if (error) setMessage("Barcode बनाउन समस्या भयो: " + error.message);
    else { setMessage("पुस्तकको Barcode तयार भयो।"); await load(); }
  }

  const filtered = books.filter(book =>
    [book.title, book.title_ne, book.isbn, book.barcode].some(value => value?.toLowerCase().includes(search.toLowerCase()))
  );

  return <main className="min-h-screen bg-gray-50">
    <header className="border-b bg-white"><div className="container flex items-center justify-between py-4">
      <div><p className="text-xs font-bold tracking-wider text-green-800">GODAWARI COMMUNITY LIBRARY</p><h1 className="text-xl font-bold">पुस्तक Barcode तथा QR Label व्यवस्थापन</h1></div>
      <a href="/admin" className="font-semibold text-green-800">← Dashboard</a>
    </div></header>
    <div className="container space-y-5 py-7">
      <section className="panel p-5">
        <h2 className="font-bold">पुस्तकको Barcode र QR Code लेबल तयार तथा प्रिन्ट</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">प्रत्येक पुस्तक रेकर्डका लागि एउटा अद्वितीय Barcode र QR Code तयार हुन्छ। दुवै कोडमा एउटै पुस्तक पहिचान नम्बर प्रयोग हुन्छ। लेबल प्रिन्ट गरेर पुस्तकमा टाँस्नुहोस्। एउटै पुस्तकका धेरै प्रति भए प्रत्येक प्रतिलाई छुट्टै पहिचान चाहिने अवस्थामा प्रति-स्तरको Barcode प्रणाली अर्को चरणमा विस्तार गर्न सकिन्छ।</p>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="पुस्तकको नाम, ISBN वा Barcode खोज्नुहोस्..." className="mt-4 w-full max-w-md rounded-lg border p-2.5" />
      </section>
      {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-900">{message}</p>}
      {loading ? <p className="py-8 text-center text-gray-500">पुस्तक सूची लोड हुँदैछ...</p> : filtered.length === 0 ? <p className="panel p-6 text-center text-gray-500">पुस्तक भेटिएन।</p> :
        <section className="grid gap-4 md:grid-cols-2">
          {filtered.map(book => <article key={book.id} className="panel p-5">
            <h3 className="font-bold">{book.title_ne || book.title}</h3>
            <p className="mt-1 text-xs text-gray-500">{book.title} · ISBN: {book.isbn || "—"}</p>
            {book.barcode ? <div className="book-label-print-area mt-4 rounded-lg border border-dashed p-3">
              <div className="text-center">
                <p className="text-xs font-bold tracking-wide">GODAWARI COMMUNITY LIBRARY</p>
                <p className="mt-1 text-sm font-bold">{book.title_ne || book.title}</p>
              </div>
              <div className="book-label-codes mt-2">
                <div className="book-label-barcode min-w-0 text-center">
                  <Barcode value={"GCL-BOOK:" + book.barcode} format="CODE128" width={0.9} height={34} displayValue margin={1} fontSize={7} />
                  <p className="text-[10px] text-gray-600">Barcode</p>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <QRCodeSVG value={"GCL-BOOK:" + book.barcode} size={76} level="M" />
                  <p className="text-[10px] text-gray-600">QR Code</p>
                </div>
              </div>
              <p className="mt-1 text-center text-[10px] text-gray-600">{book.barcode}</p>
              <div className="no-print text-center">
                <button type="button" onClick={() => window.print()} className="mt-3 rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white">Barcode र QR Label प्रिन्ट गर्नुहोस्</button>
              </div>
            </div> : <button type="button" disabled={savingId === book.id} onClick={() => void assignBarcode(book)} className="mt-4 rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{savingId === book.id ? "तयार हुँदैछ..." : "Barcode र QR Code तयार गर्नुहोस्"}</button>}
          </article>)}
        </section>}
    </div>
    <style jsx global>{`
      .book-label-codes { display: grid; grid-template-columns: minmax(0, 1fr) 22mm; column-gap: 3mm; align-items: center; width: 100%; }
      .book-label-barcode { min-width: 0; overflow: hidden; }
      .book-label-barcode svg { display: block; width: 100% !important; max-width: 100% !important; height: auto !important; }
      .book-label-codes > div:last-child svg { display: block; width: 20mm; height: 20mm; max-width: 20mm; }
      @media print {
        body * { visibility: hidden !important; }
        .book-label-print-area, .book-label-print-area * { visibility: visible !important; }
        @page { size: 100mm 65mm; margin: 0; }
        .book-label-print-area { position: absolute; left: 0; top: 0; border: 0 !important; box-sizing: border-box; width: 100mm; height: 65mm; padding: 3mm !important; overflow: hidden; }
        .book-label-codes { grid-template-columns: minmax(0, 1fr) 22mm !important; }
        .book-label-codes > div:last-child svg { width: 20mm !important; height: 20mm !important; max-width: 20mm !important; }
        .no-print { display: none !important; }
      }
    `}</style>
  </main>;
}
