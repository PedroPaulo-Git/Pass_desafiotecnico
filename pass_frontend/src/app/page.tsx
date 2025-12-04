"use client";

import { useEffect } from "react";
import { HeaderHome } from "@/components/layout/HeaderHome";
import { FloatingSocialLinks } from "@/components/layout/FloatingSocialLinks";
import { api } from "@/lib/axios";

export default function Home() {
  // Wake up the backend on page load to prevent hibernation delays
  useEffect(() => {
    const wakeUpBackend = async () => {
      try {
        // Simple ping to wake up the backend (ignore response)
        await api.get("/vehicles?limit=1").catch(() => {
          // Silently fail - backend might be hibernating
          console.log("Backend is waking up...");
        });
      } catch (error) {
        // Ignore errors on homepage - this is just a wake-up call
      }
    };

    wakeUpBackend();
  }, []);

  return (
    <main className="max-h-screen">
      <section className="relative h-screen ">
        <div>
          <img
            src="/assets/WallpaperHome.jpg"
            className="absolute w-screen h-screen object-cover brightness-75"
            alt="Wallpaper Home"
          />
        </div>

        <HeaderHome />
      </section>
      <FloatingSocialLinks />
    </main>
  );
}
