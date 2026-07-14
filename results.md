You are now connected to database "sticker_store" as user "tjw".
              List of tables
 Schema |      Name       | Type  | Owner 
--------+-----------------+-------+-------
 public | bundle_products | table | tjw
 public | bundles         | table | tjw
 public | order_products  | table | tjw
 public | orders          | table | tjw
 public | product_images  | table | tjw
 public | products        | table | tjw
(6 rows)

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

 bundle_id |         name         |         slug         |         description         | cover_image | price | active |     created_at      | is_new 
-----------+----------------------+----------------------+-----------------------------+-------------+-------+--------+---------------------+--------
         1 | Jurrasic Dinosaurs   | jurassic-dinosaurs   | jurrasic dinosaurs r cool.  | jurr.png    |  3299 | t      | 2026-02-01 00:00:00 | t
         2 | Cretaceous Dinosaurs | cretaceous-dinosaurs | cretaceous dinosaurs r cool | cret.png    |  3099 | t      | 2026-02-02 00:00:00 | f
(2 rows)

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

 order_id |                         stripe_session_id                          |       payment_intent        | currency | customer_email | shipping_address_line1 | shipping_address_line2 |    shipping_city     | shipping_postcode | shipping_country | amount_total | amount_subtotal | payment_status |  status  |         created_at         
----------+--------------------------------------------------------------------+-----------------------------+----------+----------------+------------------------+------------------------+----------------------+-------------------+------------------+--------------+-----------------+----------------+----------+----------------------------
        1 | cs_test_b1UGJzetmFGIQeqAbcPECSDfMG1zp1E4qVSDziDSQgZ0qlsvi411YsiIPt | pi_3Tt4KzA21iTqSdJw005uldev | eur      | test@gmail.com | tester                 |                        | Test Valley District | 424242            | GB               |        11225 |           11225 | paid           | complete | 2026-07-14 13:17:24.343168
(1 row)

 order_product_id | order_id | product_id | bundle_id | quantity | price_at_purchase 
------------------+----------+------------+-----------+----------+-------------------
                1 |        1 |            |         1 |        1 |              3299
                2 |        1 |            |         2 |        2 |              3099
                3 |        1 |          9 |           |        1 |               829
                4 |        1 |          5 |           |        1 |               899
(4 rows)

