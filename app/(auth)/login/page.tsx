import Image from "next/image";
import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";

import { AuthCard } from "@/components/pages/auth/auth-card";

export default function SignPage() {
  return (
    <div className="grid h-dvh overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-sky-50 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative flex h-full flex-col justify-between overflow-y-auto p-6 sm:p-10 lg:overflow-y-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,_rgba(15,118,220,0.08)_1px,transparent_1px),linear-gradient(to_bottom,_rgba(15,118,220,0.08)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(circle_at_center,_white_55%,_transparent_100%)]" />

        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur transition hover:border-blue-200 hover:text-blue-600"
          >
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
              <GalleryVerticalEnd className="size-4" />
            </span>
            Better Auth
          </Link>
        </div>

        <div className="relative z-10 mx-auto mt-12 w-full max-w-md">
          <AuthCard />
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-blue-500/70 to-slate-900/90" />
        <Image
          src="/globe.svg"
          alt="רקע חיבור"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <div className="space-y-4">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-100">
              Welcome Back
            </span>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              חוויית התחברות נעימה, מאובטחת ומהירה
            </h2>
            <p className="text-sm text-slate-200/80 sm:text-base">
              התחברו למערכת מכל מקום ובכל זמן, עם תצוגה חדשה שמדגישה את הבטיחות והפשטות של תהליך ההזדהות.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-white/10 p-6 text-sm shadow-xl backdrop-blur">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-8 w-8 rounded-full bg-white/15" />
              <div className="space-y-1">
                <p className="font-semibold text-white">מדדים בזמן אמת</p>
                <p className="text-slate-100/70">
                  שמרו על שליטה מלאה בעזרת לוח בקרה מעודכן וידידותי למשתמש.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-8 w-8 rounded-full bg-white/15" />
              <div className="space-y-1">
                <p className="font-semibold text-white">גישה מאובטחת</p>
                <p className="text-slate-100/70">
                  אימות דו שלבי וסיסמאות חזקות שומרים על המידע שלכם מוגן.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
