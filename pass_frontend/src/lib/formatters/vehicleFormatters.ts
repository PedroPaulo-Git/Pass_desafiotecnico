export const formatPlate = (value: string) => {
  const cleaned = (value || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (cleaned.length > 3) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 10)}`.slice(0, 8);
  return cleaned;
}

export const formatRenavam = (value: string) => {
  return (value || "").toString().replace(/\D/g, "").slice(0, 11);
}

export const formatChassis = (value: string) => {
  return (value || "").toString().replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 17);
}

export const formatUf = (value: string) => {
  return (value || "").toString().replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
}

export const formatLetters = (value: string) => {
  return (value || "").toString().replace(/[^^\p{L} \-\.]/gu, "");
}

export const sanitizePayload = (payload: any) => {
  return {
    ...payload,
    plate: (payload.plate ?? "").toString().replace(/-/g, ""),
    renavam: (payload.renavam ?? "").toString().replace(/\D/g, ""),
    chassis: (payload.chassis ?? "").toString().toUpperCase(),
    state: (payload.state ?? "").toString().toUpperCase(),
    brand: (payload.brand ?? "").toString().trim(),
    description: (payload.description ?? "").toString().trim(),
  }
}

export default {
  formatPlate,
  formatRenavam,
  formatChassis,
  formatUf,
  formatLetters,
  sanitizePayload,
}
