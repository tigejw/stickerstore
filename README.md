# Stickerstore API / Database

Backend and API for an e-commerce store built with PostgreSQL, Typescript, Express with Stripe Payment handling

## Tech Stack
 
- **Runtime:** Node.js / TypeScript
- **Framework:** Express
- **Database:** PostgreSQL (Supabase)
- **Payments:** Stripe (Checkout + webhooks)
- **Email:** Resend
- **Testing:** Jest, Supertest
- **Hosting:** Fly.io, Supabase

## Deployment
 
- API Hosted on Fly.io at https://stickerstore.fly.dev/api (always on)
- Supabase Database and Image hosting 

## Local Setup

### Requires:
- Works on Node.js v24.18.0
- PostgreSQL running locally
- Stripe account (test mode) for `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- Resend Account (free tier) for `RESEND_API_KEY`

### Installation
 
```bash
git clone https://github.com/tigejw/stickerstore.git
cd stickerstore
npm install
```
### Environment Variables
 
Create a `.env.test` file in the project root:
 
```
PGDATABASE=sticker_store_test
PGUSER=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
COMPANY_EMAIL=
```

Create a `.env.development` file in the project root:
 
```
PGDATABASE=sticker_store
PGUSER=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
COMPANY_EMAIL=
```
 
### Database Setup
 
```bash
npm run setup-dbs       
npm run seed    
```
 
### Running Locally
 
```bash
npm run dev
```
Server runs at `http://localhost:3000`.

### Running Tests
 
```bash
npm run test
```
## API Overview
 
| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | `/api` | Returns a JSON list of all endpoints |
| GET | `/api/products` | List all products |
| GET | `/api/products/:slug` | Get a product by slug |
| GET | `/api/bundles` | List all bundles |
| GET | `/api/bundles/:slug` | Get a bundle by slug |
| POST | `/api/create-webhook-session` | Create a Stripe Checkout session |


## Uploading a product

Products and Bundles are added to the database via 'npm run upload', which will process every folder inside "__productsUpload/"

### Create "__productsUpload/" 

Create "__productsUpload/" at the root of the repo.

### Create a Folder

Within "__productsUpload/" create one folder per product or bundle named according to the slug. 

```
    __productsUpload/
        spinosaurs/
```

### Add Images

Add images according to the following rules:
- Thumbnail must be named `thumbnail`.<ext>
- Gallery images must be numbered `0.<ext>`, `1.<ext>`, `2.<ext>`... with no gaps, starting at 0
- Supported formats (`.png`, `.jpg`, `.jpeg`, `.webp`) will be converted to `.webp` automatically on upload

```
    __productsUpload/
        spinosaurs/
            thumbnail.png
            0.jpg
            1.png
            2.webp
            3.jpeg
```

### Add Manifest

- A manifest is required to provide necessary information about each entry
- The manifest's shape differs slightly when the entry is a product (single sticker) or bundle (collection of single stickers)
- Price is in cents and altText requires one entry per image file, keyed with the filenames

**Product:**
```json
{
  "type": "product",
  "slug": "spinosaurus",
  "name": "Spinosaurus",
  "description": "My favourite dinosaur!",
  "price": 350,
  "altText": {
    "thumbnail.png": "Spinosaurus sticker thumbnail",
    "0.png": "Overhead shot of the Spinosaurus sticker",
    "1.png": "Close-up shot of the Spinosaurus sticker"
  }
}
```

**Bundle** (same shape, plus `productSlugs` referencing existing relevant product slugs):
```json
{
  "type": "bundle",
  "slug": "jurassic-pack",
  "name": "Jurassic Pack",
  "description": "A bundle of three dinosaurs from the Jurassic Period.",
  "price": 900,
  "productSlugs": ["stegosaurus", "diplodocus", "triceratops"],
  "altText": {
    "thumbnail.png": "Jurassic Pack bundle thumbnail",
    "0.png": "All three stickers laid out together"
  }
}
```
### Run the Upload Script!

run ```npm run upload```

Each folder will be validated, the images converted to webp and resized down to 1600px max width/height and then uploaded to Supabase storage.
Each product/bundle will be inserted into the Database (including url paths for each image, referencing where they are stored in Supabase storage)
Successful folders will move to the `__successfulUploads/` folder, failed folders will remain in `__productsUpload` with the error printed in console. 
