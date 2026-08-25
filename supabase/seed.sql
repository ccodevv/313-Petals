-- ============================================================================
-- seed.sql
-- Sample categories and products for local development. Run after the
-- migrations. Not applied in production.
-- ============================================================================

insert into categories (name, slug, description) values
  ('Bouquets', 'bouquets', 'Hand-tied bouquets for any occasion'),
  ('Flower Arrangements', 'flower-arrangements', 'Vased arrangements for home or office'),
  ('Roses', 'roses', 'Classic rose bunches in every color'),
  ('Tulips', 'tulips', 'Fresh seasonal tulips'),
  ('Sunflowers', 'sunflowers', 'Bright sunflower bunches'),
  ('Gift Sets', 'gift-sets', 'Flowers paired with chocolates or cards'),
  ('Add-ons', 'add-ons', 'Vases, cards, and extras to complete your order');

insert into products (category_id, name, slug, description, price, image_url, stock, low_stock_threshold, is_available)
select id, 'Classic Dozen Roses', 'classic-dozen-roses', 'A dozen fresh red roses, hand-tied with greenery.', 45.00, null, 25, 5, true
from categories where slug = 'roses'
union all
select id, 'Pastel Tulip Bunch', 'pastel-tulip-bunch', 'Twelve seasonal tulips in soft pastel tones.', 32.00, null, 18, 5, true
from categories where slug = 'tulips'
union all
select id, 'Sunshine Bouquet', 'sunshine-bouquet', 'A cheerful bunch of sunflowers and daisies.', 28.00, null, 14, 5, true
from categories where slug = 'sunflowers'
union all
select id, 'Garden Romance Bouquet', 'garden-romance-bouquet', 'Mixed roses, eucalyptus, and seasonal blooms.', 55.00, null, 10, 3, true
from categories where slug = 'bouquets'
union all
select id, 'Elegant Vase Arrangement', 'elegant-vase-arrangement', 'A full vased arrangement of mixed flowers.', 65.00, null, 8, 3, true
from categories where slug = 'flower-arrangements'
union all
select id, 'Flowers & Chocolates Set', 'flowers-and-chocolates-set', 'A bouquet paired with a box of premium chocolates.', 60.00, null, 12, 4, true
from categories where slug = 'gift-sets'
union all
select id, 'Glass Vase', 'glass-vase', 'A simple clear glass vase to complete your bouquet.', 12.00, null, 30, 5, true
from categories where slug = 'add-ons'
union all
select id, 'White Tulip Bunch', 'white-tulip-bunch', 'Elegant all-white tulips, twelve stems.', 30.00, null, 0, 5, false
from categories where slug = 'tulips';
