import styles from "./Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      Sunrise/sunset data provided by{" "}
      <a
        href="https://sunrise-sunset.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        sunrise-sunset.org
      </a>
    </footer>
  );
}
