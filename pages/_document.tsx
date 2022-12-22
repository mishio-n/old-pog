import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ja" data-theme="cupcake">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.png"></link>
        <meta name="theme-color" content="#374151" />
        <meta name="icon" content="/favicon.ico" />
        <meta property="og:title" content={"おうちPOG"} />
        <meta property="og:description" content={"POG集計サイト"} />
        <meta
          property="og:image"
          content={"https://ouchi-pog.vercel.app/icon-256x256.png"}
        />
      </Head>
      <body className="bg-slate-50" style={{ minHeight: "100vh" }}>
        <div id="modal" className=""></div>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
