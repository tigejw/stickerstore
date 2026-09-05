export interface EndpointDocumentation {
  description: string;
  queries: string[];
  exampleResponse: Record<string, unknown>;
}

export type EndpointsData = Record<string, EndpointDocumentation>;

export interface BundlesQuery {
  sort_by?: "price" | "created_at" | "name";
  order?: "asc" | "desc";
  active?: string;
  is_new?: string;
}

export interface ProductImage {
  image_url: string;
  alt_text: string;
  is_thumbnail: boolean;
  display_order: number;
}

export interface Product {
  product_id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  created_at: Date;
  size: string;
  is_new: boolean;
  thumbnail_url: string;
  thumbnail_alt_text: string;
  images: ProductImage[];
}

export interface ProductsQuery {
  sort_by?: "price" | "created_at" | "name";
  order?: "asc" | "desc";
  active?: string;
  is_new?: string;
}

export interface BundleImage {
  image_url: string;
  alt_text: string;
  is_thumbnail: boolean;
  display_order: number;
}

export interface Bundle {
  bundle_id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  created_at: Date;
  is_new: boolean;
  thumbnail_url: string;
  thumbnail_alt_text: string;
  images: BundleImage[];
}

export type CheckoutItemInput = {
  type: "product" | "bundle";
  id: string;
  quantity: number;
};

export type CheckoutProductItem = {
  type: "product";
  quantity: number;
  product: Product;
};

export interface BundleProductSummary {
  product_id: number;
  slug: string;
  name: string;
  price: number;
  active: boolean;
  is_new: boolean;
  thumbnail_url: string;
  thumbnail_alt_text: string;
}

export interface BundleWithProducts extends Bundle {
  products: BundleProductSummary[];
}
export type CheckoutBundleItem = {
  type: "bundle";
  quantity: number;
  bundle: BundleWithProducts;
};

export type CheckoutItem = CheckoutProductItem | CheckoutBundleItem;

export interface OrderItemMetadata {
  type: "product" | "bundle";
  id: number;
  quantity: number;
}

export interface ShippingDetails {
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string;
  country: string;
}

export type FulfillOrderResult =
  | {
    status: "created";
    order: Order
  }
  | { status: "duplicate" };

export type Order = {
  id: number;
  customerEmail: string;
  shippingDetails: ShippingDetails;
  items: OrderItemMetadata[];
  amountTotal: number | null;
  currency: string | null;
};

export type LineItem = {
  price_data: {
    currency: "eur";
    product_data: {
      name: string;
      images: string[];
    };
    unit_amount: number;
  };
  quantity: number;
};






