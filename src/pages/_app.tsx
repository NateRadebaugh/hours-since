import "../styles/styles.scss";
import { AppProps } from "next/app";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <ThemeToggle />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}
