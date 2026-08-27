type BundleImageSeed = {
    bundle_id: number;
    image_url: string;
    alt_text: string;
    is_thumbnail: boolean;
    display_order: number;
};

const bundleImages: BundleImageSeed[] = [
  { bundle_id: 1, image_url: "jurassic-bundle-thumb.png", alt_text: "jurassic dinosaur sticker bundle", is_thumbnail: true, display_order: 0 },
  { bundle_id: 1, image_url: "jurassic-bundle-main-1.png", alt_text: "jurassic dinosaur sticker bundle laid out", is_thumbnail: false, display_order: 1 },
   { bundle_id: 1, image_url: "jurassic-bundle-main-2.png", alt_text: "jurassic dinosaur sticker bundle close up", is_thumbnail: false, display_order: 2 },

  { bundle_id: 2, image_url: "cretaceous-bundle-thumb.png", alt_text: "cretaceous dinosaur sticker bundle", is_thumbnail: true, display_order: 0 },
  { bundle_id: 2, image_url: "cretaceous-bundle-main-1.png", alt_text: "cretaceous dinosaur sticker bundle laid out", is_thumbnail: false, display_order: 1 },
];
export default bundleImages;