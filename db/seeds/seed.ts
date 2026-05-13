import format from "pg-format";
import db from "../connection";
import devData from "../data/development-data/index";
const seed = ({}) => {
  const { stickers, stickerImages, bundles, bundleStickers } = devData;
  return db
    .query("DROP TABLE IF EXISTS bundle_stickers")
    .then(() => {
      return db.query("DROP TABLE IF EXISTS sticker_images");
    })
    .then(() => {
      return db.query("DROP TABLE IF EXISTS bundles");
    })
    .then(() => {
      return db.query("DROP TABLE IF EXISTS stickers");
    })
    .then(() => {
      return db.query(
        `CREATE TABLE stickers (
          sticker_id SERIAL PRIMARY KEY,
          slug VARCHAR NOT NULL,
          name VARCHAR NOT NULL,
          description VARCHAR NOT NULL,
          price INT NOT NULL,
          active BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          size VARCHAR,
          new BOOLEAN DEFAULT TRUE
        );`,
      );
    })
    .then(() => {
      return db.query(
        `CREATE TABLE sticker_images (
          sticker_image_id SERIAL PRIMARY KEY,
          sticker_id INT NOT NULL REFERENCES stickers(sticker_id) ON DELETE CASCADE,
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
        `CREATE TABLE bundle_stickers (
          bundle_id INT NOT NULL REFERENCES bundles(bundle_id) ON DELETE CASCADE,
          sticker_id INT NOT NULL REFERENCES stickers(sticker_id) ON DELETE CASCADE,
          PRIMARY KEY (bundle_id, sticker_id)
        );`,
      );
    })
    .then(() => {
      return db.query(
        format(
          `INSERT INTO stickers (slug, name, description, price, active, new) VALUES %L`,
          stickers.map(({ slug, name, description, price, active, isNew }) => [
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
          `INSERT INTO sticker_images (sticker_id, image, thumbnail, alt_text) VALUES %L`,
          stickerImages.map(({ sticker_id, image, thumbnail, alt_text }) => [
            sticker_id,
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
          `INSERT INTO bundles (bundle_id, name, slug, description, cover_image) VALUES %L`,
          bundles.map(({ bundle_id, name, slug, description, cover_image }) => [
            bundle_id,
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
          `INSERT INTO bundle_stickers (bundle_id, sticker_id) VALUES %L`,
          bundleStickers.map(({ bundle_id, sticker_id }) => [bundle_id, sticker_id]),
        ),
      );
    })
};

export default seed;
