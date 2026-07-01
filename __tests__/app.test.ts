/// <reference types="jest" />
import request from "supertest";
import app from "../src/app";
import seed from "../db/seeds/seed";
import db from "../db/connection";

const endpointsData = require("../endpoints.json");

beforeEach(() => {
  return seed();
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsData);
      });
  });
});

describe("GET /api/products", () => {
  test("200: responds with an array", () => {
    return request(app)
      .get("/api/products")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
      });
  });

  test("200: responds with all available products", () => {
    return request(app)
      .get("/api/products")
      .expect(200)
      .then(({ body }) => {
        expect(body).toHaveLength(13);
        expect(body.map((product: { slug: string }) => product.slug)).toEqual([
          "spinosaurus",
          "tyrannosaurus-rex",
          "triceratops",
          "velociraptor",
          "stegosaurus",
          "brachiosaurus",
          "ankylosaurus",
          "parasaurolophus",
          "iguanodon",
          "diplodocus",
          "allosaurus",
          "carnotaurus",
          "pachycephalosaurus",
        ]);
      });
  });

  test("200: each product includes product and image fields", () => {
    return request(app)
      .get("/api/products")
      .expect(200)
      .then(({ body }) => {
        expect(body[0]).toEqual(
          expect.objectContaining({
            product_id: 1,
            slug: "spinosaurus",
            name: "spinosaurus sticker",
            description: "a sticker of a spinosaurus",
            price: 899,
            active: true,
            size: null,
            is_new: true,
            created_at: expect.any(String),
            image: "spinosaurus-main.png",
            thumbnail: "spinosaurus-thumb.png",
            alt_text: "spinosaurus sticker front view",
          }),
        );
        expect(body[12]).toEqual(
          expect.objectContaining({
            product_id: 13,
            slug: "pachycephalosaurus",
            image: "pachycephalosaurus-main.png",
            thumbnail: "pachycephalosaurus-thumb.png",
            alt_text: "pachycephalosaurus sticker dome head",
          }),
        );
      });
  });

  describe("query parameters", () => {
    test("200: filters products by is_new=true", () => {
      return request(app)
        .get("/api/products?is_new=true")
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveLength(2);
          expect(body.map((product: { slug: string }) => product.slug)).toEqual(
            ["spinosaurus", "tyrannosaurus-rex"],
          );
          expect(
            body.every((product: { is_new: boolean }) => product.is_new),
          ).toBe(true);
        });
    });

    test("200: filters products by active=true", () => {
      return request(app)
        .get("/api/products?active=true")
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveLength(13);
          expect(
            body.every((product: { active: boolean }) => product.active),
          ).toBe(true);
        });
    });

    test("200: filters products by active=false", () => {
      return request(app)
        .get("/api/products?active=false")
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual([]);
        });
    });

    test("200: sorts products by price ascending", () => {
      return request(app)
        .get("/api/products?sort_by=price&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(
            body.map((product: { price: number }) => product.price),
          ).toEqual([
            829, 849, 869, 879, 889, 899, 899, 899, 899, 919, 929, 949, 999,
          ]);
        });
    });

    test("200: sorts products by price descending", () => {
      return request(app)
        .get("/api/products?sort_by=price&order=desc")
        .expect(200)
        .then(({ body }) => {
          expect(
            body.map((product: { price: number }) => product.price),
          ).toEqual([
            999, 949, 929, 919, 899, 899, 899, 899, 889, 879, 869, 849, 829,
          ]);
        });
    });

    test("200: sorts products by created_at ascending", () => {
      return request(app)
        .get("/api/products?sort_by=created_at&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.map((product: { slug: string }) => product.slug)).toEqual(
            [
              "spinosaurus",
              "tyrannosaurus-rex",
              "triceratops",
              "velociraptor",
              "stegosaurus",
              "brachiosaurus",
              "ankylosaurus",
              "parasaurolophus",
              "iguanodon",
              "diplodocus",
              "allosaurus",
              "carnotaurus",
              "pachycephalosaurus",
            ],
          );
        });
    });

    test("200: sorts products by created_at descending", () => {
      return request(app)
        .get("/api/products?sort_by=created_at&order=desc")
        .expect(200)
        .then(({ body }) => {
          expect(body.map((product: { slug: string }) => product.slug)).toEqual(
            [
              "pachycephalosaurus",
              "carnotaurus",
              "allosaurus",
              "diplodocus",
              "iguanodon",
              "parasaurolophus",
              "ankylosaurus",
              "brachiosaurus",
              "stegosaurus",
              "velociraptor",
              "triceratops",
              "tyrannosaurus-rex",
              "spinosaurus",
            ],
          );
        });
    });

    test("200: sorts products by name ascending", () => {
      return request(app)
        .get("/api/products?sort_by=name&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.map((product: { slug: string }) => product.slug)).toEqual(
            [
              "allosaurus",
              "ankylosaurus",
              "brachiosaurus",
              "carnotaurus",
              "diplodocus",
              "iguanodon",
              "pachycephalosaurus",
              "parasaurolophus",
              "spinosaurus",
              "stegosaurus",
              "triceratops",
              "tyrannosaurus-rex",
              "velociraptor",
            ],
          );
        });
    });

    test("200: sorts products by name descending", () => {
      return request(app)
        .get("/api/products?sort_by=name&order=desc")
        .expect(200)
        .then(({ body }) => {
          expect(body.map((product: { slug: string }) => product.slug)).toEqual(
            [
              "velociraptor",
              "tyrannosaurus-rex",
              "triceratops",
              "stegosaurus",
              "spinosaurus",
              "parasaurolophus",
              "pachycephalosaurus",
              "iguanodon",
              "diplodocus",
              "carnotaurus",
              "brachiosaurus",
              "ankylosaurus",
              "allosaurus",
            ],
          );
        });
    });
  });
});

