import { RootDocument, rootMetadata } from "@/app/root-document";

export const metadata = rootMetadata;

export default function ChineseRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RootDocument locale="zh-CN">{children}</RootDocument>;
}
