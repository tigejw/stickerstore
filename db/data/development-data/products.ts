type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  isNew: boolean;
};

const products: ProductSeed[] = [
  {
    slug: "spinosaurus",
    name: "spinosaurus sticker",
    description: "a sticker of a spinosaurus",
    price: 899,
    active: true,
    isNew: true,
  },
  {
    slug: "tyrannosaurus-rex",
    name: "tyrannosaurus rex sticker",
    description: "a sticker of a tyrannosaurus rex",
    price: 999,
    active: true,
    isNew: true,
  },
  {
    slug: "triceratops",
    name: "triceratops sticker",
    description: "a sticker of a triceratops",
    price: 899,
    active: true,
    isNew: false,
  },
  {
    slug: "velociraptor",
    name: "velociraptor sticker",
    description: "a sticker of a velociraptor",
    price: 849,
    active: true,
    isNew: false,
  },
  {
    slug: "stegosaurus",
    name: "stegosaurus sticker",
    description: "a sticker of a stegosaurus",
    price: 899,
    active: true,
    isNew: false,
  },
  {
    slug: "brachiosaurus",
    name: "brachiosaurus sticker",
    description: "a sticker of a brachiosaurus",
    price: 949,
    active: true,
    isNew: false,
  },
  {
    slug: "ankylosaurus",
    name: "ankylosaurus sticker",
    description: "a sticker of an ankylosaurus",
    price: 879,
    active: true,
    isNew: false,
  },
  {
    slug: "parasaurolophus",
    name: "parasaurolophus sticker",
    description: "a sticker of a parasaurolophus",
    price: 899,
    active: true,
    isNew: false,
  },
  {
    slug: "iguanodon",
    name: "iguanodon sticker",
    description: "a sticker of an iguanodon",
    price: 829,
    active: true,
    isNew: false,
  },
  {
    slug: "diplodocus",
    name: "diplodocus sticker",
    description: "a sticker of a diplodocus",
    price: 929,
    active: true,
    isNew: false,
  },
  {
    slug: "allosaurus",
    name: "allosaurus sticker",
    description: "a sticker of an allosaurus",
    price: 919,
    active: true,
    isNew: false,
  },
  {
    slug: "carnotaurus",
    name: "carnotaurus sticker",
    description: "a sticker of a carnotaurus",
    price: 889,
    active: true,
    isNew: false,
  },
  {
    slug: "pachycephalosaurus",
    name: "pachycephalosaurus sticker",
    description: "a sticker of a pachycephalosaurus",
    price: 869,
    active: true,
    isNew: false,
  },
];

export default products;
