import { DokkuComparisonPage } from "@/features/comparison/dokku/page-content";
import { pageMetadata } from "@/i18n/metadata";

export const metadata = pageMetadata("zh-CN", "dokku");

export default function ChineseDokkuComparison() {
  return <DokkuComparisonPage locale="zh-CN" />;
}
