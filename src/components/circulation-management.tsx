"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Book = { id:string; title:string; title_ne:string|null; author:string|null; available_copies:number; total_copies:number };
type Member = { id:string; membership_no:string; full_name:string; full_name_ne:string|null; status:string };
type Loan = { id:string; book_id:string; member_id:string; issued_at:string; due_at:string; returned_at:string|null; status:string; fine_amount:number; books?:{title:string;title_ne:string|null}|null; members?:{membership_no:string;full_name:string;full_name_ne:string|null}|null };

function dateAfter(days:number) { const d=new Date(); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
export default function CirculationManagement() {
 const supabase=createClient();
 const [books,setBooks]=useState<Book[]>([]);
 const [members,setMembers]=useState<Member[]>([]);
 const [loans,setLoans]=useState<Loan[]>([]);
 const [bookId,setBookId]=useState("");
 const [memberId,setMemberId]=useState("");
 const [dueAt,setDueAt]=useState(dateAfter(14));
 const [fineRate,setFineRate]=useState("5");
 const [search,setSearch]=useState("");
 const [message,setMessage]=useState("");
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);

 async function load() {
  if(!supabase){setMessage("Supabase Configuration जाँच गर्नुहोस्।");setLoading(false);return;}
  setLoading(true);
  const [b,m,l]=await Promise.all([
   supabase.from("books").select("id,title,title_ne,author,available_copies,total_copies").order("title"),
   supabase.from("members").select("id,membership_no,full_name,full_name_ne,status").eq("status","active").order("full_name"),
   supabase.from("book_loans").select("id,book_id,member_id,issued_at,due_at,returned_at,status,fine_amount,books(title,title_ne),members(membership_no,full_name,full_name_ne)").order("issued_at",{ascending:false})
  ]);
  const err=b.error||m.error||l.error;
  if(err) setMessage("सूचना ल्याउन समस्या भयो: "+err.message);
  else {setBooks((b.data??[]) as Book[]);setMembers((m.data??[]) as Member[]);setLoans((l.data??[]) as Loan[]);}
  setLoading(false);
 }
 useEffect(()=>{void load();},[]);
 const activeLoans=useMemo(()=>loans.filter(l=>!l.returned_at),[loans]);
 const filtered=activeLoans.filter(l=>[l.books?.title,l.books?.title_ne,l.members?.full_name,l.members?.full_name_ne,l.members?.membership_no].some(v=>v?.toLowerCase().includes(search.toLowerCase())));
 async function issue(e:React.FormEvent<HTMLFormElement>) {
  e.preventDefault(); if(!supabase||!bookId||!memberId)return;
  setSaving(true);setMessage("");
  const {error}=await supabase.rpc("issue_library_book",{p_book_id:bookId,p_member_id:memberId,p_due_at:dueAt});
  setSaving(false);
  if(error){setMessage("पुस्तक जारी गर्न समस्या भयो: "+error.message);return;}
  setMessage("पुस्तक सफलतापूर्वक जारी भयो।");setBookId("");setMemberId("");setDueAt(dateAfter(14));await load();
 }
 async function giveBack(loan:Loan) {
  if(!supabase||!window.confirm("यो पुस्तक फिर्ता लिने हो?"))return;
  setSaving(true);setMessage("");
  const rate=Number(fineRate);
  if(!Number.isFinite(rate)||rate<0){setSaving(false);setMessage("जरिवाना दर शून्य वा सोभन्दा बढी राख्नुहोस्।");return;}
  const {data,error}=await supabase.rpc("return_library_book",{p_loan_id:loan.id,p_fine_per_day:rate});
  setSaving(false);
  if(error){setMessage("पुस्तक फिर्ता गर्दा समस्या भयो: "+error.message);return;}
  setMessage("पुस्तक फिर्ता भयो। जरिवाना: रु. "+Number(data??0).toFixed(2));await load();
 }
 return <main className="min-h-screen bg-gray-50">
  <header className="border-b bg-white"><div className="container flex items-center justify-between py-4"><div><p className="text-xs font-bold tracking-wider text-green-800">GODAWARI COMMUNITY LIBRARY</p><h1 className="text-xl font-bold">पुस्तक लेनदेन व्यवस्थापन</h1></div><a href="/admin" className="font-semibold text-green-800">← Dashboard</a></div></header>
  <div className="container space-y-6 py-7">
   <section className="panel p-6"><h2 className="text-lg font-bold">नयाँ पुस्तक जारी गर्नुहोस्</h2><form onSubmit={issue} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <label className="text-sm font-medium">पुस्तक छान्नुहोस् *<select required value={bookId} onChange={e=>setBookId(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"><option value="">पुस्तक छान्नुहोस्</option>{books.filter(b=>b.available_copies>0).map(b=><option key={b.id} value={b.id}>{b.title_ne||b.title} — उपलब्ध {b.available_copies}/{b.total_copies}</option>)}</select></label>
    <label className="text-sm font-medium">सक्रिय सदस्य छान्नुहोस् *<select required value={memberId} onChange={e=>setMemberId(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"><option value="">सदस्य छान्नुहोस्</option>{members.map(m=><option key={m.id} value={m.id}>{m.membership_no} — {m.full_name_ne||m.full_name}</option>)}</select></label>
    <label className="text-sm font-medium">फिर्ता गर्नुपर्ने मिति *<input required type="date" min={new Date().toISOString().slice(0,10)} value={dueAt} onChange={e=>setDueAt(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label>
    <div className="sm:col-span-2 lg:col-span-3"><button disabled={saving||!books.length||!members.length} className="rounded-lg bg-green-800 px-5 py-2.5 font-semibold text-white disabled:opacity-60">{saving?"प्रक्रिया हुँदैछ...":"पुस्तक जारी गर्नुहोस्"}</button></div>
   </form>{(!books.length||!members.length)&&!loading&&<p className="mt-3 text-sm text-amber-800">पुस्तक जारी गर्न कम्तीमा एउटा पुस्तक र एउटा सक्रिय सदस्य आवश्यक छ।</p>}</section>
   <section className="panel p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">जारी भएका पुस्तक ({activeLoans.length})</h2><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="पुस्तक, सदस्य वा सदस्य नम्बर खोज्नुहोस्..." className="w-full max-w-sm rounded-lg border p-2.5"/></div>
    <label className="mt-4 block max-w-xs text-sm font-medium">ढिलो फिर्ता गर्दा जरिवाना (रु./दिन)<input type="number" min="0" step="0.01" value={fineRate} onChange={e=>setFineRate(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label>
    {loading?<p className="py-8 text-center text-gray-500">लेनदेन सूची लोड हुँदैछ...</p>:filtered.length===0?<p className="py-8 text-center text-gray-500">हाल जारी पुस्तक छैन।</p>:
    <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-100"><tr>{["पुस्तक","सदस्य","जारी मिति","फिर्ता मिति","स्थिति","कार्य"].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{filtered.map(l=><tr key={l.id} className="border-b"><td className="p-3 font-semibold">{l.books?.title_ne||l.books?.title||"—"}</td><td className="p-3">{l.members?.full_name_ne||l.members?.full_name||"—"}<div className="text-xs text-gray-500">{l.members?.membership_no}</div></td><td className="p-3">{new Date(l.issued_at).toLocaleDateString("en-GB")}</td><td className="p-3">{new Date(l.due_at+"T00:00:00").toLocaleDateString("en-GB")}</td><td className="p-3">{new Date(l.due_at+"T23:59:59")<new Date()?"म्याद नाघेको":"जारी"}</td><td className="p-3"><button disabled={saving} onClick={()=>void giveBack(l)} className="whitespace-nowrap font-semibold text-green-800 disabled:opacity-50">फिर्ता लिनुहोस्</button></td></tr>)}</tbody></table></div>}
   </section>
   {message&&<p className="rounded-lg bg-green-50 p-3 text-sm text-green-900">{message}</p>}
  </div>
 </main>;
}
