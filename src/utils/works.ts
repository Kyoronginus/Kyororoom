import worksOrder from '../data/works-order.json';

export interface WorkLike {
  id: string;
  data?: {
    date?: string;
    [key: string]: any;
  };
}

/**
 * Sorts artworks according to the curated sequence defined in src/data/works-order.json.
 * Any unlisted artwork falls back to creation date descending, then ID.
 */
export function sortWorks<T extends WorkLike>(works: T[]): T[] {
  const orderList = Array.isArray(worksOrder) ? (worksOrder as string[]) : [];
  const orderMap = new Map<string, number>(orderList.map((id, idx) => [id, idx]));

  return [...works].sort((a, b) => {
    const hasA = orderMap.has(a.id);
    const hasB = orderMap.has(b.id);

    if (hasA && hasB) {
      return (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0);
    }
    if (hasA) return -1;
    if (hasB) return 1;

    // Fallback for unlisted works: date descending
    const dateA = a.data?.date ? new Date(a.data.date).getTime() : 0;
    const dateB = b.data?.date ? new Date(b.data.date).getTime() : 0;
    if (dateA !== dateB) return dateB - dateA;

    return b.id.localeCompare(a.id);
  });
}
