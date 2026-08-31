import request from "supertest";
const app = require("../../src/app");
import seed from "../../db/seeds/seed";
import db from "../../db/connection";

beforeEach(() => {
  return seed();
});

afterAll(() => {
  return db.end();
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

  test("200: each bundle includes bundle fields, a flat thumbnail, and a sorted images array", () => {
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
            price: 3299,
            active: true,
            is_new: true,
            created_at: expect.any(String),
            thumbnail_url: "jurassic-bundle-thumb.png",
            thumbnail_alt_text: "jurassic dinosaur sticker bundle",
            images: [
              {
                image_url: "jurassic-bundle-thumb.png",
                alt_text: "jurassic dinosaur sticker bundle",
                is_thumbnail: true,
                display_order: 0,
              },
              {
                image_url: "jurassic-bundle-main-1.png",
                alt_text: "jurassic dinosaur sticker bundle laid out",
                is_thumbnail: false,
                display_order: 1,
              },
              {
                image_url: "jurassic-bundle-main-2.png",
                alt_text: "jurassic dinosaur sticker bundle close up",
                is_thumbnail: false,
                display_order: 2,
              },
            ],
            products: [
              {
                product_id: 2,
                slug: "tyrannosaurus-rex",
                name: "tyrannosaurus rex sticker",
                description: "a sticker of a tyrannosaurus rex",
                price: 999,
                size: null,
                active: true,
                created_at: expect.any(String),
                is_new: true,
                thumbnail_url: "tyrannosaurus-rex-thumb.png",
                thumbnail_alt_text: "tyrannosaurus rex sticker roaring",
              },
              {
                product_id: 4,
                slug: "velociraptor",
                name: "velociraptor sticker",
                description: "a sticker of a velociraptor",
                price: 849,
                size: null,
                active: true,
                created_at: expect.any(String),
                is_new: false,
                thumbnail_url: "velociraptor-thumb.png",
                thumbnail_alt_text: "velociraptor sticker running",
              },
              {
                product_id: 11,
                slug: "allosaurus",
                name: "allosaurus sticker",
                description: "a sticker of an allosaurus",
                price: 919,
                size: null,
                active: true,
                created_at: expect.any(String),
                is_new: false,
                thumbnail_url: "allosaurus-thumb.png",
                thumbnail_alt_text: "allosaurus sticker open mouth",
              },
              {
                product_id: 12,
                slug: "carnotaurus",
                name: "carnotaurus sticker",
                description: "a sticker of a carnotaurus",
                price: 889,
                size: null,
                active: true,
                created_at: expect.any(String),
                is_new: false,
                thumbnail_url: "carnotaurus-thumb.png",
                thumbnail_alt_text: "carnotaurus sticker horned face",
              },
            ],
          }),
        );

        expect(body[1]).toEqual(
          expect.objectContaining({
            bundle_id: 2,
            slug: "cretaceous-dinosaurs",
            name: "Cretaceous Dinosaurs",
            description: "cretaceous dinosaurs r cool",
            price: 3099,
            active: false,
            is_new: false,
            created_at: expect.any(String),
            thumbnail_url: "cretaceous-bundle-thumb.png",
            thumbnail_alt_text: "cretaceous dinosaur sticker bundle",
            images: [
              {
                image_url: "cretaceous-bundle-thumb.png",
                alt_text: "cretaceous dinosaur sticker bundle",
                is_thumbnail: true,
                display_order: 0,
              },
              {
                image_url: "cretaceous-bundle-main-1.png",
                alt_text: "cretaceous dinosaur sticker bundle laid out",
                is_thumbnail: false,
                display_order: 1,
              },
            ],
            products: [
              {
                product_id: 1,
                slug: "spinosaurus",
                name: "spinosaurus sticker",
                description: "a sticker of a spinosaurus",
                price: 899,
                size: null,
                active: true,
                created_at: expect.any(String),
                is_new: true,
                thumbnail_url: "spinosaurus-thumb.png",
                thumbnail_alt_text: "spinosaurus sticker front view",
              },
              {
                product_id: 3,
                slug: "triceratops",
                name: "triceratops sticker",
                description: "a sticker of a triceratops",
                price: 899,
                size: null,
                active: false,
                created_at: expect.any(String),
                is_new: false,
                thumbnail_url: "triceratops-thumb.png",
                thumbnail_alt_text: "triceratops sticker side profile",
              },
              {
                product_id: 8,
                slug: "parasaurolophus",
                name: "parasaurolophus sticker",
                description: "a sticker of a parasaurolophus",
                price: 899,
                size: null,
                active: true,
                created_at: expect.any(String),
                is_new: false,
                thumbnail_url: "parasaurolophus-thumb.png",
                thumbnail_alt_text: "parasaurolophus sticker crest detail",
              },
              {
                product_id: 9,
                slug: "iguanodon",
                name: "iguanodon sticker",
                description: "a sticker of an iguanodon",
                price: 829,
                size: null,
                active: true,
                created_at: expect.any(String),
                is_new: false,
                thumbnail_url: "iguanodon-thumb.png",
                thumbnail_alt_text: "iguanodon sticker standing pose",
              },
            ],
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
          expect(body).toHaveLength(1);
          expect(body.map((bundle: { slug: string }) => bundle.slug)).toEqual([
            "jurassic-dinosaurs",
          ]);
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
             expect(body).toHaveLength(1);
          expect(body.map((bundle: { slug: string }) => bundle.slug)).toEqual([
            "cretaceous-dinosaurs",
          ]);
          expect(
            body.every((bundle: { active: boolean }) => bundle.active === false),
          ).toBe(true);
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
  });
});