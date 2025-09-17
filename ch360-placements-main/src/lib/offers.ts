export interface Offer {
  id: string
  title: string
  company: string
  type: "job" | "internship"
  location: string
  stipendOrCtc: string
  deadlineISO: string
  description?: string
  createdAtISO: string
}

const STORAGE_KEY = "placement_portal_offers_v1"

function readAll(): Offer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as Offer[]
  } catch {
    return []
  }
}

function writeAll(offers: Offer[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(offers))
}

export function listOffers(): Offer[] {
  return readAll().sort((a, b) => (a.createdAtISO < b.createdAtISO ? 1 : -1))
}

export function createOffer(input: Omit<Offer, "id" | "createdAtISO">): Offer {
  const offers = readAll()
  const offer: Offer = {
    id: crypto.randomUUID(),
    createdAtISO: new Date().toISOString(),
    ...input,
  }
  offers.push(offer)
  writeAll(offers)
  return offer
}

export function deleteOffer(id: string): void {
  const offers = readAll().filter((o) => o.id !== id)
  writeAll(offers)
}

export function clearOffers(): void {
  writeAll([])
}


