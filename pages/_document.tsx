import { Html, Head, Main, NextScript } from "next/document";
import { Header } from "../components/Header";

export default function Document() {
  return (
    <Html lang="ja">
      <Head />
      <body className="bg-slate-50" style={{ height: "100vh" }}>
        <Header />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
