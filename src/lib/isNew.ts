// Returns true if the product was created within the last 7 days
export const isNewProduct = (createdAt: string): boolean => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
};
