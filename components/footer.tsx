import styles from "../styles/Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div>
        <a
          href="https://inlens.canny.io/feature-requests"
          target={"_blank"}
          rel={"noreferrer"}
        >
          Feedback
        </a>
        &nbsp; | &nbsp;
        <a
          href="https://inlens.canny.io/bugs"
          target={"_blank"}
          rel={"noreferrer"}
        >
          Report a Bug
        </a>
        &nbsp; | &nbsp;
        <a
          href="https://github.com/0xJuancito/inlens"
          target={"_blank"}
          rel={"noreferrer"}
        >
          GitHub
        </a>
      </div>
      <div>
        <span role="img" aria-label="sheep">
          Built with 🌿 by
        </span>
        <a href="https://lenster.xyz/u/juancito.lens" target="blank">
          juancito.lens
        </a>
      </div>
    </footer>
  );
};

export default Footer;
