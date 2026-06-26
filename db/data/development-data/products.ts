type ProductSeed = {
  slug: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  isNew: boolean;
  createdAt: string;
};

const products: ProductSeed[] = [
  {
    slug: "spinosaurus",
    name: "spinosaurus sticker",
    description: "a sticker of a spinosaurus",
    price: 899,
    active: true,
    isNew: true,
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    slug: "tyrannosaurus-rex",
    name: "tyrannosaurus rex sticker",
    description: "a sticker of a tyrannosaurus rex",
    price: 999,
    active: true,
    isNew: true,
    createdAt: "2024-01-02T00:00:00.000Z",
  },
  {
    slug: "triceratops",
    name: "triceratops sticker",
    description: "a sticker of a triceratops",
    price: 899,
    active: true,
    isNew: false,
    createdAt: "2024-01-03T00:00:00.000Z",
  },
  {
    slug: "velociraptor",
    name: "velociraptor sticker",
    description: "a sticker of a velociraptor",
    price: 849,
    active: true,
    isNew: false,
    createdAt: "2024-01-04T00:00:00.000Z",
  },
  {
    slug: "stegosaurus",
    name: "stegosaurus sticker",
    description: "a sticker of a stegosaurus",
    price: 899,
    active: true,
    isNew: false,
    createdAt: "2024-01-05T00:00:00.000Z",
  },
  {
    slug: "brachiosaurus",
    name: "brachiosaurus sticker",
    description: "a sticker of a brachiosaurus",
    price: 949,
    active: true,
    isNew: false,
    createdAt: "2024-01-06T00:00:00.000Z",
  },
  {
    slug: "ankylosaurus",
    name: "ankylosaurus sticker",
    description: "a sticker of an ankylosaurus",
    price: 879,
    active: true,
    isNew: false,
    createdAt: "2024-01-07T00:00:00.000Z",
  },
  {
    slug: "parasaurolophus",
    name: "parasaurolophus sticker",
    description: "a sticker of a parasaurolophus",
    price: 899,
    active: true,
    isNew: false,
    createdAt: "2024-01-08T00:00:00.000Z",
  },
  {
    slug: "iguanodon",
    name: "iguanodon sticker",
    description: "a sticker of an iguanodon",
    price: 829,
    active: true,
    isNew: false,
    createdAt: "2024-01-09T00:00:00.000Z",
  },
  {
    slug: "diplodocus",
    name: "diplodocus sticker",
    description: "a sticker of a diplodocus",
    price: 929,
    active: true,
    isNew: false,
    createdAt: "2024-01-10T00:00:00.000Z",
  },
  {
    slug: "allosaurus",
    name: "allosaurus sticker",
    description: "a sticker of an allosaurus",
    price: 919,
    active: true,
    isNew: false,
    createdAt: "2024-01-11T00:00:00.000Z",
  },
  {
    slug: "carnotaurus",
    name: "carnotaurus sticker",
    description: "a sticker of a carnotaurus",
    price: 889,
    active: true,
    isNew: false,
    createdAt: "2024-01-12T00:00:00.000Z",
  },
  {
    slug: "pachycephalosaurus",
    name: "pachycephalosaurus sticker",
    description: "a sticker of a pachycephalosaurus",
    price: 869,
    active: true,
    isNew: false,
    createdAt: "2024-01-13T00:00:00.000Z",
  },
];

export default products;
