import { CoolifyComparisonPage } from "@/features/comparison/coolify/page-content";
import { pageMetadata } from "@/i18n/metadata";

export const metadata = pageMetadata("zh-CN", "coolify");

export default function ChineseCoolifyComparison() {
  return <CoolifyComparisonPage locale="zh-CN" />;
}
