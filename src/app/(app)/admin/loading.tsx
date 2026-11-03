import { ListSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return <ListSkeleton rows={6} label="Đang tải trang quản trị…" />;
}
