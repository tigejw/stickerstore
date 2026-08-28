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
                price: 999,
                active: true,
                is_new: true,
                thumbnail_url: "tyrannosaurus-rex-thumb.png",
                thumbnail_alt_text: "tyrannosaurus rex sticker roaring",
              },
              {
                product_id: 4,
                slug: "velociraptor",
                name: "velociraptor sticker",
                price: 849,
                active: true,
                is_new: false,
                thumbnail_url: "velociraptor-thumb.png",
                thumbnail_alt_text: "velociraptor sticker running",
              },
              {
                product_id: 11,
                slug: "allosaurus",
                name: "allosaurus sticker",
                price: 919,
                active: true,
                is_new: false,
                thumbnail_url: "allosaurus-thumb.png",
                thumbnail_alt_text: "allosaurus sticker open mouth",
              },
              {
                product_id: 12,
                slug: "carnotaurus",
                name: "carnotaurus sticker",
                price: 889,
                active: true,
                is_new: false,
                thumbnail_url: "carnotaurus-thumb.png",
                thumbnail_alt_text: "carnotaurus sticker horned face",
              },],
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