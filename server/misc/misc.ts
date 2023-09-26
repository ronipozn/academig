exports.version = "0.1.0";

export function NFD(r: string): string {
  if (r==null) return null
  return r.replace(/ /g,"_").normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()
}