describe("GET /api/products/:slug", () => {
  test("200: responds with a single product matching the slug", () => {
    return request(app)
      .get("/api/products/spinosaurus")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            product: {
              product_id: 1,
              slug: "spinosaurus",
              name: "spinosaurus sticker",
              description: "a sticker of a spinosaurus",
              price: 899,
              active: true,
              size: null,
              is_new: true,
              created_at: "2023-12-31T23:00:00.000Z",
              image: "spinosaurus-main.png",
              thumbnail: "spinosaurus-thumb.png",
              alt_text: "spinosaurus sticker front view",
            },
          }),
        );
      });
  });

  test("404: responds with not found when the slug does not exist", () => {
    return request(app)
      .get("/api/products/not-a-real-slug")
      .expect(404)
      .then(({ body }) => {
        expect(body.error).toBe("Not found!");
      });
  });
});

describe("GET /api/bundles", () => {
  test("200: responds with an array", () => {
    return request(app)
      .get("/api/bundles")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
      });
  });

  test("200: responds with all available bundles", () => {
    return request(app)
      .get("/api/bundles")
      .expect(200)
      .then(({ body }) => {
        expect(body).toHaveLength(2);
        expect(body.map((bundle: { slug: string }) => bundle.slug)).toEqual([
          "jurassic-dinosaurs",
          "cretaceous-dinosaurs",
        ]);
      });
  });

  test("200: each bundle includes bundle and lifecycle fields", () => {
    return request(app)
      .get("/api/bundles")
      .expect(200)
      .then(({ body }) => {
        expect(body[0]).toEqual(
          expect.objectContaining({
            bundle_id: 1,
            slug: "jurassic-dinosaurs",
            name: "Jurrasic Dinosaurs",
            description: "jurrasic dinosaurs r cool.",
            cover_image: "jurr.png",
            price: 3299,
            active: true,
            is_new: true,
            created_at: expect.any(String),
          }),
        );
        expect(body[1]).toEqual(
          expect.objectContaining({
            bundle_id: 2,
            slug: "cretaceous-dinosaurs",
            name: "Cretaceous Dinosaurs",
            description: "cretaceous dinosaurs r cool",
            cover_image: "cret.png",
            price: 3099,
            active: true,
            is_new: false,
            created_at: expect.any(String),
          }),
        );
      });
  });

  describe("query parameters", () => {
    test("200: filters bundles by is_new=true", () => {
      return request(app)
        .get("/api/bundles?is_new=true")
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveLength(1);
          expect(body.map((bundle: { slug: string }) => bundle.slug)).toEqual([
            "jurassic-dinosaurs",
          ]);
          expect(
            body.every((bundle: { is_new: boolean }) => bundle.is_new),
          ).toBe(true);
        });
    });

    test("200: filters bundles by is_new=false", () => {
      return request(app)
        .get("/api/bundles?is_new=false")
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveLength(1);
          expect(body.map((bundle: { slug: string }) => bundle.slug)).toEqual([
            "cretaceous-dinosaurs",
          ]);
          expect(
            body.every(
              (bundle: { is_new: boolean }) => bundle.is_new === false,
            ),
          ).toBe(true);
        });
    });

    test("200: filters bundles by active=true", () => {
      return request(app)
        .get("/api/bundles?active=true")
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveLength(2);
          expect(
            body.every((bundle: { active: boolean }) => bundle.active),
          ).toBe(true);
        });
    });

    test("200: filters bundles by active=false", () => {
      return request(app)
        .get("/api/bundles?active=false")
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual([]);
        });
    });

    test("200: sorts bundles by created_at ascending", () => {
      return request(app)
        .get("/api/bundles?sort_by=created_at&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.map((bundle: { slug: string }) => bundle.slug)).toEqual([
            "jurassic-dinosaurs",
            "cretaceous-dinosaurs",
          ]);
        });
    });

    test("200: sorts bundles by created_at descending", () => {
      return request(app)
        .get("/api/bundles?sort_by=created_at&order=desc")
        .expect(200)
        .then(({ body }) => {
          expect(body.map((bundle: { slug: string }) => bundle.slug)).toEqual([
            "cretaceous-dinosaurs",
            "jurassic-dinosaurs",
          ]);
        });
    });

    test("200: sorts bundles by name ascending", () => {
      return request(app)
        .get("/api/bundles?sort_by=name&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.map((bundle: { slug: string }) => bundle.slug)).toEqual([
            "cretaceous-dinosaurs",
            "jurassic-dinosaurs",
          ]);
        });
    });

    test("200: sorts bundles by name descending", () => {
      return request(app)
        .get("/api/bundles?sort_by=name&order=desc")
        .expect(200)
        .then(({ body }) => {
          expect(body.map((bundle: { slug: string }) => bundle.slug)).toEqual([
            "jurassic-dinosaurs",
            "cretaceous-dinosaurs",
          ]);
        });
    });
