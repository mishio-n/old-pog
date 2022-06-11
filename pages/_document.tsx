import { Head, Html, Main, NextScript } from "next/document";
import { Header } from "~/components/Header";

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
        <meta property="og:image" content={"/favicon.ico"} />
      </Head>
      <body className="bg-slate-50" style={{ minHeight: "100vh" }}>
        <Header />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
