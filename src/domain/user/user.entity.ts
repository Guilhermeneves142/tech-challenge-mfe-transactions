export interface User {
  id: number;
  name: string;
  email: string;
  initials: string;
  plan: string;
  avatar: string | null;
}

/** Iniciais das duas primeiras palavras do nome. */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
