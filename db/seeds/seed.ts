import format from "pg-format";
import db from "../connection";
import devData from "../data/development-data/index";
const seed = (opts: Record<string, unknown> = {}) => {
  const { products, productImages, bundles, bundleProducts, bundleImages } = devData;

  return db
    .query("DROP TABLE IF EXISTS order_products")
    .then(() => {
      return db.query("DROP TABLE IF EXISTS bundle_products");
    })
    .then(() => {
      return db.query("DROP TABLE IF EXISTS product_images");
    })
      .then(() => {
      return db.query("DROP TABLE IF EXISTS bundle_images");
    })
    .then(() => {
      return db.query("DROP TABLE IF EXISTS bundles");
    })
    .then(() => {
      return db.query("DROP TABLE IF EXISTS orders");
    })
    .then(() => {
      return db.query("DROP TABLE IF EXISTS products");
    })
    .then(() => {
      return db.query(
        `CREATE TABLE products (
          product_id SERIAL PRIMARY KEY,
          slug VARCHAR NOT NULL,
          name VARCHAR NOT NULL,
          description VARCHAR NOT NULL,
          price INT NOT NULL,
          active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT NOW(),
          size VARCHAR,
          is_new BOOLEAN DEFAULT TRUE
        );`,
      );
    })
    .then(() => {
      return db.query(
        `CREATE TABLE product_images (
          product_image_id SERIAL PRIMARY KEY,
          product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
          image_url VARCHAR NOT NULL,
          alt_text VARCHAR NOT NULL,
          is_thumbnail BOOLEAN NOT NULL DEFAULT FALSE,
          display_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        );`,
      );
    })
    .then(() => {
      return db.query(
        `CREATE UNIQUE INDEX one_thumbnail_per_product
          ON product_images (product_id)
          WHERE is_thumbnail = TRUE;`,
      );
    })
    .then(() => {
      return db.query(
        `CREATE TABLE bundles (
          bundle_id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          slug VARCHAR NOT NULL UNIQUE,
          description VARCHAR NOT NULL,
          price INT NOT NULL,
          active BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          is_new BOOLEAN DEFAULT TRUE
        );`,
      );
    })
    .then(() => {
      return db.query(
        `CREATE TABLE bundle_images (
          bundle_image_id SERIAL PRIMARY KEY,
          bundle_id INT NOT NULL REFERENCES bundles(bundle_id) ON DELETE CASCADE,
          image_url VARCHAR NOT NULL,
          alt_text VARCHAR NOT NULL,
          is_thumbnail BOOLEAN NOT NULL DEFAULT FALSE,
          display_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        );`,
      );
    })
    .then(() => {
      return db.query(
        `CREATE UNIQUE INDEX one_thumbnail_per_bundle
          ON bundle_images (bundle_id)
          WHERE is_thumbnail = TRUE;`,
      );
    })
    .then(() => {
      return db.query(
        `CREATE TABLE bundle_products (
          bundle_id INT NOT NULL REFERENCES bundles(bundle_id) ON DELETE CASCADE,
          product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
          PRIMARY KEY (bundle_id, product_id)
        );`,
      );
    })
    .then(() => {
      return db.query(`CREATE TABLE orders (
        order_id SERIAL PRIMARY KEY,
        stripe_session_id TEXT NOT NULL,
        payment_intent TEXT NOT NULL,
        currency TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        shipping_address_line1 TEXT NOT NULL,
        shipping_address_line2 TEXT,
        shipping_city TEXT NOT NULL,
        shipping_postcode TEXT NOT NULL,
        shipping_country TEXT NOT NULL,
        amount_total INT NOT NULL,
        amount_subtotal INT NOT NULL,
        payment_status TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'unknown',
        created_at TIMESTAMP DEFAULT NOW()
      );`);
    })
    .then(() => {
      return db.query(`CREATE TABLE order_products (
  order_product_id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INT REFERENCES products(product_id) ON DELETE RESTRICT,
  bundle_id INT REFERENCES bundles(bundle_id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1,
  price_at_purchase INT NOT NULL,
  CONSTRAINT exactly_one_item_type CHECK (
    (product_id IS NOT NULL AND bundle_id IS NULL) OR
    (product_id IS NULL AND bundle_id IS NOT NULL)
  )
);`);
    })
    .then(() => {
      return db.query(
        format(
          `INSERT INTO products (slug, name, description, price, active, is_new, created_at) VALUES %L`,
          products.map(
            ({ slug, name, description, price, active, isNew, createdAt }) => [
              slug,
              name,
              description,
              price,
              active,
              isNew,
              createdAt,
            ],
          ),
        ),
      );
    })
    .then(() => {
      return db.query(
        format(
          `INSERT INTO product_images (product_id, image_url, alt_text, is_thumbnail, display_order) VALUES %L`,
          productImages.map(
            ({ product_id, image_url, alt_text, is_thumbnail, display_order }) => [
              product_id,
              image_url,
              alt_text,
              is_thumbnail,
              display_order,
            ],
          ),
        ),
      );
    })
    .then(() => {
      return db.query(
        format(
          `INSERT INTO bundles (name, slug, description, price, active, is_new, created_at) VALUES %L`,
          bundles.map(({ name, slug, description, price, active, isNew, createdAt }) => [
            name,
            slug,
            description,
            price,
            active,
            isNew,
            createdAt,
          ]),
        ),
      );
    })
    .then(() => {
      return db.query(
        format(
          `INSERT INTO bundle_images (bundle_id, image_url, alt_text, is_thumbnail, display_order) VALUES %L`,
          bundleImages.map(
            ({ bundle_id, image_url, alt_text, is_thumbnail, display_order }) => [
              bundle_id,
              image_url,
              alt_text,
              is_thumbnail,
              display_order,
            ],
          ),
        ),
      );
    })
    .then(() => {
      return db.query(
        format(
          `INSERT INTO bundle_products (bundle_id, product_id) VALUES %L`,
          bundleProducts.map(({ bundle_id, product_id }) => [
            bundle_id,
            product_id,
          ]),
        ),
      );
    });
};

export default seed;
