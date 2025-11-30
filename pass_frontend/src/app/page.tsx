import { HeaderHome } from "@/components/layout/HeaderHome";

export default function Home() {
  return (
    <main className="min-h-screen">
     <HeaderHome />
      <img
        src="/assets/WallpaperHome.jpg"
        className="w-screen h-screen object-cover  "
        alt=""
      />
    </main>
  );
}
