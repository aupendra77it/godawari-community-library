import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookBarcodeManagement from "@/components/book-barcode-management";

const allowedRoles = ["super_admin", "library_admin", "librarian"];

export default async function BookBarcodesPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: profile } = await supabase.from("profiles")
    .select("role, is_active").eq("id", user.id).maybeSingle();
  if (!profile?.is_active || !allowedRoles.includes(profile.role)) redirect("/admin");
  return <BookBarcodeManagement />;
}
