import "../styles/styles.scss";
import { AppProps } from "next/app";
import ThemeToggle from "../components/ThemeToggle";

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <ThemeToggle />
      <Component {...pageProps} />
    </>
  );
}
