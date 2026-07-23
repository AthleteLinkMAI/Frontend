import { format } from "date-fns";
import { ru } from "date-fns/locale";

export function getCurrentDateFormatted(): string {
  const today = new Date();
  return format(today, "EE, d MMMM yyyy", { locale: ru });
}

export function formatDateRussian(date: Date): string {
  return format(date, "EE, d MMMM yyyy", { locale: ru });
}
