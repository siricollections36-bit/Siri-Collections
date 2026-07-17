export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const getDiscountPercent = (original, current) =>
  Math.round(((original - current) / original) * 100);

export const truncate = (text, maxLength = 80) =>
  text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

export const generateStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return { full, half, empty };
};
