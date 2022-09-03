import Head from "next/head";
import { useRef, useState, useEffect, SetStateAction } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [waiting, setWaiting] = useState(false);
  const [frens, setFrens] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const twitterInput = useRef(null);

  const onChangeHandler = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    if (twitterInput.current) twitterInput.current.focus();
  }, [twitterInput]);

  const makeRequest = async () => {
    if (waiting) {
      return;
    }
    setWaiting(true);

    const parsedValue = inputValue.replaceAll("@", "");

    if (!parsedValue) {
      setWaiting(false);
      return;
    }
    try {
      const res = await fetch(`/api/frens?username=${parsedValue}`);

      setFrens([]);
      setErrorMessage("");

      if (res.status === 200) {
        const newFrens = await res.json();
        if (newFrens.length) {
          setFrens(newFrens);
        } else {
          setErrorMessage("No friend was found :(");
        }
      } else {
        setErrorMessage(
          "Too many requests. Please try again in a few minutes ⌛️"
        );
      }

      setWaiting(false);
    } catch (err) {
      console.log(err);
      setWaiting(false);
    }
  };

  const frensList = () => {
    if (!frens?.length) {
      return "";
    }

    const twitterUrl = (handle: string) => `https://twitter.com/${handle}`;
    const lensUrl = (handle: string) =>
      `https://lensfrens.xyz/${handle.toLowerCase()}`;

    return (
      <div className={styles.frensContainer}>
        <div>
          Found {frens.length} frens in Lens! {"🤎"}
        </div>
        <ul>
          {frens.map((fren) => (
            <li key={fren.twitter}>
              <a
                className={styles.twitter}
                href={twitterUrl(fren.twitter)}
                target={"_blank"}
                rel={"noreferrer"}
              >
                @{fren.twitter}
              </a>
              {"=>"} {" 🌿"}
              <a
                className={styles.lens}
                href={lensUrl(fren.lens)}
                target={"_blank"}
                rel={"noreferrer"}
              >
                {fren.lens}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderHeart = () => {
    return (
      <span className={styles.ldsheart}>
        <div></div>
      </span>
    );
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Who is in Lens?</title>
        <meta
          name="description"
          content="​Find your friends from Twitter in Lens Protocol 🌿"
        />
        <link rel="icon" href="/favicon.ico" />

        {/* <!-- Primary Meta Tags --> */}
        <title>Who is in Lens?</title>
        <meta name="title" content="Who is in Lens?" />
        <meta
          name="description"
          content="​Find your friends from Twitter in Lens Protocol"
        />

        {/* <!-- Open Graph / Facebook --> */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://inlens.xyz/" />
        <meta property="og:title" content="Who is in Lens?" />
        <meta
          property="og:description"
          content="​Find your friends from Twitter in Lens Protocol"
        />
        <meta property="og:image" content="https://inlens.xyz/inlens.png" />

        {/* <!-- Twitter --> */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://inlens.xyz/" />
        <meta property="twitter:title" content="Who is in Lens?" />
        <meta
          property="twitter:description"
          content="​Find your friends from Twitter in Lens Protocol"
        />
        <meta
          property="twitter:image"
          content="https://inlens.xyz/inlens.png"
        />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Who is in Lens?</h1>
        <p className={styles.description}>
          ​Find your friends from Twitter in Lens Protocol 🌿
        </p>
        <div className={styles.inputContainer}>
          <div className={styles.twitterInputContainer}>
            <span className={styles.twitterInputAt}>@</span>
            <input
              type="text"
              name="twitterInput"
              className={styles.twitterInput}
              ref={twitterInput}
              value={inputValue}
              onChange={onChangeHandler}
              placeholder="TwitterHandle"
            ></input>
          </div>
          <button onClick={() => makeRequest()}>Find Frens!</button>
        </div>
        <div className={styles.pleaseWait}>
          {waiting === true ? "Finding frens in Lens. Please wait :)" : ""}
        </div>
        <div>{waiting === true ? "It takes up to 10 seconds ⌛️" : ""}</div>
        {waiting === true ? renderHeart() : ""}
        <div>{!waiting && errorMessage}</div>
        <div>{!waiting && frensList()}</div>
      </main>

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
    </div>
  );
}
