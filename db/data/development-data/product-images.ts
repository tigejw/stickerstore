type ProductImageSeed = {
  product_id: number;
  image: string;
  thumbnail: string;
  alt_text: string;
};

const productImages: ProductImageSeed[] = [
  {
    product_id: 1,
    image: "spinosaurus-main.png",
    thumbnail: "spinosaurus-thumb.png",
    alt_text: "spinosaurus sticker front view",
  },
  {
    product_id: 2,
    image: "tyrannosaurus-rex-main.png",
    thumbnail: "tyrannosaurus-rex-thumb.png",
    alt_text: "tyrannosaurus rex sticker roaring",
  },
  {
    product_id: 3,
    image: "triceratops-main.png",
    thumbnail: "triceratops-thumb.png",
    alt_text: "triceratops sticker side profile",
  },
  {
    product_id: 4,
    image: "velociraptor-main.png",
    thumbnail: "velociraptor-thumb.png",
    alt_text: "velociraptor sticker running",
  },
  {
    product_id: 5,
    image: "stegosaurus-main.png",
    thumbnail: "stegosaurus-thumb.png",
    alt_text: "stegosaurus sticker with plates",
  },
  {
    product_id: 6,
    image: "brachiosaurus-main.png",
    thumbnail: "brachiosaurus-thumb.png",
    alt_text: "brachiosaurus sticker long neck",
  },
  {
    product_id: 7,
    image: "ankylosaurus-main.png",
    thumbnail: "ankylosaurus-thumb.png",
    alt_text: "ankylosaurus sticker with tail club",
  },
  {
    product_id: 8,
    image: "parasaurolophus-main.png",
    thumbnail: "parasaurolophus-thumb.png",
    alt_text: "parasaurolophus sticker crest detail",
  },
  {
    product_id: 9,
    image: "iguanodon-main.png",
    thumbnail: "iguanodon-thumb.png",
    alt_text: "iguanodon sticker standing pose",
  },
  {
    product_id: 10,
    image: "diplodocus-main.png",
    thumbnail: "diplodocus-thumb.png",
    alt_text: "diplodocus sticker long tail",
  },
  {
    product_id: 11,
    image: "allosaurus-main.png",
    thumbnail: "allosaurus-thumb.png",
    alt_text: "allosaurus sticker open mouth",
  },
  {
    product_id: 12,
    image: "carnotaurus-main.png",
    thumbnail: "carnotaurus-thumb.png",
    alt_text: "carnotaurus sticker horned face",
  },
  {
    product_id: 13,
    image: "pachycephalosaurus-main.png",
    thumbnail: "pachycephalosaurus-thumb.png",
    alt_text: "pachycephalosaurus sticker dome head",
  },
];

export default productImages;
