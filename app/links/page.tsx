import type { Metadata } from "next";
import { LinksList } from "@/components/LinksList";

export const metadata: Metadata = {
  title: "ลิงก์ของฉัน",
};

export default function LinksPage() {
  return <LinksList />;
}