<<<<<<< HEAD

     test("200: sorts bundles by price asc", () => {
      return request(app)
        .get("/api/bundles?sort_by=price&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.map((bundle: { slug: string }) => bundle.slug)).toEqual([
            "cretaceous-dinosaurs",
            "jurassic-dinosaurs",
          ]);
        });
    });
       test("200: sorts bundles by price desc", () => {
      return request(app)
        .get("/api/bundles?sort_by=price&order=desc")
        .expect(200)
        .then(({ body }) => {
          expect(body.map((bundle: { slug: string }) => bundle.slug)).toEqual([
            "jurassic-dinosaurs",
            "cretaceous-dinosaurs",
          ]);
        });
    });
=======
>>>>>>> 7c87b939ceb243107ba8e0770b86372745c483bc
  });
});

describe("GET /api/bundles/:slug", () => {
  test("200: responds with a single bundle matching the slug", () => {
    return request(app)
      .get("/api/bundles/jurassic-dinosaurs")
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject({
          bundle: {
            bundle_id: 1,
            slug: "jurassic-dinosaurs",
            name: "Jurrasic Dinosaurs",
            description: "jurrasic dinosaurs r cool.",
            cover_image: "jurr.png",
            price: 3299,
            active: true,
            is_new: true,
            created_at: expect.any(String),
            products: [
              {
                product_id: 2,
                slug: "tyrannosaurus-rex",
                name: "tyrannosaurus rex sticker",
                price: 999,
                active: true,
                is_new: true,
                image: "tyrannosaurus-rex-main.png",
                thumbnail: "tyrannosaurus-rex-thumb.png",
                alt_text: "tyrannosaurus rex sticker roaring",
              },
              {
                product_id: 4,
                slug: "velociraptor",
                name: "velociraptor sticker",
                price: 849,
                active: true,
                is_new: false,
                image: "velociraptor-main.png",
                thumbnail: "velociraptor-thumb.png",
                alt_text: "velociraptor sticker running",
              },
              {
                product_id: 11,
                slug: "allosaurus",
                name: "allosaurus sticker",
                price: 919,
                active: true,
                is_new: false,
                image: "allosaurus-main.png",
                thumbnail: "allosaurus-thumb.png",
                alt_text: "allosaurus sticker open mouth",
              },
              {
                product_id: 12,
                slug: "carnotaurus",
                name: "carnotaurus sticker",
                price: 889,
                active: true,
                is_new: false,
                image: "carnotaurus-main.png",
                thumbnail: "carnotaurus-thumb.png",
                alt_text: "carnotaurus sticker horned face",
              },
            ],
          },
        });
      });
  });

  test("404: responds with not found when the slug does not exist", () => {
    return request(app)
      .get("/api/bundles/not-a-real-slug")
      .expect(404)
      .then(({ body }) => {
        expect(body.error).toBe("Not found!");
      });
  });
});

describe("POST /api/create-webhook-session", () => {
  test("200: responds with checkout items and line items", () => {
    return request(app)
      .post("/api/create-webhook-session")
      .send({
        items: [
          {
            type: "product",
            id: "1",
            quantity: 2,
          },
          {
            type: "bundle",
            id: "1",
            quantity: 1,
          },
        ],
      })
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(
          expect.objectContaining({
            items: expect.any(Array),
            line_items: expect.any(Array),
          }),
        );

        expect(body.line_items).toEqual([
          {
            price_data: {
              currency: "eur",
              product_data: {
                image: "spinosaurus-thumb.png",
                name: "spinosaurus sticker",
              },
              unit_amount: 899,
            },
            quantity: 2
          },
          {
            price_data: {
              currency: "eur",
              product_data: {
                image: "jurr.png",
                name: "Jurrasic Dinosaurs",
              },
              unit_amount: 3299,
            },
            quantity: 1
          },
        ]);
      });
  });

  test("400: rejects requests that do not include an items array", () => {
    return request(app)
      .post("/api/create-webhook-session")
      .send({ checkout: [] })
      .expect(400)
      .then(({ body }) => {
        expect(body.error).toBe("Invalid request!");
      });
  });
});
