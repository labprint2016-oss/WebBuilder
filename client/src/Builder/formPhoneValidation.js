export const DEFAULT_TEL_PLACEHOLDER = "094-545-6263";
export const THAI_PHONE_DIGIT_LIMIT = 10;

export function formatThaiPhoneDisplay(raw) {
  const digits = String(raw ?? "")
    .replace(/\D/g, "")
    .slice(0, THAI_PHONE_DIGIT_LIMIT);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}
