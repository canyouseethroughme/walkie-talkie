import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Gloria_Hallelujah } from "next/font/google";

const gloria = Gloria_Hallelujah({ weight: "400", subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${gloria.className} w-screen h-screen`}>
      <Component {...pageProps} />
    </main>
  );
}
