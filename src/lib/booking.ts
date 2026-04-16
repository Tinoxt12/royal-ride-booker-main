export function generateBookingRef(now = new Date()): string {
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `RR-${dateStr}-${rand}`;
}
