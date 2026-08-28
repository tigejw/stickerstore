# stickerstore


## uploading a product

products and bundles are added to the database via 'npm run upload', which will process every folder inside "__productsUpload/"

### create a folder

inside "__productsUpload/" create one folder per product or bundle with the folder named as the slug of the product. 

```
    __productsUpload/
        spinosaurs/
```

### add images

add images according to the following rules:
- thumbnail must be named `thumbnail`.<ext>
- gallery images must be numbered `0.<ext>`, `1.<ext>`, `2.<ext>`... with no gaps, starting at 0
- supported formats (`.png`, `.jpg`, `.jpeg`, `.webp`) will be converted to `.webp` automatically on upload

```
    __productsUpload/
        spinosaurs/
            thumbnail.png
            0.jpg
            1.png
            2.webp
            3.jpeg
```

### add manifest

a manifest is required to provide the information about each entry
the manifest shape differs slightly based upon wether the entry is a product (single sticker) or bundle (collection of single stickers)
price is in cents and altText requires one entry per image file, keyed with the filenames

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

**Bundle** (same shape, plus `productSlugs` referencing existing product slugs):
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
### upload the folder!

run ```npm run upload```

each folder will be validated, the images converted to webp and resized down to 1600px max width/height and then uploaded to supabase storage
the db rows of each product/bundle will be inserted (including url paths for each image where they are stored in supabase storage)
successful folders will move to the `__successfulUploads/` folder, failed folders will remain in `__productsUpload` with the error printed. 
