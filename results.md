You are now connected to database "sticker_store" as user "tjw".
              List of tables
 Schema |      Name       | Type  | Owner 
--------+-----------------+-------+-------
 public | bundle_images   | table | tjw
 public | bundle_products | table | tjw
 public | bundles         | table | tjw
 public | order_products  | table | tjw
 public | orders          | table | tjw
 public | product_images  | table | tjw
 public | products        | table | tjw
(7 rows)

 product_id |        slug        |            name            |            description            | price | active |     created_at      | size | is_new 
------------+--------------------+----------------------------+-----------------------------------+-------+--------+---------------------+------+--------
          1 | spinosaurus        | spinosaurus sticker        | a sticker of a spinosaurus        |   899 | t      | 2024-01-01 00:00:00 |      | t
          2 | tyrannosaurus-rex  | tyrannosaurus rex sticker  | a sticker of a tyrannosaurus rex  |   999 | t      | 2024-01-02 00:00:00 |      | t
          3 | triceratops        | triceratops sticker        | a sticker of a triceratops        |   899 | t      | 2024-01-03 00:00:00 |      | f
          4 | velociraptor       | velociraptor sticker       | a sticker of a velociraptor       |   849 | t      | 2024-01-04 00:00:00 |      | f
          5 | stegosaurus        | stegosaurus sticker        | a sticker of a stegosaurus        |   899 | t      | 2024-01-05 00:00:00 |      | f
          6 | brachiosaurus      | brachiosaurus sticker      | a sticker of a brachiosaurus      |   949 | t      | 2024-01-06 00:00:00 |      | f
          7 | ankylosaurus       | ankylosaurus sticker       | a sticker of an ankylosaurus      |   879 | t      | 2024-01-07 00:00:00 |      | f
          8 | parasaurolophus    | parasaurolophus sticker    | a sticker of a parasaurolophus    |   899 | t      | 2024-01-08 00:00:00 |      | f
          9 | iguanodon          | iguanodon sticker          | a sticker of an iguanodon         |   829 | t      | 2024-01-09 00:00:00 |      | f
         10 | diplodocus         | diplodocus sticker         | a sticker of a diplodocus         |   929 | t      | 2024-01-10 00:00:00 |      | f
         11 | allosaurus         | allosaurus sticker         | a sticker of an allosaurus        |   919 | t      | 2024-01-11 00:00:00 |      | f
         12 | carnotaurus        | carnotaurus sticker        | a sticker of a carnotaurus        |   889 | t      | 2024-01-12 00:00:00 |      | f
         13 | pachycephalosaurus | pachycephalosaurus sticker | a sticker of a pachycephalosaurus |   869 | t      | 2024-01-13 00:00:00 |      | f
(13 rows)

 product_image_id | product_id |          image_url           |               alt_text               | is_thumbnail | display_order |         created_at         
