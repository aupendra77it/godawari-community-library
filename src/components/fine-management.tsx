"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FineLoan = {
  id: string; issued_at: string; due_at: string; returned_at: string | null; fine_amount: number;
  books: { title: string; title_ne: string | null } | null;
  members: { membership_no: string; full_name: string; full_name_ne: string | null } | null;
};
type FinePayment = {
  id: string; loan_id: string; amount: number; payment_method: string;
  reference_no: string | null; notes: string | null; paid_at: string;
  book_loans: { books: { title: string; title_ne: string | null } | null;
    members: { membership_no: string; full_name: string; full_name_ne: string | null } | null } | null;
};
const methodLabels: Record<string,string> = {
  cash: "नगद", bank_transfer: "बैंक ट्रान्सफर", mobile_wallet: "डिजिटल वालेट", other: "अन्य"
};
const money = (n:number) => "रु. " + n.toFixed(2);
const dateText = (value:string) => new Date(value).toLocaleDateString("ne-NP");

export default function FineManagement() {
  const supabase = createClient();
  const [fines,setFines] = useState<FineLoan[]>([]);
  const [payments,setPayments] = useState<FinePayment[]>([]);
  const [selectedId,setSelectedId] = useState("");
  const [amount,setAmount] = useState("");
  const [method,setMethod] = useState("cash");
  const [reference,setReference] = useState("");
  const [notes,setNotes] = useState("");
  const [search,setSearch] = useState("");
  const [message,setMessage] = useState("");
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);

  async function load() {
    if (!supabase) { setMessage("Supabase Configuration जाँच गर्नुहोस्।"); setLoading(false); return; }
    setLoading(true);
    const [f,p] = await Promise.all([
      supabase.from("book_loans").select("id,issued_at,due_at,returned_at,fine_amount,books(title,title_ne),members(membership_no,full_name,full_name_ne)").gt("fine_amount",0).not("returned_at","is",null).order("returned_at",{ascending:false}),
      supabase.from("fine_payments").select("id,loan_id,amount,payment_method,reference_no,notes,paid_at,book_loans(books(title,title_ne),members(membership_no,full_name,full_name_ne))").order("paid_at",{ascending:false})
    ]);
    const err=f.error||p.error;
    if (err) setMessage("जरिवाना विवरण ल्याउन समस्या भयो: "+err.message);
    else { setFines((f.data??[]) as unknown as FineLoan[]); setPayments((p.data??[]) as unknown as FinePayment[]); }
    setLoading(false);
  }
  useEffect(()=>{ void load(); },[]);

  const paidByLoan = useMemo(() => {
    const totals = new Map<string,number>();
    for (const p of payments) totals.set(p.loan_id,(totals.get(p.loan_id)||0)+Number(p.amount));
    return totals;
  },[payments]);
  const rows = useMemo(() => fines.map(f => {
    const total=Number(f.fine_amount||0), paid=paidByLoan.get(f.id)||0;
    return {...f,total,paid,balance:Math.max(0,total-paid)};
  }),[fines,paidByLoan]);
  const totalFine=rows.reduce((s,r)=>s+r.total,0);
  const totalPaid=rows.reduce((s,r)=>s+r.paid,0);
  const totalBalance=rows.reduce((s,r)=>s+r.balance,0);
  const filtered=rows.filter(r=>[r.books?.title,r.books?.title_ne,r.members?.full_name,r.members?.full_name_ne,r.members?.membership_no].some(v=>v?.toLowerCase().includes(search.toLowerCase())));
  const selected=rows.find(r=>r.id===selectedId);

  function choosePayment(id:string,balance:number) {
    setSelectedId(id); setAmount(balance.toFixed(2)); setMessage("");
    window.scrollTo({top:0,behavior:"smooth"});
  }
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase||!selectedId) return;
    const value=Number(amount);
    if (!Number.isFinite(value)||value<=0) { setMessage("भुक्तानी रकम शून्यभन्दा बढी राख्नुहोस्।"); return; }
    if (selected && value>selected.balance) { setMessage("भुक्तानी रकम बाँकी जरिवानाभन्दा बढी भयो।"); return; }
    setSaving(true); setMessage("");
    const {data,error}=await supabase.rpc("record_library_fine_payment",{
      p_loan_id:selectedId,p_amount:value,p_payment_method:method,
      p_reference_no:reference,p_notes:notes
    });
    setSaving(false);
    if (error) { setMessage("भुक्तानी दर्ता गर्न समस्या भयो: "+error.message); return; }
    setMessage("जरिवाना भुक्तानी सफलतापूर्वक दर्ता भयो। बाँकी रकम: "+money(Number(data??0)));
    setSelectedId("");setAmount("");setReference("");setNotes("");
    await load();
  }

  return <main className="min-h-screen bg-gray-50">
    <header className="border-b bg-white"><div className="container flex items-center justify-between py-4"><div><p className="text-xs font-bold tracking-wider text-green-800">GODAWARI COMMUNITY LIBRARY</p><h1 className="text-xl font-bold">जरिवाना व्यवस्थापन</h1></div><a href="/admin" className="font-semibold text-green-800">← Dashboard</a></div></header>
    <div className="container space-y-6 py-7">
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="panel p-5"><p className="text-sm text-gray-600">कुल जरिवाना</p><p className="mt-2 text-2xl font-bold">{money(totalFine)}</p></article>
        <article className="panel p-5"><p className="text-sm text-gray-600">जम्मा भुक्तानी</p><p className="mt-2 text-2xl font-bold text-green-800">{money(totalPaid)}</p></article>
        <article className="panel p-5"><p className="text-sm text-gray-600">तिर्न बाँकी</p><p className="mt-2 text-2xl font-bold text-red-700">{money(totalBalance)}</p></article>
      </section>

      <section className="panel p-6">
        <h2 className="text-lg font-bold">जरिवाना भुक्तानी दर्ता</h2>
        {!selected&&<p className="mt-2 text-sm text-gray-600">तलको जरिवाना सूचीबाट सदस्यको “भुक्तानी दर्ता” छानेपछि यहाँ विवरण भर्नुहोस्।</p>}
        <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium sm:col-span-2 lg:col-span-3">सदस्य / जरिवाना अभिलेख
            <select required value={selectedId} onChange={e=>{const r=rows.find(x=>x.id===e.target.value);setSelectedId(e.target.value);setAmount(r?r.balance.toFixed(2):"");}} className="mt-1 w-full rounded-lg border p-2.5">
              <option value="">जरिवाना अभिलेख छान्नुहोस्</option>
              {rows.filter(r=>r.balance>0).map(r=><option key={r.id} value={r.id}>{r.members?.membership_no} — {r.members?.full_name_ne||r.members?.full_name} — बाँकी {money(r.balance)}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">भुक्तानी रकम (रु.) *
            <input required type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/>
          </label>
          <label className="text-sm font-medium">भुक्तानी माध्यम *
            <select value={method} onChange={e=>setMethod(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5">
              <option value="cash">नगद</option><option value="bank_transfer">बैंक ट्रान्सफर</option><option value="mobile_wallet">डिजिटल वालेट</option><option value="other">अन्य</option>
            </select>
          </label>
          <label className="text-sm font-medium">रसिद / कारोबार नम्बर
            <input value={reference} onChange={e=>setReference(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/>
          </label>
          <label className="text-sm font-medium sm:col-span-2 lg:col-span-3">कैफियत
            <input value={notes} onChange={e=>setNotes(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/>
          </label>
          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-3">
            <button disabled={saving||!selectedId} className="rounded-lg bg-green-800 px-5 py-2.5 font-semibold text-white disabled:opacity-60">{saving?"दर्ता हुँदैछ...":"भुक्तानी सुरक्षित गर्नुहोस्"}</button>
            {selectedId&&<button type="button" onClick={()=>{setSelectedId("");setAmount("");}} className="rounded-lg border px-5 py-2.5">रद्द गर्नुहोस्</button>}
          </div>
        </form>
      </section>

      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">जरिवाना सूची ({rows.length})</h2><div className="flex gap-2"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="सदस्य वा पुस्तक खोज्नुहोस्..." className="w-full max-w-sm rounded-lg border p-2.5"/><button onClick={()=>void load()} disabled={loading} className="rounded-lg border px-3 py-2 text-sm">Refresh</button></div></div>
        {loading?<p className="py-8 text-center text-gray-500">विवरण लोड हुँदैछ...</p>:filtered.length===0?<p className="py-8 text-center text-gray-500">जरिवाना अभिलेख भेटिएन।</p>:
          <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-100"><tr>{["सदस्य","पुस्तक","फिर्ता मिति","कुल जरिवाना","तिरेको","बाँकी","कार्य"].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>
            {filtered.map(r=><tr key={r.id} className="border-b"><td className="p-3 font-semibold">{r.members?.full_name_ne||r.members?.full_name||"—"}<div className="text-xs font-normal text-gray-500">{r.members?.membership_no}</div></td><td className="p-3">{r.books?.title_ne||r.books?.title||"—"}</td><td className="p-3">{r.returned_at?dateText(r.returned_at):"—"}</td><td className="p-3">{money(r.total)}</td><td className="p-3 text-green-800">{money(r.paid)}</td><td className="p-3 font-semibold text-red-700">{money(r.balance)}</td><td className="p-3">{r.balance>0?<button onClick={()=>choosePayment(r.id,r.balance)} className="whitespace-nowrap font-semibold text-green-800">भुक्तानी दर्ता</button>:<span className="text-green-800">पूर्ण भुक्तानी</span>}</td></tr>)}
          </tbody></table></div>}
      </section>

      <section className="panel p-6">
        <h2 className="text-lg font-bold">भुक्तानी इतिहास ({payments.length})</h2>
        {payments.length===0?<p className="py-6 text-center text-gray-500">अहिलेसम्म भुक्तानी अभिलेख छैन।</p>:
          <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-100"><tr>{["मिति","सदस्य","पुस्तक","भुक्तानी माध्यम","रसिद नं.","रकम"].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>
            {payments.map(p=><tr key={p.id} className="border-b"><td className="p-3">{dateText(p.paid_at)}</td><td className="p-3">{p.book_loans?.members?.full_name_ne||p.book_loans?.members?.full_name||"—"}<div className="text-xs text-gray-500">{p.book_loans?.members?.membership_no}</div></td><td className="p-3">{p.book_loans?.books?.title_ne||p.book_loans?.books?.title||"—"}</td><td className="p-3">{methodLabels[p.payment_method]||p.payment_method}</td><td className="p-3">{p.reference_no||"—"}</td><td className="p-3 font-semibold">{money(Number(p.amount))}</td></tr>)}
          </tbody></table></div>}
      </section>
      {message&&<p className="rounded-lg bg-green-50 p-3 text-sm text-green-900">{message}</p>}
    </div>
  </main>;
}
