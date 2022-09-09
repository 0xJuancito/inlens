/* eslint-disable @next/next/no-page-custom-font */
import Head from "next/head";

const AppHead = () => {
  return (
    <Head>
      {/* <!-- Primary Meta Tags --> */}
      <title>Who is in Lens?</title>
      <meta name="title" content="Who is in Lens?" />
      <meta
        name="description"
        content="​Find your friends from Twitter in Lens Protocol"
      />

      <link rel="icon" href="/favicon.ico" />

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
      ></meta>

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
      <meta property="twitter:image" content="https://inlens.xyz/inlens.png" />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700&amp;display=swap"
        rel="preload"
      ></link>
    </Head>
  );
};

export default AppHead;
