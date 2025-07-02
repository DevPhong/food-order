import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Xóa dấu gạch chéo đầu chuỗi
// Ví dụ: "/path/to/resource" -> "path/to/resource"
export const normalizePath = (path: string) => {
  return path.startsWith("/") ? path.slice(1) : path;
};
