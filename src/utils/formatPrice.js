// Utility to format price into Vietnamese currency format
// Example: 16000000 -> "16.000.000₫"
export default function formatPrice(value) {
  if (value === undefined || value === null || isNaN(value)) {
    return "0₫";
  }

  // Ensure we have a number
  const number = typeof value === "string" ? Number(value) : value;

  // Use toLocaleString with Vietnamese locale then append currency symbol
  return `${number.toLocaleString('vi-VN')}₫`;
}
