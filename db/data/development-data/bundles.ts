type BundleSeed = {
  bundle_id: number;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
};

const bundles: BundleSeed[] = [
  {
    bundle_id: 1,
    name: "Jurrasic Dinosaurs",
    slug: "jurassic-dinosaurs",
    description: "jurrasic dinosaurs r cool.",
    cover_image: "jurr.png",
  },
  {
    bundle_id: 2,
    name: "Cretaceous Dinosaurs",
    slug: "cretaceous-dinosaurs",
    description: "cretaceous dinosaurs r cool",
    cover_image: "cret.png",
  },
];

export default bundles;
