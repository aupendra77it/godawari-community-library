"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Book = {
  id: string;
  isbn: string | null;
  title: string;
  title_ne: string | null;
  author: string | null;
  publisher: string | null;
  publication_year: number | null;
  category: string | null;
  total_copies: number;
  available_copies: number;
  shelf_location: string | null;
};

const emptyForm = {
  isbn: "", title: "", title_ne: "", author: "", publisher: "",
  publication_year: "", category: "", total_copies: "1", shelf_location: "",
};

export default function BookManagement() {
  const supabase = createClient();
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadBooks() {
    if (!supabase) { setMessage("Supabase सेटअप जाँच गर्नुहोस्।"); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    if (error) setMessage("पुस्तक सूची ल्याउन समस्या भयो: " + error.message);
    else setBooks((data ?? []) as Book[]);
    setLoading(false);
  }

  useEffect(() => { void loadBooks(); }, []);

  function changeField(name: keyof typeof emptyForm, value: string) {
    setForm(current => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    if (!form.title.trim()) { setMessage("पुस्तकको नाम अनिवार्य छ।"); return; }
    const copies = Math.max(0, Number.parseInt(form.total_copies, 10) || 0);
    const payload = {
      isbn: form.isbn.trim() || null,
      title: form.title.trim(),
      title_ne: form.title_ne.trim() || null,
      author: form.author.trim() || null,
      publisher: form.publisher.trim() || null,
      publication_year: form.publication_year ? Number.parseInt(form.publication_year, 10) : null,
      category: form.category.trim() || null,
      total_copies: copies,
      available_copies: copies,
      shelf_location: form.shelf_location.trim() || null,
    };
    setSaving(true); setMessage("");
    const result = editingId
      ? await supabase.from("books").update(payload).eq("id", editingId)
      : await supabase.from("books").insert(payload);
    setSaving(false);
    if (result.error) { setMessage("सुरक्षित गर्न समस्या भयो: " + result.error.message); return; }
    setMessage(editingId ? "पुस्तक विवरण अद्यावधिक भयो।" : "नयाँ पुस्तक दर्ता भयो।");
    setForm(emptyForm); setEditingId(null); await loadBooks();
  }

  function startEdit(book: Book) {
    setEditingId(book.id);
    setForm({
      isbn: book.isbn ?? "", title: book.title, title_ne: book.title_ne ?? "",
      author: book.author ?? "", publisher: book.publisher ?? "",
      publication_year: book.publication_year?.toString() ?? "",
      category: book.category ?? "", total_copies: book.total_copies.toString(),
      shelf_location: book.shelf_location ?? "",
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeBook(book: Book) {
    if (!supabase || !window.confirm('"' + book.title + '" पुस्तक मेटाउने हो?')) return;
    const { error } = await supabase.from("books").delete().eq("id", book.id);
    if (error) setMessage("मेटाउन समस्या भयो: " + error.message);
    else { setMessage("पुस्तक मेटाइयो।"); await loadBooks(); }
  }

  const filtered = books.filter(book =>
    [book.title, book.title_ne, book.author, book.isbn, book.category]
      .some(value => value?.toLowerCase().includes(search.toLowerCase()))
  );

  return <main className="min-h-screen bg-gray-50">
    <header className="border-b bg-white"><div className="container flex items-center justify-between py-4">
      <div><p className="text-xs font-bold tracking-wider text-green-800">GODAWARI COMMUNITY LIBRARY</p><h1 className="text-xl font-bold">पुस्तक व्यवस्थापन</h1></div>
      <Link href="/admin" className="font-semibold text-green-800">← Dashboard</Link>
    </div></header>
    <div className="container space-y-6 py-7">
      <section className="panel p-6">
        <h2 className="text-lg font-bold">{editingId ? "पुस्तक विवरण सम्पादन" : "नयाँ पुस्तक दर्ता"}</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium">पुस्तकको नाम (English) *<input required value={form.title} onChange={e => changeField("title", e.target.value)} className="mt-1 w-full rounded-lg border p-2.5" /></label>
          <label className="text-sm font-medium">पुस्तकको नाम (नेपाली)<input value={form.title_ne} onChange={e => changeField("title_ne", e.target.value)} className="mt-1 w-full rounded-lg border p-2.5" /></label>
          <label className="text-sm font-medium">ISBN<input value={form.isbn} onChange={e => changeField("isbn", e.target.value)} className="mt-1 w-full rounded-lg border p-2.5" /></label>
          <label className="text-sm font-medium">लेखक<input value={form.author} onChange={e => changeField("author", e.target.value)} className="mt-1 w-full rounded-lg border p-2.5" /></label>
          <label className="text-sm font-medium">प्रकाशक<input value={form.publisher} onChange={e => changeField("publisher", e.target.value)} className="mt-1 w-full rounded-lg border p-2.5" /></label>
          <label className="text-sm font-medium">प्रकाशन वर्ष<input type="number" min="0" max="2100" value={form.publication_year} onChange={e => changeField("publication_year", e.target.value)} className="mt-1 w-full rounded-lg border p-2.5" /></label>
          <label className="text-sm font-medium">वर्ग / विधा<input value={form.category} onChange={e => changeField("category", e.target.value)} className="mt-1 w-full rounded-lg border p-2.5" /></label>
          <label className="text-sm font-medium">जम्मा प्रति<input required type="number" min="0" value={form.total_copies} onChange={e => changeField("total_copies", e.target.value)} className="mt-1 w-full rounded-lg border p-2.5" /></label>
          <label className="text-sm font-medium">र्‍याक / स्थान<input value={form.shelf_location} onChange={e => changeField("shelf_location", e.target.value)} className="mt-1 w-full rounded-lg border p-2.5" /></label>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
            <button disabled={saving} className="rounded-lg bg-green-800 px-5 py-2.5 font-semibold text-white disabled:opacity-60">{saving ? "सुरक्षित हुँदैछ..." : editingId ? "परिवर्तन सुरक्षित गर्नुहोस्" : "पुस्तक दर्ता गर्नुहोस्"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-lg border px-5 py-2.5">रद्द गर्नुहोस्</button>}
          </div>
        </form>
        {message && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-900">{message}</p>}
      </section>
      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">पुस्तक सूची ({books.length})</h2><input aria-label="पुस्तक खोज्नुहोस्" placeholder="नाम, लेखक, ISBN वा विधा खोज्नुहोस्..." value={search} onChange={e => setSearch(e.target.value)} className="w-full max-w-sm rounded-lg border p-2.5" /></div>
        {loading ? <p className="py-8 text-center text-gray-500">पुस्तक सूची लोड हुँदैछ...</p> : filtered.length === 0 ? <p className="py-8 text-center text-gray-500">पुस्तक भेटिएन। नयाँ पुस्तक दर्ता गर्नुहोस्।</p> :
          <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-100"><tr>{["पुस्तक", "लेखक", "ISBN", "विधा", "प्रति", "स्थान", "कार्य"].map(label => <th key={label} className="p-3">{label}</th>)}</tr></thead><tbody>
            {filtered.map(book => <tr key={book.id} className="border-b"><td className="p-3 font-semibold">{book.title}<div className="text-xs font-normal text-gray-500">{book.title_ne}</div></td><td className="p-3">{book.author || "—"}</td><td className="p-3">{book.isbn || "—"}</td><td className="p-3">{book.category || "—"}</td><td className="p-3">{book.available_copies}/{book.total_copies}</td><td className="p-3">{book.shelf_location || "—"}</td><td className="whitespace-nowrap p-3"><button onClick={() => startEdit(book)} className="mr-3 font-semibold text-blue-700">सम्पादन</button><button onClick={() => void removeBook(book)} className="font-semibold text-red-700">मेटाउने</button></td></tr>)}
          </tbody></table></div>}
      </section>
    </div>
  </main>;
}
