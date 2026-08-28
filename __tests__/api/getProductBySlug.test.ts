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
              thumbnail_url: "spinosaurus-thumb.png",
              thumbnail_alt_text: "spinosaurus sticker front view",
              images: [
                {
                  image_url: "spinosaurus-thumb.png",
                  alt_text: "spinosaurus sticker front view",
                  is_thumbnail: true,
                  display_order: 0,
                },
                {
                  image_url: "spinosaurus-main.png",
                  alt_text: "spinosaurus sticker front view",
                  is_thumbnail: false,
                  display_order: 1,
                },
              ],
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