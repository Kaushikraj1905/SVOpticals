/*
# S V Opticals - Sample Data

## Data Inserted:

### Brands (10 brands)
- Ray-Ban, Oakley, Vogue, Titan Eye+, Fastrack, Crizal, Essilor, Zeiss, Bausch + Lomb, Johnson & Johnson

### Product Categories (17 categories)
- Frames (Men, Women, Kids)
- Sunglasses (Men, Women, Kids)
- Lenses (Single Vision, Bifocal, Progressive, Blue Cut, Photochromic, High Index)
- Contact Lenses (Daily, Monthly, Yearly, Colored)
- Accessories (Lens Cleaner, Cases, Cloth, Chains)

### Suppliers (3 sample suppliers)

### Sample Products (20+ products across categories)

## Notes:
- Uses safe insert with ON CONFLICT DO NOTHING for idempotency
- Includes both English and Telugu translations for categories
*/

-- Insert Brands
INSERT INTO brands (name, slug, description, is_active) VALUES
  ('Ray-Ban', 'ray-ban', 'Iconic eyewear brand known for timeless sunglasses and frames', true),
  ('Oakley', 'oakley', 'Performance eyewear for sports and active lifestyle', true),
  ('Vogue', 'vogue', 'Fashion-forward eyewear for the style-conscious', true),
  ('Titan Eye+', 'titan-eye-plus', 'Premium Indian eyewear brand from Titan', true),
  ('Fastrack', 'fastrack', 'Youth-focused trendy eyewear brand', true),
  ('Crizal', 'crizal', 'Advanced lens coatings and treatments', true),
  ('Essilor', 'essilor', 'World leader in ophthalmic optics', true),
  ('Zeiss', 'zeiss', 'German precision optics and lenses', true),
  ('Bausch + Lomb', 'bausch-lomb', 'Contact lenses and eye health products', true),
  ('Johnson & Johnson', 'johnson-johnson', 'ACUVUE contact lenses', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert Product Categories with Telugu translations
INSERT INTO product_categories (name, slug, name_te, parent_id, description, is_active, sort_order) VALUES
  ('Frames', 'frames', 'ఫ్రేమ్‌లు', NULL, 'Eyeglass frames for all ages', true, 1),
  ('Men Frames', 'frames-men', 'పురుషుల ఫ్రేమ్‌లు', (SELECT id FROM product_categories WHERE slug = 'frames'), 'Eyeglass frames for men', true, 1),
  ('Women Frames', 'frames-women', 'మహిళల ఫ్రేమ్‌లు', (SELECT id FROM product_categories WHERE slug = 'frames'), 'Eyeglass frames for women', true, 2),
  ('Kids Frames', 'frames-kids', 'పిల్లల ఫ్రేమ్‌లు', (SELECT id FROM product_categories WHERE slug = 'frames'), 'Eyeglass frames for kids', true, 3),
  ('Sunglasses', 'sunglasses', 'సన్‌గ్లాసెస్', NULL, 'Stylish sunglasses for sun protection', true, 2),
  ('Men Sunglasses', 'sunglasses-men', 'పురుషుల సన్‌గ్లాసెస్', (SELECT id FROM product_categories WHERE slug = 'sunglasses'), 'Sunglasses for men', true, 1),
  ('Women Sunglasses', 'sunglasses-women', 'మహిళల సన్‌గ్లాసెస్', (SELECT id FROM product_categories WHERE slug = 'sunglasses'), 'Sunglasses for women', true, 2),
  ('Kids Sunglasses', 'sunglasses-kids', 'పిల్లల సన్‌గ్లాసెస్', (SELECT id FROM product_categories WHERE slug = 'sunglasses'), 'Sunglasses for kids', true, 3),
  ('Lenses', 'lenses', 'లెన్సులు', NULL, 'Prescription lenses', true, 3),
  ('Single Vision', 'lenses-single-vision', 'సింగిల్ విజన్ లెన్సులు', (SELECT id FROM product_categories WHERE slug = 'lenses'), 'Single vision prescription lenses', true, 1),
  ('Bifocal', 'lenses-bifocal', 'బైఫోకల్ లెన్సులు', (SELECT id FROM product_categories WHERE slug = 'lenses'), 'Bifocal lenses for reading and distance', true, 2),
  ('Progressive', 'lenses-progressive', 'ప్రోగ్రెసివ్ లెన్సులు', (SELECT id FROM product_categories WHERE slug = 'lenses'), 'Progressive no-line lenses', true, 3),
  ('Blue Cut', 'lenses-blue-cut', 'బ్లూ కట్ లెన్సులు', (SELECT id FROM product_categories WHERE slug = 'lenses'), 'Blue light blocking lenses', true, 4),
  ('Photochromic', 'lenses-photochromic', 'ఫోటోక్రోమిక్ లెన్సులు', (SELECT id FROM product_categories WHERE slug = 'lenses'), 'Light-adaptive lenses', true, 5),
  ('High Index', 'lenses-high-index', 'హై ఇండెక్స్ లెన్సులు', (SELECT id FROM product_categories WHERE slug = 'lenses'), 'Thin high-index lenses', true, 6),
  ('Contact Lenses', 'contact-lenses', 'కాంటాక్ట్ లెన్సులు', NULL, 'Contact lenses', true, 4),
  ('Daily Contact', 'contact-daily', 'డైలీ కాంటాక్ట్ లెన్సులు', (SELECT id FROM product_categories WHERE slug = 'contact-lenses'), 'Daily disposable contact lenses', true, 1),
  ('Monthly Contact', 'contact-monthly', 'మంత్లీ కాంటాక్ట్ లెన్సులు', (SELECT id FROM product_categories WHERE slug = 'contact-lenses'), 'Monthly disposable contact lenses', true, 2),
  ('Yearly Contact', 'contact-yearly', 'ఇయర్లీ కాంటాక్ట్ లెన్సులు', (SELECT id FROM product_categories WHERE slug = 'contact-lenses'), 'Yearly contact lenses', true, 3),
  ('Colored Contact', 'contact-colored', 'కలర్డ్ కాంటాక్ట్ లెన్సులు', (SELECT id FROM product_categories WHERE slug = 'contact-lenses'), 'Colored cosmetic contact lenses', true, 4),
  ('Accessories', 'accessories', 'యాక్సెసరీస్', NULL, 'Eyewear accessories', true, 5),
  ('Lens Cleaner', 'accessory-cleaner', 'లెన్స్ క్లీనర్', (SELECT id FROM product_categories WHERE slug = 'accessories'), 'Lens cleaning solutions', true, 1),
  ('Cases', 'accessory-cases', 'కేసెస్', (SELECT id FROM product_categories WHERE slug = 'accessories'), 'Eyeglass cases', true, 2),
  ('Cloth', 'accessory-cloth', 'క్లీనింగ్ క్లాత్', (SELECT id FROM product_categories WHERE slug = 'accessories'), 'Microfiber cleaning cloth', true, 3),
  ('Chains', 'accessory-chains', 'చైన్స్', (SELECT id FROM product_categories WHERE slug = 'accessories'), 'Eyeglass chains and cords', true, 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert Suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address, gstin, is_active) VALUES
  ('Titan Eyewear Distributors', 'Rajesh Kumar', 'rajesh@titan-eyewear.com', '+91 9876543210', 'Mumbai, Maharashtra', '27AABCT1234M1ZA', true),
  ('Essilor India Pvt Ltd', 'Priya Sharma', 'priya@essilor.co.in', '+91 9876543211', 'Bangalore, Karnataka', '29AABCE5678M1ZB', true),
  ('Luxottica India', 'Amit Patel', 'amit@luxottica.in', '+91 9876543212', 'Delhi, New Delhi', '07AABCL9876M1ZC', true)
ON CONFLICT DO NOTHING;

-- Sample Products
-- Ray-Ban Frames
INSERT INTO products (sku, name, name_te, description, description_te, brand_id, category_id, price, mrp, gst_rate, specifications, is_active, is_featured) VALUES
  ('RB-AVIATOR-001', 'Ray-Ban Aviator Classic', 'రే-బాన్ ఏవియేటర్ క్లాసిక్', 'The iconic aviator sunglasses worn by generations. Gold metal frame with G-15 green lenses.', 'తరాలు తరాలుగా ధరించే ప్రతిష్టాత్మక ఏవియేటర్ సన్‌గ్లాసెస్. గోల్డ్ మెటల్ ఫ్రేమ్ G-15 గ్రీన్ లెన్సులతో.', (SELECT id FROM brands WHERE slug = 'ray-ban'), (SELECT id FROM product_categories WHERE slug = 'frames-men'), 8500, 9990, 18, '{"frame_material": "Metal", "frame_color": "Gold", "lens_type": "Non-Prescription", "size": "58mm"}', true, true),
  ('RB-WAYFARER-001', 'Ray-Ban Wayfarer', 'రే-బాన్ వేఫైండర్', 'Classic Wayfarer silhouette in black acetate. Timeless design for any occasion.', 'బ్లాక్ అసిటేట్‌లో క్లాసిక్ వేఫైండర్ డిజైన్. ఏ సందర్భానికైన � శాశ్వత డిజైన్.', (SELECT id FROM brands WHERE slug = 'ray-ban'), (SELECT id FROM product_categories WHERE slug = 'frames-men'), 7200, 8490, 18, '{"frame_material": "Acetate", "frame_color": "Black", "lens_type": "Non-Prescription", "size": "50mm"}', true, true),
  ('RB-ROUND-001', 'Ray-Ban Round Metal', 'రే-బాన్ రౌండ్ మెటల్', 'Vintage-inspired round metal frame. Perfect for the intellectual look.', 'వింటేజ్ స్టైల్ రౌండ్ మెటల్ ఫ్రేమ్. బుద్ధిజీవుల రూపానికి అనువైనది.', (SELECT id FROM brands WHERE slug = 'ray-ban'), (SELECT id FROM product_categories WHERE slug = 'frames-men'), 6800, 7990, 18, '{"frame_material": "Metal", "frame_color": "Gold", "lens_type": "Non-Prescription", "size": "51mm"}', true, false)
ON CONFLICT (sku) DO NOTHING;

-- Oakley
INSERT INTO products (sku, name, name_te, description, description_te, brand_id, category_id, price, mrp, gst_rate, specifications, is_active, is_featured) VALUES
  ('OAK-HOLBROOK-001', 'Oakley Holbrook XL', 'ఓక్లీ హోల్‌బ్రూక్ XL', 'Modern oversized sunglasses with Prizm lens technology. Designed for active lifestyle.', 'ప్రిజమ్ లెన్స్ టెక్నాలజీతో మోడర్న్ ఓవర్‌సైజ్డ్ సన్‌గ్లాసెస్. యాక్టివ్ లైఫ్‌స్టైల్ కోసం రూపొందించినది.', (SELECT id FROM brands WHERE slug = 'oakley'), (SELECT id FROM product_categories WHERE slug = 'sunglasses-men'), 9500, 11200, 18, '{"frame_material": "O-Matter", "frame_color": "Matte Black", "lens_type": "Prizm", "size": "57mm"}', true, true),
  ('OAK-RADAR-001', 'Oakley Radar EV Path', 'ఓక్లీ రాడార్ EV పాత్', 'Performance sports sunglasses with extended coverage. Perfect for cycling and running.', 'విస్తృత కవరేజీతో పనితీరు స్పోర్ట్స్ సన్‌గ్లాసెస్. సైక్లింగ్ మరియు రన్నింగ్‌కు అనువైనది.', (SELECT id FROM brands WHERE slug = 'oakley'), (SELECT id FROM product_categories WHERE slug = 'sunglasses-men'), 11500, 13500, 18, '{"frame_material": "O-Matter", "frame_color": "Polished Black", "lens_type": "Prizm Road", "size": "41mm"}', true, false)
ON CONFLICT (sku) DO NOTHING;

-- Vogue
INSERT INTO products (sku, name, name_te, description, description_te, brand_id, category_id, price, mrp, gst_rate, specifications, is_active, is_featured) VALUES
  ('VOG-VO5278-001', 'Vogue VO5278S', 'వోగ్ VO5278S', 'Elegant cat-eye sunglasses for women. Oversized frame with gradient lenses.', 'మహిళల కోసం అందమైన క్యాట్-ఐ సన్‌గ్లాసెస్. గ్రేడియంట్ లెన్సులతో ఓవర్‌సైజ్డ్ ఫ్రేమ్.', (SELECT id FROM brands WHERE slug = 'vogue'), (SELECT id FROM product_categories WHERE slug = 'sunglasses-women'), 5200, 6200, 18, '{"frame_material": "Acetate", "frame_color": "Tortoise", "lens_type": "Gradient", "size": "54mm"}', true, true),
  ('VOG-VO5432-001', 'Vogue VO5432S Round', 'వోగ్ VO5432S రౌండ్', 'Trendy round sunglasses with thin metal frame. Perfect for everyday wear.', 'సన్నని మెటల్ ఫ్రేమ్‌తో ట్రెండీ రౌండ్ సన్‌గ్లాసెస్. ప్రతిరోజూ ధరించడానికి అనువైనది.', (SELECT id FROM brands WHERE slug = 'vogue'), (SELECT id FROM product_categories WHERE slug = 'sunglasses-women'), 4500, 5400, 18, '{"frame_material": "Metal", "frame_color": "Rose Gold", "lens_type": "Gradient", "size": "50mm"}', true, false)
ON CONFLICT (sku) DO NOTHING;

-- Titan Eye+
INSERT INTO products (sku, name, name_te, description, description_te, brand_id, category_id, price, mrp, gst_rate, specifications, is_active, is_featured) VALUES
  ('TITAN-MAVERICK-001', 'Titan Eye+ Maverick', 'టైటాన్ ఐ+ మావరిక్', 'Premium titanium frame for men. Lightweight and durable design.', 'పురుషుల కోసం ప్రీమియం టైటానియం ఫ్రేమ్. తేలికైన మరియు మన్నికైన డిజైన్.', (SELECT id FROM brands WHERE slug = 'titan-eye-plus'), (SELECT id FROM product_categories WHERE slug = 'frames-men'), 8900, 10500, 18, '{"frame_material": "Titanium", "frame_color": "Gunmetal", "lens_type": "Prescription Ready", "size": "52mm"}', true, true),
  ('TITAN-GRACE-001', 'Titan Eye+ Grace', 'టైటాన్ ఐ+ గ్రేస్', 'Elegant women-frame with delicate design. Gold accents on acetate frame.', 'సున్నితమైన డిజైన్‌తో అందమైన మహిళల ఫ్రేమ్. అసిటేట్ ఫ్రేమ్‌పై గోల్డ్ అక్సెంట్స్.', (SELECT id FROM brands WHERE slug = 'titan-eye-plus'), (SELECT id FROM product_categories WHERE slug = 'frames-women'), 7500, 8900, 18, '{"frame_material": "Acetate", "frame_color": "Burgundy", "lens_type": "Prescription Ready", "size": "50mm"}', true, true),
  ('TITAN-KIDS-001', 'Titan Eye+ Kids Explorer', 'టైటాన్ ఐ+ కిడ్స్ ఎక్స్‌ప్లోరర్', 'Durable and colorful frames for kids. Flexible hinges for active children.', 'పిల్లల కోసం మన్నికైన మరియు రంగుల ఫ్రేమ్‌లు. యాక్టివ్ పిల్లల కోసం ఫ్లెక్సిబుల్ హింజెస్.', (SELECT id FROM brands WHERE slug = 'titan-eye-plus'), (SELECT id FROM product_categories WHERE slug = 'frames-kids'), 3200, 3800, 18, '{"frame_material": "TR90", "frame_color": "Blue/Red", "lens_type": "Prescription Ready", "size": "46mm"}', true, true)
ON CONFLICT (sku) DO NOTHING;

-- Fastrack
INSERT INTO products (sku, name, name_te, description, description_te, brand_id, category_id, price, mrp, gst_rate, specifications, is_active, is_featured) VALUES
  ('FAST-P1296-001', 'Fastrack P1296 Polarized', 'ఫాస్ట్‌ర్యాక్ P1296 పోలరైజ్డ్', 'Trendy polarized sunglasses for youth. Square frame with UV400 protection.', 'యువత కోసం ట్రెండీ పోలరైజ్డ్ సన్‌గ్లాసెస్. స్క్వేర్ ఫ్రేమ్ UV400 ప్రొటెక్షన్‌తో.', (SELECT id FROM brands WHERE slug = 'fastrack'), (SELECT id FROM product_categories WHERE slug = 'sunglasses-men'), 2400, 2995, 18, '{"frame_material": "Polycarbonate", "frame_color": "Black", "lens_type": "Polarized", "size": "55mm"}', true, true),
  ('FAST-F2345-001', 'Fastrack F2345 Cat Eye', 'ఫాస్ట్‌ర్యాక్ F2345 క్యాట్ ఐ', 'Stylish cat-eye sunglasses for women. Gradient lenses with bold frame.', 'మహిళల కోసం స్టైలిష్ క్యాట్-ఐ సన్‌గ్లాసెస్. బోల్డ్ ఫ్రేమ్‌తో గ్రేడియంట్ లెన్సులు.', (SELECT id FROM brands WHERE slug = 'fastrack'), (SELECT id FROM product_categories WHERE slug = 'sunglasses-women'), 2200, 2795, 18, '{"frame_material": "Acetate", "frame_color": "Pink", "lens_type": "Gradient", "size": "52mm"}', true, false)
ON CONFLICT (sku) DO NOTHING;

-- Lenses (Essilor, Crizal, Zeiss)
INSERT INTO products (sku, name, name_te, description, description_te, brand_id, category_id, price, mrp, gst_rate, specifications, is_active, is_featured) VALUES
  ('ESS-SV-001', 'Essilor Single Vision Crizal', 'ఎసిలోర్ సింగిల్ విజన్ క్రిజాల్', 'Premium single vision lens with Crizal anti-reflective coating. 1.5 index.', 'క్రిజాల్ యాంటీ-రిఫ్లెక్టివ్ కోటింగ్‌తో ప్రీమియం సింగిల్ విజన్ లెన్స్. 1.5 ఇండెక్స్.', (SELECT id FROM brands WHERE slug = 'essilor'), (SELECT id FROM product_categories WHERE slug = 'lenses-single-vision'), 4500, 5500, 18, '{"index": "1.5", "coating": "Crizal", "material": "CR-39", "diameter": "70mm"}', true, true),
  ('ESS-PROG-001', 'Varilux Progressive', 'వేరిలక్స్ ప్రోగ్రెసివ్', 'Premium progressive lens with smooth transitions. Varilux Comfort design.', 'స్మూత్ ట్రాన్సిషన్‌లతో ప్రీమియం ప్రోగ్రెసివ్ లెన్స్. వేరిలక్స్ కంఫర్ట్ డిజైన్.', (SELECT id FROM brands WHERE slug = 'essilor'), (SELECT id FROM product_categories WHERE slug = 'lenses-progressive'), 12000, 15000, 18, '{"index": "1.6", "coating": "Crizal", "material": "MR-8", "corridor": "Standard"}', true, true),
  ('CRIZAL-BLUE-001', 'Crizal Prevencia Blue Cut', 'క్రిజాల్ ప్రివెన్సియా బ్లూ కట్', 'Blue light blocking lens with Crizal coating. Ideal for digital device users.', 'క్రిజాల్ కోటింగ్‌తో బ్లూ లైట్ బ్లాకింగ్ లెన్స్. డిజిటల్ డివైస్ వినియోగదారులకు అనువైనది.', (SELECT id FROM brands WHERE slug = 'crizal'), (SELECT id FROM product_categories WHERE slug = 'lenses-blue-cut'), 5500, 6500, 18, '{"index": "1.5", "coating": "Prevencia", "material": "CR-39", "blue_block": "Yes"}', true, true),
  ('ZEISS-PHOTO-001', 'Zeiss PhotoFusion', 'జీస్ ఫోటోఫ్యూజన్', 'Photochromic lenses that adapt to light conditions. Clear indoors, dark outdoors.', 'కాంతి పరిస్థితులకు అనుగుణంగా మారే ఫోటోక్రోమిక్ లెన్సులు. ఇంట్లో క్లియర్, బయట డార్క్.', (SELECT id FROM brands WHERE slug = 'zeiss'), (SELECT id FROM product_categories WHERE slug = 'lenses-photochromic'), 8500, 10000, 18, '{"index": "1.5", "coating": "DuraVision", "material": "Photochromic", "activation": "Fast"}', true, true),
  ('ESS-HI-001', 'Essilor 1.74 High Index', 'ఎసిలోర్ 1.74 హై ఇండెక్స్', 'Ultra-thin high-index lens for strong prescriptions. 1.74 index for maximum thickness reduction.', 'బలమైన ప్రిస్క్రిప్షన్‌ల కోసం అల్ట్రా-థిన్ హై-ఇండెక్స్ లెన్స్. 1.74 ఇండెక్స్.', (SELECT id FROM brands WHERE slug = 'essilor'), (SELECT id FROM product_categories WHERE slug = 'lenses-high-index'), 15000, 18000, 18, '{"index": "1.74", "coating": "Crizal", "material": "MR-174", "aspheric": "Yes"}', true, false)
ON CONFLICT (sku) DO NOTHING;

-- Contact Lenses (Bausch + Lomb, Johnson & Johnson)
INSERT INTO products (sku, name, name_te, description, description_te, brand_id, category_id, price, mrp, gst_rate, specifications, is_active, is_featured) VALUES
  ('ACUVUE-MOIST-001', '1-Day Acuvue Moist', '1-డే అకువ్యూ మాయిస్ట్', 'Daily disposable contact lenses - 30 lenses. UV protection included.', 'డైలీ డిస్పోజబుల్ కాంటాక్ట్ లెన్సులు - 30 లెన్సులు. UV ప్రొటెక్షన్ ఉంది.', (SELECT id FROM brands WHERE slug = 'johnson-johnson'), (SELECT id FROM product_categories WHERE slug = 'contact-daily'), 2800, 3200, 18, '{"type": "Daily", "quantity": "30 lenses", "water_content": "58%", "uv_protection": "Yes"}', true, true),
  ('ACUVUE-VITA-001', 'Acuvue Vita Monthly', 'అకువ్యూ విటా మంత్లీ', 'Monthly disposable contact lenses - 6 lenses. Comfortable for extended wear.', 'మంత్లీ డిస్పోజబుల్ కాంటాక్ట్ లెన్సులు - 6 లెన్సులు. ఎక్స్‌టెండెడ్ వేర్ కోసం కంఫర్టబుల్.', (SELECT id FROM brands WHERE slug = 'johnson-johnson'), (SELECT id FROM product_categories WHERE slug = 'contact-monthly'), 2400, 2800, 18, '{"type": "Monthly", "quantity": "6 lenses", "water_content": "62%", "uv_protection": "Yes"}', true, true),
  ('BAUS-SOFT-001', 'Bausch + Lomb Soflens 59', 'బౌష్ + లాంబ్ సాఫ్టెన్స్ 59', 'Monthly disposable contact lenses - 6 lenses. Comfortable aspheric design.', 'మంత్లీ డిస్పోజబుల్ కాంటాక్ట్ లెన్సులు - 6 లెన్సులు. కంఫర్టబుల్ ఆస్ఫెరిక్ డిజైన్.', (SELECT id FROM brands WHERE slug = 'bausch-lomb'), (SELECT id FROM product_categories WHERE slug = 'contact-monthly'), 1800, 2200, 18, '{"type": "Monthly", "quantity": "6 lenses", "water_content": "59%", "aspheric": "Yes"}', true, false),
  ('BAUS-INFUSE-001', 'Bausch + Lomb INFUSE', 'బౌష్ + లాంబ్ ఇన్‌ఫ్యూజ్', 'Monthly silicone hydrogel lenses - 6 lenses. Next generation comfort.', 'మంత్లీ సిలికాన్ హైడ్రోజెల్ లెన్సులు - 6 లెన్సులు. నెక్స్ట్ జనరేషన్ కంఫర్ట్.', (SELECT id FROM brands WHERE slug = 'bausch-lomb'), (SELECT id FROM product_categories WHERE slug = 'contact-monthly'), 3200, 3800, 18, '{"type": "Monthly", "quantity": "6 lenses", "water_content": "55%", "silicone_hydrogel": "Yes"}', true, false),
  ('COLOR-FRESH-001', 'FreshLook ColorBlends', 'ఫ్రెష్‌లుక్ కలర్‌బ్లెండ్స్', 'Colored monthly contact lenses - 2 lenses. Natural-looking color enhancement.', 'కలర్డ్ మంత్లీ కాంటాక్ట్ లెన్సులు - 2 లెన్సులు. సహజమైన రంగుల అభివృద్ధి.', (SELECT id FROM brands WHERE slug = 'bausch-lomb'), (SELECT id FROM product_categories WHERE slug = 'contact-colored'), 1500, 1800, 18, '{"type": "Monthly", "quantity": "2 lenses", "water_content": "55%", "colors": "Hazel, Blue, Green, Gray"}', true, true)
ON CONFLICT (sku) DO NOTHING;

-- Accessories
INSERT INTO products (sku, name, name_te, description, description_te, brand_id, category_id, price, mrp, gst_rate, specifications, is_active, is_featured) VALUES
  ('CLEAN-SPRAY-001', 'Lens Cleaning Spray', 'లెన్స్ క్లీనింగ్ స్ప్రే', 'Professional lens cleaning spray - 100ml. Safe for all lens types.', 'ప్రొఫెషనల్ లెన్స్ క్లీనింగ్ స్ప్రే - 100ml. అన్ని రకాల లెన్సులకు సురక్షితమైనది.', NULL, (SELECT id FROM product_categories WHERE slug = 'accessory-cleaner'), 250, 300, 18, '{"volume": "100ml", "type": "Spray", "alcohol_free": "Yes"}', true, false),
  ('CASE-HARD-001', 'Hard Shell Case', 'హార్డ్ షెల్ కేస్', 'Protective hard shell case for eyeglasses. Multiple colors available.', 'కన్నాల కోసం ప్రొటెక్టివ్ హార్డ్ షెల్ కేస్. అనేక రంగులలో అందుబాటులో ఉంది.', NULL, (SELECT id FROM product_categories WHERE slug = 'accessory-cases'), 350, 400, 18, '{"type": "Hard Shell", "material": "Plastic", "size": "Universal"}', true, false),
  ('CLOTH-MICRO-001', 'Microfiber Cleaning Cloth', 'మైక్రోఫైబర్ క్లీనింగ్ క్లాత్', 'Premium microfiber cleaning cloth. Gentle on all lens coatings.', 'ప్రీమియం మైక్రోఫైబర్ క్లీనింగ్ క్లాత్. అన్ని లెన్స్ కోటింగ్‌లపై సున్నితంగా పనిచేస్తుంది.', NULL, (SELECT id FROM product_categories WHERE slug = 'accessory-cloth'), 99, 150, 18, '{"material": "Microfiber", "size": "15x15cm"}', true, false),
  ('CHAIN-METAL-001', 'Metal Eyeglass Chain', 'మెటల్ కన్నాల చైన్', 'Elegant metal chain for eyeglasses. Gold/silver finish options.', 'కన్నాల కోసం అందమైన మెటల్ చైన్. గోల్డ్/సిల్వర్ ఫినిష్ ఆప్షన్లు.', NULL, (SELECT id FROM product_categories WHERE slug = 'accessory-chains'), 450, 550, 18, '{"material": "Metal Alloy", "length": "70cm"}', true, false)
ON CONFLICT (sku) DO NOTHING;

-- Initialize inventory for all products
INSERT INTO inventory (product_id, quantity, min_quantity, location)
SELECT id, 
  CASE 
    WHEN EXISTS (SELECT 1 FROM product_categories pc WHERE pc.id = products.category_id AND pc.slug LIKE 'lenses%') THEN 20
    WHEN EXISTS (SELECT 1 FROM product_categories pc WHERE pc.id = products.category_id AND pc.slug LIKE 'contact%') THEN 30
    ELSE 10
  END,
  CASE 
    WHEN EXISTS (SELECT 1 FROM product_categories pc WHERE pc.id = products.category_id AND pc.slug LIKE 'lenses%') THEN 5
    WHEN EXISTS (SELECT 1 FROM product_categories pc WHERE pc.id = products.category_id AND pc.slug LIKE 'contact%') THEN 10
    ELSE 3
  END,
  'Main Store'
FROM products
ON CONFLICT (product_id) DO NOTHING;