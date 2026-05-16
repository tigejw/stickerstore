import format from "pg-format";
import db from "../connection";
import devData from "../data/development-data/index";
const seed = ({}) => {
  const { products, productImages, bundles, bundleProducts } = devData;

  return db
    .query("DROP TABLE IF EXISTS order_products")
    .then(() => {
      return db.query("DROP TABLE IF EXISTS bundle_products");
    })
    .then(() => {
      return db.query("DROP TABLE IF EXISTS product_images");
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
          active BOOLEAN DEFAULT FALSE,
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
          image VARCHAR NOT NULL,
          thumbnail VARCHAR NOT NULL,
          alt_text VARCHAR NOT NULL
        );`,
      );
    })
    .then(() => {
      return db.query(
        `CREATE TABLE bundles (
          bundle_id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          slug VARCHAR NOT NULL UNIQUE,
          description VARCHAR NOT NULL,
          cover_image VARCHAR NOT NULL
        );`,
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
        customer_email TEXT NOT NULL,
        shipping_address_line1 TEXT NOT NULL,
        shipping_address_line2 TEXT,
        shipping_city TEXT NOT NULL,
        shipping_postcode TEXT NOT NULL,
        shipping_country TEXT NOT NULL,
        total_price INT NOT NULL,
        status TEXT NOT NULL DEFAULT 'paid',
        created_at TIMESTAMP DEFAULT NOW()
      );`);
    })
    .then(() => {
      return db.query(`CREATE TABLE order_products (
        order_product_id SERIAL PRIMARY KEY,
        order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
        product_id INT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
        quantity INT NOT NULL DEFAULT 1,
        price_at_purchase INT NOT NULL
      );`);
    })
    .then(() => {
      return db.query(
        format(
          `INSERT INTO products (slug, name, description, price, active, is_new) VALUES %L`,
          products.map(({ slug, name, description, price, active, isNew }) => [
            slug,
            name,
            description,
            price,
            active,
            isNew,
          ]),
        ),
      );
    })
    .then(() => {
      return db.query(
        format(
          `INSERT INTO product_images (product_id, image, thumbnail, alt_text) VALUES %L`,
          productImages.map(({ product_id, image, thumbnail, alt_text }) => [
            product_id,
            image,
            thumbnail,
            alt_text,
          ]),
        ),
      );
    })
    .then(() => {
      return db.query(
        format(
          `INSERT INTO bundles (name, slug, description, cover_image) VALUES %L`,
          bundles.map(({ name, slug, description, cover_image }) => [
            name,
            slug,
            description,
            cover_image,
          ]),
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
