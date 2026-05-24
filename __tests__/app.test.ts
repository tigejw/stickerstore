/// <reference types="jest" />
import request from "supertest"
import app from "../src/app"
import seed from "../db/seeds/seed"
import db from "../db/connection"

const endpointsData = require("../endpoints.json")

beforeEach(()=>{
    return seed()
})

afterAll(()=>{
    return db.end()
})

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
          expect(body.map((product: { slug: string }) => product.slug)).toEqual([
            "spinosaurus",
            "tyrannosaurus-rex",
          ]);
          expect(body.every((product: { is_new: boolean }) => product.is_new)).toBe(true);
        });
    });

    test("200: filters products by active=true", () => {
      return request(app)
        .get("/api/products?active=true")
        .expect(200)
        .then(({ body }) => {
          expect(body).toHaveLength(13);
          expect(body.every((product: { active: boolean }) => product.active)).toBe(true);
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
          expect(body.map((product: { price: number }) => product.price)).toEqual([
            829,
            849,
            869,
            879,
            889,
            899,
            899,
            899,
            899,
            919,
            929,
            949,
            999,
          ]);
        });
    });

    test("200: sorts products by price descending", () => {
      return request(app)
        .get("/api/products?sort_by=price&order=desc")
        .expect(200)
        .then(({ body }) => {
          expect(body.map((product: { price: number }) => product.price)).toEqual([
            999,
            949,
            929,
            919,
            899,
            899,
            899,
            899,
            889,
            879,
            869,
            849,
            829,
          ]);
        });
    });

    test("200: sorts products by created_at ascending", () => {
      return request(app)
        .get("/api/products?sort_by=created_at&order=asc")
        .expect(200)
        .then(({ body }) => {
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

    test("200: sorts products by created_at descending", () => {
      return request(app)
        .get("/api/products?sort_by=created_at&order=desc")
        .expect(200)
        .then(({ body }) => {
          expect(body.map((product: { slug: string }) => product.slug)).toEqual([
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
          ]);
        });
    });

    test("200: sorts products by name ascending", () => {
      return request(app)
        .get("/api/products?sort_by=name&order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.map((product: { slug: string }) => product.slug)).toEqual([
            "allosaurus",
            "ankylosaurus",
            "brachiosaurus",
            "carnotaurus",
            "diplodocus",
            "iguanodon",
            "parasaurolophus",
            "pachycephalosaurus",
            "spinosaurus",
            "stegosaurus",
            "triceratops",
            "tyrannosaurus-rex",
            "velociraptor",
          ]);
        });
    });

    test("200: sorts products by name descending", () => {
      return request(app)
        .get("/api/products?sort_by=name&order=desc")
        .expect(200)
        .then(({ body }) => {
          expect(body.map((product: { slug: string }) => product.slug)).toEqual([
            "velociraptor",
            "tyrannosaurus-rex",
            "triceratops",
            "stegosaurus",
            "spinosaurus",
            "pachycephalosaurus",
            "parasaurolophus",
            "iguanodon",
            "diplodocus",
            "carnotaurus",
            "brachiosaurus",
            "ankylosaurus",
            "allosaurus",
          ]);
        });
    });
  });
});
