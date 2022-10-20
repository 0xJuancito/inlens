import Image from "next/image";
import styles from "../styles/InlensLogoNav.module.css";

const InlensLogoNav = () => {
  return (
    <div className={styles.inlensContainer}>
      <Image
        unoptimized
        height="48"
        width="48"
        src="/birdie.svg"
        alt="inlens logo"
      ></Image>
      <span className={styles.inlensText}>inlens</span>
    </div>
  );
};

export default InlensLogoNav;
