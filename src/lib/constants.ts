// RELIEVE E-commerce Constants

export const SITE_NAME = "RELIEVE";
export const SITE_TAGLINE = "Elevate Your Essence";
export const CURRENCY = "৳";

export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_METHODS = {
  COD: "cod",
  BKASH: "bkash",
  NAGAD: "nagad",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  bkash: "bKash",
  nagad: "Nagad",
};

export const ADMIN_CREDENTIALS = {
  username: "Relieve01",
  password: "Relieve12@",
};

export const PERFUME_CATEGORIES = [
  "All",
  "For Him",
  "For Her",
  "Unisex",
  "Luxury",
  "Fresh",
  "Woody",
  "Floral",
] as const;

export type PerfumeCategory = (typeof PERFUME_CATEGORIES)[number];

export const formatPrice = (price: number): string => {
  return `${CURRENCY}${price.toLocaleString("en-BD")}`;
};
