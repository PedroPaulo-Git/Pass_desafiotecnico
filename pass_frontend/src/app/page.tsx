import { HeaderHome } from "@/components/layout/HeaderHome";
import { FloatingSocialLinks } from "@/components/layout/FloatingSocialLinks";

export default function Home() {
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