------------------+------------+------------------------------+--------------------------------------+--------------+---------------+----------------------------
                1 |          1 | spinosaurus-thumb.png        | spinosaurus sticker front view       | t            |             0 | 2026-08-27 11:12:57.436172
                2 |          1 | spinosaurus-main.png         | spinosaurus sticker front view       | f            |             1 | 2026-08-27 11:12:57.436172
                3 |          2 | tyrannosaurus-rex-thumb.png  | tyrannosaurus rex sticker roaring    | t            |             0 | 2026-08-27 11:12:57.436172
                4 |          2 | tyrannosaurus-rex-main.png   | tyrannosaurus rex sticker roaring    | f            |             1 | 2026-08-27 11:12:57.436172
                5 |          3 | triceratops-thumb.png        | triceratops sticker side profile     | t            |             0 | 2026-08-27 11:12:57.436172
                6 |          3 | triceratops-main.png         | triceratops sticker side profile     | f            |             1 | 2026-08-27 11:12:57.436172
                7 |          4 | velociraptor-thumb.png       | velociraptor sticker running         | t            |             0 | 2026-08-27 11:12:57.436172
                8 |          4 | velociraptor-main.png        | velociraptor sticker running         | f            |             1 | 2026-08-27 11:12:57.436172
                9 |          5 | stegosaurus-thumb.png        | stegosaurus sticker with plates      | t            |             0 | 2026-08-27 11:12:57.436172
               10 |          5 | stegosaurus-main.png         | stegosaurus sticker with plates      | f            |             1 | 2026-08-27 11:12:57.436172
               11 |          6 | brachiosaurus-thumb.png      | brachiosaurus sticker long neck      | t            |             0 | 2026-08-27 11:12:57.436172
               12 |          6 | brachiosaurus-main.png       | brachiosaurus sticker long neck      | f            |             1 | 2026-08-27 11:12:57.436172
               13 |          7 | ankylosaurus-thumb.png       | ankylosaurus sticker with tail club  | t            |             0 | 2026-08-27 11:12:57.436172
               14 |          7 | ankylosaurus-main.png        | ankylosaurus sticker with tail club  | f            |             1 | 2026-08-27 11:12:57.436172
               15 |          8 | parasaurolophus-thumb.png    | parasaurolophus sticker crest detail | t            |             0 | 2026-08-27 11:12:57.436172
               16 |          8 | parasaurolophus-main.png     | parasaurolophus sticker crest detail | f            |             1 | 2026-08-27 11:12:57.436172
               17 |          9 | iguanodon-thumb.png          | iguanodon sticker standing pose      | t            |             0 | 2026-08-27 11:12:57.436172
               18 |          9 | iguanodon-main.png           | iguanodon sticker standing pose      | f            |             1 | 2026-08-27 11:12:57.436172
               19 |         10 | diplodocus-thumb.png         | diplodocus sticker long tail         | t            |             0 | 2026-08-27 11:12:57.436172
               20 |         10 | diplodocus-main.png          | diplodocus sticker long tail         | f            |             1 | 2026-08-27 11:12:57.436172
               21 |         11 | allosaurus-thumb.png         | allosaurus sticker open mouth        | t            |             0 | 2026-08-27 11:12:57.436172
               22 |         11 | allosaurus-main.png          | allosaurus sticker open mouth        | f            |             1 | 2026-08-27 11:12:57.436172
               23 |         12 | carnotaurus-thumb.png        | carnotaurus sticker horned face      | t            |             0 | 2026-08-27 11:12:57.436172
               24 |         12 | carnotaurus-main.png         | carnotaurus sticker horned face      | f            |             1 | 2026-08-27 11:12:57.436172
               25 |         13 | pachycephalosaurus-thumb.png | pachycephalosaurus sticker dome head | t            |             0 | 2026-08-27 11:12:57.436172
               26 |         13 | pachycephalosaurus-main.png  | pachycephalosaurus sticker dome head | f            |             1 | 2026-08-27 11:12:57.436172
(26 rows)

 bundle_id |         name         |         slug         |         description         | price | active |     created_at      | is_new 
-----------+----------------------+----------------------+-----------------------------+-------+--------+---------------------+--------
         1 | Jurrasic Dinosaurs   | jurassic-dinosaurs   | jurrasic dinosaurs r cool.  |  3299 | t      | 2026-02-01 00:00:00 | t
         2 | Cretaceous Dinosaurs | cretaceous-dinosaurs | cretaceous dinosaurs r cool |  3099 | t      | 2026-02-02 00:00:00 | f
(2 rows)

 bundle_image_id | bundle_id |          image_url           |                  alt_text                   | is_thumbnail | display_order |         created_at         
-----------------+-----------+------------------------------+---------------------------------------------+--------------+---------------+----------------------------
               1 |         1 | jurassic-bundle-thumb.png    | jurassic dinosaur sticker bundle            | t            |             0 | 2026-08-27 11:12:57.448957
               2 |         1 | jurassic-bundle-main-1.png   | jurassic dinosaur sticker bundle laid out   | f            |             1 | 2026-08-27 11:12:57.448957
               3 |         1 | jurassic-bundle-main-2.png   | jurassic dinosaur sticker bundle close up   | f            |             2 | 2026-08-27 11:12:57.448957
               4 |         2 | cretaceous-bundle-thumb.png  | cretaceous dinosaur sticker bundle          | t            |             0 | 2026-08-27 11:12:57.448957
               5 |         2 | cretaceous-bundle-main-1.png | cretaceous dinosaur sticker bundle laid out | f            |             1 | 2026-08-27 11:12:57.448957
(5 rows)

 bundle_id | product_id 
-----------+------------
         1 |          2
         1 |          4
         1 |         11
         1 |         12
         2 |          1
         2 |          3
         2 |          8
         2 |          9
(8 rows)

 order_id | stripe_session_id | payment_intent | currency | customer_email | shipping_address_line1 | shipping_address_line2 | shipping_city | shipping_postcode | shipping_country | amount_total | amount_subtotal | payment_status | status | created_at 
----------+-------------------+----------------+----------+----------------+------------------------+------------------------+---------------+-------------------+------------------+--------------+-----------------+----------------+--------+------------
(0 rows)

 order_product_id | order_id | product_id | bundle_id | quantity | price_at_purchase 
------------------+----------+------------+-----------+----------+-------------------
(0 rows)

