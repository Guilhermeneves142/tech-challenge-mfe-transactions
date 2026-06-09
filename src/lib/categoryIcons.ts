import {
  ShoppingBag,
  CarFront,
  Home,
  Banknote,
  CornerUpRight,
  FerrisWheel,
  HeartPulse,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "./api";

export const categoryIconMap: Record<string, LucideIcon> = {
  ShoppingBag,
  CarFront,
  Home,
  Banknote,
  CornerUpRigth: CornerUpRight,
  FerrisWhell: FerrisWheel,
  HeartPulse,
  GraduationCap,
};

export function getCategoryIcon(
  categories: Category[],
  categoryId: string
): LucideIcon {
  const category = categories.find((c) => c.id === categoryId);
  return categoryIconMap[category?.icon ?? "ShoppingBag"] ?? ShoppingBag;
}
