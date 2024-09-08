import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Gloria_Hallelujah } from "next/font/google";
import Image from "next/image";
import doodle from "../public/doodle.png";

const gloria = Gloria_Hallelujah({ weight: "400", subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${gloria.className} w-screen h-screen`}>
      <Component {...pageProps} />
      <Image
        src={doodle}
        alt="Doodle background image"
        fetchPriority="high"
        fill={true}
        loading="eager"
        placeholder="blur"
        className="object-cover z-0"
      />
    </main>
  );
}
