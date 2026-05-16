type BundleSeed = {
  name: string;
  slug: string;
  description: string;
  cover_image: string;
};

const bundles: BundleSeed[] = [
  {
    name: "Jurrasic Dinosaurs",
    slug: "jurassic-dinosaurs",
    description: "jurrasic dinosaurs r cool.",
    cover_image: "jurr.png",
  },
  {
    name: "Cretaceous Dinosaurs",
    slug: "cretaceous-dinosaurs",
    description: "cretaceous dinosaurs r cool",
    cover_image: "cret.png",
  },
];

export default bundles;
