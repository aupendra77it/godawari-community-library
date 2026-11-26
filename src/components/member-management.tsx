"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Member = {
  id: string; membership_no: string; full_name: string; full_name_ne: string | null;
  phone: string | null; email: string | null; address: string | null;
  member_type: "general" | "child" | "youth" | "women" | "institutional";
  status: "active" | "inactive" | "suspended";
};
const blank = { membership_no: "", full_name: "", full_name_ne: "", phone: "", email: "", address: "", member_type: "general" as Member["member_type"], status: "active" as Member["status"] };
const types = [{value:"general",label:"सामान्य"},{value:"child",label:"बाल सदस्य"},{value:"youth",label:"युवा"},{value:"women",label:"महिला"},{value:"institutional",label:"संस्थागत"}];
const statuses = [{value:"active",label:"सक्रिय"},{value:"inactive",label:"निष्क्रिय"},{value:"suspended",label:"निलम्बित"}];

export default function MemberManagement() {
  const supabase = createClient();
  const [members,setMembers] = useState<Member[]>([]);
  const [form,setForm] = useState(blank);
  const [editingId,setEditingId] = useState<string|null>(null);
  const [search,setSearch] = useState("");
  const [message,setMessage] = useState("");
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);

  async function loadMembers() {
    if (!supabase) { setMessage("Supabase सेटअप जाँच गर्नुहोस्।"); setLoading(false); return; }
    setLoading(true);
    const {data,error} = await supabase.from("members").select("*").order("created_at",{ascending:false});
    if (error) setMessage("सदस्य सूची ल्याउन समस्या भयो: "+error.message);
    else setMembers((data??[]) as Member[]);
    setLoading(false);
  }
  useEffect(()=>{ void loadMembers(); },[]);
  function change<K extends keyof typeof blank>(key:K,value:(typeof blank)[K]) { setForm(old=>({...old,[key]:value})); }

  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    if (!form.membership_no.trim() || !form.full_name.trim()) { setMessage("सदस्य नम्बर र नाम अनिवार्य छन्।"); return; }
    setSaving(true); setMessage("");
    const payload = {...form, membership_no:form.membership_no.trim(), full_name:form.full_name.trim(),
      full_name_ne:form.full_name_ne.trim()||null, phone:form.phone.trim()||null,
      email:form.email.trim()||null, address:form.address.trim()||null};
    const result = editingId ? await supabase.from("members").update(payload).eq("id",editingId) : await supabase.from("members").insert(payload);
    setSaving(false);
    if (result.error) { setMessage("सुरक्षित गर्न समस्या भयो: "+result.error.message); return; }
    setMessage(editingId?"सदस्य विवरण अद्यावधिक भयो।":"नयाँ सदस्य दर्ता भयो।");
    setForm(blank); setEditingId(null); await loadMembers();
  }
  function edit(m:Member) {
    setEditingId(m.id); setForm({membership_no:m.membership_no,full_name:m.full_name,full_name_ne:m.full_name_ne??"",phone:m.phone??"",email:m.email??"",address:m.address??"",member_type:m.member_type,status:m.status});
    setMessage(""); window.scrollTo({top:0,behavior:"smooth"});
  }
  async function remove(m:Member) {
    if (!supabase || !window.confirm('"'+m.full_name+'" सदस्य हटाउने हो?')) return;
    const {error}=await supabase.from("members").delete().eq("id",m.id);
    if(error) setMessage("हटाउन समस्या भयो: "+error.message);
    else {setMessage("सदस्य हटाइयो।"); await loadMembers();}
  }
  const filtered=members.filter(m=>[m.membership_no,m.full_name,m.full_name_ne,m.phone,m.email].some(v=>v?.toLowerCase().includes(search.toLowerCase())));
  return <main className="min-h-screen bg-gray-50">
    <header className="border-b bg-white"><div className="container flex items-center justify-between py-4"><div><p className="text-xs font-bold tracking-wider text-green-800">GODAWARI COMMUNITY LIBRARY</p><h1 className="text-xl font-bold">सदस्य व्यवस्थापन</h1></div><a href="/admin" className="font-semibold text-green-800">← Dashboard</a></div></header>
    <div className="container space-y-6 py-7">
      <section className="panel p-6"><h2 className="text-lg font-bold">{editingId?"सदस्य विवरण सम्पादन":"नयाँ सदस्य दर्ता"}</h2>
        <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium">सदस्य नम्बर *<input required value={form.membership_no} onChange={e=>change("membership_no",e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label>
          <label className="text-sm font-medium">नाम (English) *<input required value={form.full_name} onChange={e=>change("full_name",e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label>
          <label className="text-sm font-medium">नाम (नेपाली)<input value={form.full_name_ne} onChange={e=>change("full_name_ne",e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label>
          <label className="text-sm font-medium">फोन नम्बर<input value={form.phone} onChange={e=>change("phone",e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label>
          <label className="text-sm font-medium">इमेल<input type="email" value={form.email} onChange={e=>change("email",e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label>
          <label className="text-sm font-medium">ठेगाना<input value={form.address} onChange={e=>change("address",e.target.value)} className="mt-1 w-full rounded-lg border p-2.5"/></label>
          <label className="text-sm font-medium">सदस्यको प्रकार<select value={form.member_type} onChange={e=>change("member_type",e.target.value as Member["member_type"])} className="mt-1 w-full rounded-lg border p-2.5">{types.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
          <label className="text-sm font-medium">स्थिति<select value={form.status} onChange={e=>change("status",e.target.value as Member["status"])} className="mt-1 w-full rounded-lg border p-2.5">{statuses.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3"><button disabled={saving} className="rounded-lg bg-green-800 px-5 py-2.5 font-semibold text-white disabled:opacity-60">{saving?"सुरक्षित हुँदैछ...":editingId?"परिवर्तन सुरक्षित गर्नुहोस्":"सदस्य दर्ता गर्नुहोस्"}</button>{editingId&&<button type="button" onClick={()=>{setEditingId(null);setForm(blank);}} className="rounded-lg border px-5 py-2.5">रद्द गर्नुहोस्</button>}</div>
        </form>{message&&<p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-900">{message}</p>}
      </section>
      <section className="panel p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">सदस्य सूची ({members.length})</h2><input placeholder="नाम, सदस्य नम्बर वा फोन खोज्नुहोस्..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full max-w-sm rounded-lg border p-2.5"/></div>
        {loading?<p className="py-8 text-center text-gray-500">सदस्य सूची लोड हुँदैछ...</p>:filtered.length===0?<p className="py-8 text-center text-gray-500">सदस्य भेटिएन।</p>:
        <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-100"><tr>{["सदस्य नं.","नाम","फोन","प्रकार","स्थिति","कार्य"].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{filtered.map(m=><tr key={m.id} className="border-b"><td className="p-3">{m.membership_no}</td><td className="p-3 font-semibold">{m.full_name}<div className="text-xs font-normal text-gray-500">{m.full_name_ne}</div></td><td className="p-3">{m.phone||"—"}</td><td className="p-3">{types.find(t=>t.value===m.member_type)?.label}</td><td className="p-3">{statuses.find(s=>s.value===m.status)?.label}</td><td className="whitespace-nowrap p-3"><button onClick={()=>edit(m)} className="mr-3 font-semibold text-blue-700">सम्पादन</button><button onClick={()=>void remove(m)} className="font-semibold text-red-700">हटाउने</button></td></tr>)}</tbody></table></div>}
      </section>
    </div>
  </main>;
}
