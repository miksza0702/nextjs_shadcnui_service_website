import "../styles/globals.css"; // Upewnij się, że ścieżka prowadzi do właściwego pliku CSS
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
