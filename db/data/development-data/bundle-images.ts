type BundleImageSeed = {
    bundle_id: number;
    image_url: string;
    alt_text: string;
    is_thumbnail: boolean;
    display_order: number;
};

const bundleImages: BundleImageSeed[] = [
    { bundle_id: 1, image_url: "carnivore-bundle-thumb.png", alt_text: "carnivore dinosaur sticker bundle", is_thumbnail: true, display_order: 0 },
    { bundle_id: 1, image_url: "carnivore-bundle-main-1.png", alt_text: "carnivore dinosaur sticker bundle laid out", is_thumbnail: false, display_order: 1 },
    { bundle_id: 1, image_url: "carnivore-bundle-main-2.png", alt_text: "carnivore dinosaur sticker bundle close up", is_thumbnail: false, display_order: 2 },

    { bundle_id: 2, image_url: "herbivore-bundle-thumb.png", alt_text: "herbivore dinosaur sticker bundle", is_thumbnail: true, display_order: 0 },
    { bundle_id: 2, image_url: "herbivore-bundle-main-1.png", alt_text: "herbivore dinosaur sticker bundle laid out", is_thumbnail: false, display_order: 1 },
    { bundle_id: 2, image_url: "herbivore-bundle-main-2.png", alt_text: "herbivore dinosaur sticker bundle close up", is_thumbnail: false, display_order: 2 },
];

export default bundleImages;