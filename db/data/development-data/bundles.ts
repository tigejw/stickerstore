type BundleSeed = {
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  price: number;
  active: boolean;
  isNew: boolean;
  createdAt: string;
};

const bundles: BundleSeed[] = [
  {
    name: "Jurrasic Dinosaurs",
    slug: "jurassic-dinosaurs",
    description: "jurrasic dinosaurs r cool.",
    cover_image: "jurr.png",
    price: 3299,
    active: true,
    isNew: true,
    createdAt: "2026-02-01T00:00:00.000Z",
  },
  {
    name: "Cretaceous Dinosaurs",
    slug: "cretaceous-dinosaurs",
    description: "cretaceous dinosaurs r cool",
    cover_image: "cret.png",
    price: 3099,
    active: true,
    isNew: false,
    createdAt: "2026-02-02T00:00:00.000Z",
  },
];

export default bundles;
