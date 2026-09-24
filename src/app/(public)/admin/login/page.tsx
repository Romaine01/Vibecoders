import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function AdminLoginPage() { return <Suspense fallback={null}><AuthForm mode="admin" /></Suspense>; }
