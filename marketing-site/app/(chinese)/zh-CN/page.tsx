import { HomePage } from "@/app/home-page";
import { pageMetadata } from "@/i18n/metadata";

export const metadata = pageMetadata("zh-CN", "home");

export default function ChineseHomepage() {
  return <HomePage locale="zh-CN" />;
}
