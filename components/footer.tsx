import styles from "../styles/Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <span role="img" aria-label="sheep">
        Built with 🌿 by
      </span>
      <a href="https://www.lensfrens.xyz/juancito.lens" target="blank">
        juancito.lens
      </a>
      &nbsp; | &nbsp;
      <a
        href="https://github.com/juanscolari/who-is-in-lens"
        target={"_blank"}
        rel={"noreferrer"}
      >
        GitHub
      </a>
    </footer>
  );
};

export default Footer;
