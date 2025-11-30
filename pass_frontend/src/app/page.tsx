import { HeaderHome } from "@/components/layout/HeaderHome";

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="relative">
        <div>
          <img
          src="/assets/WallpaperHome.jpg"
          className="absolute w-screen h-screen object-cover brightness-75"
          alt=""
        />
        </div>
        <HeaderHome />
        
      </section>
    </main>
  );
}
