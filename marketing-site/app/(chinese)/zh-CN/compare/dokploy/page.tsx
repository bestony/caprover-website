import { DokployComparisonPage } from "@/features/comparison/dokploy/page-content";
import { pageMetadata } from "@/i18n/metadata";

export const metadata = pageMetadata("zh-CN", "dokploy");

export default function ChineseDokployComparison() {
  return <DokployComparisonPage locale="zh-CN" />;
}
