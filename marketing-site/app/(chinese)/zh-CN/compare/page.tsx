import { ComparisonHubPage } from "@/features/comparison/page-content";
import { pageMetadata } from "@/i18n/metadata";

export const metadata = pageMetadata("zh-CN", "comparisonHub");

export default function ChineseComparisonHub() {
  return <ComparisonHubPage locale="zh-CN" />;
}
