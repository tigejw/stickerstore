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
                images: ["spinosaurus-thumb.png"],
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
                images: ["jurassic-bundle-thumb.png"],
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

  test("400: rejects requests containing an inactive product", () => {
  return request(app)
    .post("/api/create-webhook-session")
    .send({
      items: [
        {
          type: "product",
          id: "3", 
          // must correspond to a product seeded with active: false
          quantity: 1,
        },
      ],
    })
    .expect(400)
    .then(({ body }) => {
      expect(body.error).toBe("One or more items are unavailable");
    });
});

test("400: rejects requests containing an inactive bundle", () => {
  return request(app)
    .post("/api/create-webhook-session")
    .send({
      items: [
        {
          type: "bundle",
          id: "2", 
          // must correspond to a bundle seeded with active: false
          quantity: 1,
        },
      ],
    })
    .expect(400)
    .then(({ body }) => {
      expect(body.error).toBe("One or more items are unavailable");
    });
});
});