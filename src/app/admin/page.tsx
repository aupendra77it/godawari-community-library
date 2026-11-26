import Link from "next/link";
import { redirect } from "next/navigation";
import AdminSignOut from "@/components/admin-sign-out";
import { createClient } from "@/lib/supabase/server";

const staffRoles = ["super_admin", "library_admin", "librarian", "room_manager", "staff"];
const roleLabels: Record<string, string> = {
  super_admin: "सुपर एडमिन",
  library_admin: "पुस्तकालय प्रशासक",
  librarian: "पुस्तकालय सहायक",
  room_manager: "कक्ष व्यवस्थापक",
  staff: "कर्मचारी",
  member: "सदस्य",
};

export default async function AdminPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <main className="min-h-screen grid place-items-center p-6"><section className="panel max-w-xl w-full p-8">
      <h1 className="text-2xl font-bold">Supabase सेटअप आवश्यक छ</h1>
      <p className="mt-3 leading-7 text-gray-600">.env.local फाइलमा NEXT_PUBLIC_SUPABASE_URL र NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY राखेर Development Server पुनः सुरु गर्नुहोस्।</p>
      <Link href="/" className="mt-6 inline-block font-semibold text-green-800">← सार्वजनिक वेबसाइट</Link>
    </section></main>;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile, error } = await supabase.from("profiles")
    .select("full_name, role, is_active").eq("id", user.id).maybeSingle();

  if (error || !profile) {
    return <main className="min-h-screen grid place-items-center p-6"><section className="panel max-w-xl w-full p-8">
      <h1 className="text-2xl font-bold">Database Migration आवश्यक छ</h1>
      <p className="mt-3 leading-7 text-gray-600">Supabase SQL Editor मा supabase/migrations भित्रका 0001 र 0002 migration क्रमशः चलाउनुहोस्। त्यसपछि पृष्ठ Refresh गर्नुहोस्।</p>
      <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">खाता बनेको भए पनि profiles तालिका र role configuration तयार नभएसम्म Admin Dashboard खुल्दैन।</div>
      <div className="mt-6 flex items-center justify-between"><Link href="/" className="font-semibold text-green-800">← सार्वजनिक वेबसाइट</Link><AdminSignOut /></div>
    </section></main>;
  }

  if (!profile.is_active || !staffRoles.includes(profile.role)) {
    return <main className="min-h-screen grid place-items-center p-6"><section className="panel max-w-xl w-full p-8">
      <h1 className="text-2xl font-bold">प्रवेश अनुमति छैन</h1>
      <p className="mt-3 leading-7 text-gray-600">यो खातालाई Admin Dashboard प्रयोग गर्ने अनुमति दिइएको छैन। पुस्तकालयको सुपर एडमिनसँग सम्पर्क गर्नुहोस्।</p>
      <div className="mt-6"><AdminSignOut /></div>
    </section></main>;
  }

  const displayName = profile.full_name || user.email || "कर्मचारी";
  const modules = [
    ["📚", "पुस्तक व्यवस्थापन", "पुस्तक सूची, वर्गीकरण र उपलब्ध प्रति", "/admin/books"],
    ["👥", "सदस्य व्यवस्थापन", "सदस्य दर्ता र सदस्यता विवरण", "/admin/members"],
    ["🪪", "सदस्य परिचयपत्र", "QR Code सहित सदस्य ID Card प्रिन्ट", "/admin/member-cards"],
    ["📷", "QR Code स्क्यान", "QR स्क्यान गरी सदस्यको विवरण खोज्नुहोस्", "/admin/member-qr-scan"],
    ["🔄", "पुस्तक लेनदेन", "पुस्तक जारी, फिर्ता र म्याद", "/admin/circulation"],
    ["💰", "जरिवाना व्यवस्थापन", "जरिवाना, भुक्तानी र बाँकी रकम", "/admin/fines"],
    ["🏠", "१२ कक्ष व्यवस्थापन", "कक्ष, स्रोतसाधन र गतिविधि"],
    ["📅", "कार्यक्रम तथा तालिम", "कार्यक्रम, सहभागी र उपस्थिति"],
    ["📊", "प्रतिवेदन", "मासिक, वार्षिक र कक्षगत विवरण"],
  ];

  return <main className="min-h-screen">
    <header className="border-b border-green-100 bg-white"><div className="container flex flex-wrap items-center justify-between gap-4 py-4">
      <div><p className="text-xs font-bold tracking-wider text-green-800">GODAWARI COMMUNITY LIBRARY</p><h1 className="mt-1 text-xl font-bold">प्रशासन Dashboard</h1></div>
      <div className="flex items-center gap-3"><div className="text-right"><p className="text-sm font-semibold">{displayName}</p><p className="text-xs text-gray-500">{roleLabels[profile.role] ?? profile.role}</p></div><AdminSignOut /></div>
    </div></header>
    <div className="container py-8">
      <div className="rounded-2xl bg-green-900 p-7 text-white"><p className="text-sm text-green-100">स्वागत छ</p><h2 className="mt-2 text-2xl font-bold">{displayName}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-green-100">Godawari Community Library Resource Center को प्रशासन प्रणालीमा तपाईं सफलतापूर्वक लगइन हुनुभएको छ।</p></div>
      <h2 className="mt-8 text-lg font-bold">व्यवस्थापन मोड्युलहरू</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{modules.map(([icon, title, description, href]) => <article key={title} className="panel p-5">
        <div className="text-2xl">{icon}</div><h3 className="mt-3 font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>{href ? <Link href={href} className="mt-4 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-900">मोड्युल खोल्नुहोस् →</Link> : <span className="mt-4 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">आगामी चरण</span>}
      </article>)}</div>
      <p className="mt-8 text-xs leading-6 text-gray-500">अहिले Authentication र भूमिका जाँच सक्रिय छन्। व्यवस्थापन मोड्युलहरू अर्को विकास चरणमा Database सँग जोडिनेछन्।</p>
    </div>
  </main>;
}
