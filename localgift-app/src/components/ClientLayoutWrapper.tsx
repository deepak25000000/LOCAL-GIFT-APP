"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");

    if (isAdmin) {
        return <main className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0a0a0a] min-h-screen">{children}</main>;
    }

    return (
        <>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
        </>
    );
}
