export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return '/placeholder-product.svg';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Prepend backend base URL (remove /api suffix if present for static files)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5189';
  const backendUrl = apiUrl.replace(/\/api$/, '');
  return `${backendUrl}${imagePath}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-LK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};
