import React, { useImperativeHandle, useState } from "react";
import Popup from "reactjs-popup";
import styles from "../styles/Popup.module.css";
import Image from "next/image";

const ClaimPopup = (props, ref) => {
  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);

  useImperativeHandle(ref, () => ({
    open() {
      setOpen(true);
    },
  }));

  return (
    <Popup open={open} onClose={closeModal} closeOnDocumentClick>
      <div className={styles.modal}>
        <button className={styles.close} onClick={closeModal}>
          &times;
        </button>
        <div className={styles.header}>
          <Image
            unoptimized
            height="40"
            width="40"
            src="/lens.svg"
            alt="Lens Logo"
          ></Image>
          Login
        </div>
        <div className={styles.content}>
          <h2>Claim your Lens profile 🌿</h2>
          <div className={styles.claimContainer}>
            <Image
              unoptimized
              height="64"
              width="64"
              src="/lens.png"
              alt="Lens Logo"
            ></Image>
            <span className={styles.noHandler}>
              {"It seems like you don't have a Lens profile"}
            </span>
          </div>

          <p>
            Visit the{" "}
            <a
              href="https://claim.lens.xyz/"
              target={"_blank"}
              rel={"noreferrer"}
            >
              Lens claiming site{" "}
            </a>
            to claim your profile now
          </p>
        </div>
      </div>
    </Popup>
  );
};

export default React.forwardRef(ClaimPopup);
