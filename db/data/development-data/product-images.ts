type ProductImageSeed = {
  product_id: number;
  image_url: string;
  alt_text: string;
  is_thumbnail: boolean;
  display_order: number;
};

const productImages: ProductImageSeed[] = [
  { product_id: 1, image_url: "spinosaurus-thumb.png", alt_text: "spinosaurus sticker front view", is_thumbnail: true, display_order: 0 },
  { product_id: 1, image_url: "spinosaurus-main.png", alt_text: "spinosaurus sticker front view", is_thumbnail: false, display_order: 1 },

  { product_id: 2, image_url: "tyrannosaurus-rex-thumb.png", alt_text: "tyrannosaurus rex sticker roaring", is_thumbnail: true, display_order: 0 },
  { product_id: 2, image_url: "tyrannosaurus-rex-main.png", alt_text: "tyrannosaurus rex sticker roaring", is_thumbnail: false, display_order: 1 },

  { product_id: 3, image_url: "triceratops-thumb.png", alt_text: "triceratops sticker side profile", is_thumbnail: true, display_order: 0 },
  { product_id: 3, image_url: "triceratops-main.png", alt_text: "triceratops sticker side profile", is_thumbnail: false, display_order: 1 },

  { product_id: 4, image_url: "velociraptor-thumb.png", alt_text: "velociraptor sticker running", is_thumbnail: true, display_order: 0 },
  { product_id: 4, image_url: "velociraptor-main.png", alt_text: "velociraptor sticker running", is_thumbnail: false, display_order: 1 },

  { product_id: 5, image_url: "stegosaurus-thumb.png", alt_text: "stegosaurus sticker with plates", is_thumbnail: true, display_order: 0 },
  { product_id: 5, image_url: "stegosaurus-main.png", alt_text: "stegosaurus sticker with plates", is_thumbnail: false, display_order: 1 },

  { product_id: 6, image_url: "brachiosaurus-thumb.png", alt_text: "brachiosaurus sticker long neck", is_thumbnail: true, display_order: 0 },
  { product_id: 6, image_url: "brachiosaurus-main.png", alt_text: "brachiosaurus sticker long neck", is_thumbnail: false, display_order: 1 },

  { product_id: 7, image_url: "ankylosaurus-thumb.png", alt_text: "ankylosaurus sticker with tail club", is_thumbnail: true, display_order: 0 },
  { product_id: 7, image_url: "ankylosaurus-main.png", alt_text: "ankylosaurus sticker with tail club", is_thumbnail: false, display_order: 1 },

  { product_id: 8, image_url: "parasaurolophus-thumb.png", alt_text: "parasaurolophus sticker crest detail", is_thumbnail: true, display_order: 0 },
  { product_id: 8, image_url: "parasaurolophus-main.png", alt_text: "parasaurolophus sticker crest detail", is_thumbnail: false, display_order: 1 },

  { product_id: 9, image_url: "iguanodon-thumb.png", alt_text: "iguanodon sticker standing pose", is_thumbnail: true, display_order: 0 },
  { product_id: 9, image_url: "iguanodon-main.png", alt_text: "iguanodon sticker standing pose", is_thumbnail: false, display_order: 1 },

  { product_id: 10, image_url: "diplodocus-thumb.png", alt_text: "diplodocus sticker long tail", is_thumbnail: true, display_order: 0 },
  { product_id: 10, image_url: "diplodocus-main.png", alt_text: "diplodocus sticker long tail", is_thumbnail: false, display_order: 1 },

  { product_id: 11, image_url: "allosaurus-thumb.png", alt_text: "allosaurus sticker open mouth", is_thumbnail: true, display_order: 0 },
  { product_id: 11, image_url: "allosaurus-main.png", alt_text: "allosaurus sticker open mouth", is_thumbnail: false, display_order: 1 },

  { product_id: 12, image_url: "carnotaurus-thumb.png", alt_text: "carnotaurus sticker horned face", is_thumbnail: true, display_order: 0 },
  { product_id: 12, image_url: "carnotaurus-main.png", alt_text: "carnotaurus sticker horned face", is_thumbnail: false, display_order: 1 },

  { product_id: 13, image_url: "pachycephalosaurus-thumb.png", alt_text: "pachycephalosaurus sticker dome head", is_thumbnail: true, display_order: 0 },
  { product_id: 13, image_url: "pachycephalosaurus-main.png", alt_text: "pachycephalosaurus sticker dome head", is_thumbnail: false, display_order: 1 },
];

export default productImages;
