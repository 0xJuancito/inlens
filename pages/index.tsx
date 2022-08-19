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
    const lensUrl = (handle: string) => `https://lensfrens.xyz/${handle}`;

    return (
      <div>
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
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Who is in Lens?</h1>

        <p className={styles.description}>
          ​Find your friends from Twitter in Lens Protocol 🌿
        </p>

        <div className={styles.inputContainer}>
          <input
            type="text"
            name="twitterInput"
            ref={twitterInput}
            value={inputValue}
            onChange={onChangeHandler}
            placeholder="@LensProtocol"
          ></input>
          <button onClick={() => makeRequest()}>Find Frens!</button>
          {waiting === true ? renderHeart() : ""}
        </div>
        <div>
          {waiting === true
            ? "Finding frens in Lens. It takes around 10 seconds :)"
            : ""}
        </div>
        <div>{waiting === true ? "Don't refresh the page! 🙏" : ""}</div>
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
