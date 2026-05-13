-- ============================================================
-- SUN Booking Tours - Seed Data
-- Password for all demo users: password123
-- Run: docker exec -i sun_booking_db psql -U root -d sun_booking < db/seed.sql
-- ============================================================

-- Truncate all data (order matters due to FK constraints)
TRUNCATE TABLE likes, comments, reviews, payments, booking_requests, bank_accounts, tours, categories, users RESTART IDENTITY CASCADE;

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (name, description, created_at, updated_at) VALUES
('Beach & Island',       'Relaxing tropical getaways with sun, sand, and crystal-clear waters.',              NOW(), NOW()),
('Mountain & Trekking',  'Adventure trails through scenic highlands and mountain ranges.',                    NOW(), NOW()),
('Cultural & Heritage',  'Explore ancient cities, temples, and rich cultural traditions.',                   NOW(), NOW()),
('City & Shopping',      'Modern city tours with world-class shopping and dining.',                          NOW(), NOW()),
('Food & Culinary',      'Taste authentic cuisines and local street food experiences.',                      NOW(), NOW());

-- ============================================================
-- TOURS (category_id references above)
-- ============================================================
INSERT INTO tours (category_id, title, description, price, duration, location, created_at, updated_at) VALUES
(1, 'Phú Quốc Island Escape',        '5 days on Vietnam''s largest island with pristine beaches, coral reefs, and fresh seafood. Includes snorkeling, sunset cruise, and island hopping.',    299, 5, 'Phú Quốc, Kiên Giang',       NOW(), NOW()),
(1, 'Côn Đảo Serenity',              'Discover untouched nature, historical sites, and the clearest waters in Vietnam. A perfect blend of history and natural beauty.',                         349, 4, 'Côn Đảo, Bà Rịa',            NOW(), NOW()),
(1, 'Nha Trang Beach Holiday',       'Enjoy the vibrant coastal city with Vinpearl, Mud Bath, and island boat trips.',                                                                          199, 3, 'Nha Trang, Khánh Hoà',       NOW(), NOW()),
(2, 'Sapa Trekking Adventure',       'Trek through terraced rice fields, visit Hmong villages and conquer Fansipan – the Roof of Indochina.',                                                   249, 4, 'Sapa, Lào Cai',               NOW(), NOW()),
(2, 'Hà Giang Loop Discovery',       'Motorbike through dramatic karst mountains, the Mã Pí Lèng Pass, and the Nho Quế River.',                                                                 279, 5, 'Hà Giang',                    NOW(), NOW()),
(2, 'Bạch Mã National Park Trek',    'Guided trekking through dense rainforest, waterfalls and rare wildlife in Central Vietnam.',                                                               159, 2, 'Huế, Thừa Thiên',             NOW(), NOW()),
(3, 'Hội An Lantern Town',           'Wander the ancient trading port, join a lantern making class and enjoy riverside dining at sunset.',                                                       179, 3, 'Hội An, Quảng Nam',           NOW(), NOW()),
(3, 'Huế Imperial Citadel Tour',     'Explore the last royal capital of Vietnam – the Forbidden Purple City, royal tombs, and Thien Mu Pagoda.',                                                149, 2, 'Huế, Thừa Thiên',             NOW(), NOW()),
(3, 'Ninh Bình Bai Dinh & Trang An','Visit Asia''s largest Buddhist complex and cruise the legendary Trang An limestone grottos.',                                                              129, 2, 'Ninh Bình',                   NOW(), NOW()),
(4, 'Ho Chi Minh City Weekend',      'City highlights: Bến Thành Market, War Remnants Museum, Bui Vien street, Bitexco Tower rooftop.',                                                          99, 2, 'Hồ Chí Minh City',            NOW(), NOW()),
(4, 'Hanoi Capital Experience',      'Old Quarter walking tour, Hoan Kiem Lake, Temple of Literature, and authentic Phở breakfast.',                                                             119, 2, 'Hà Nội',                      NOW(), NOW()),
(4, 'Da Nang City & Bay',            'Explore Dragon Bridge, My Khe Beach, and the Golden Bridge at Ba Na Hills.',                                                                               149, 3, 'Đà Nẵng',                     NOW(), NOW()),
(5, 'Hanoi Street Food Walk',        'A guided evening street food tour – Phở, Bún chả, Bánh mì, Egg coffee and more.',                                                                          49, 1, 'Hà Nội',                      NOW(), NOW()),
(5, 'HCMC Hidden Kitchens Tour',     'Half-day culinary exploration through hidden alley kitchens of Saigon with a local chef.',                                                                  59, 1, 'Hồ Chí Minh City',            NOW(), NOW()),
(5, 'Hội An Cooking Class',          'Visit the local morning market, learn to cook 4 traditional Vietnamese dishes in a riverside kitchen.',                                                     79, 1, 'Hội An, Quảng Nam',           NOW(), NOW());

-- ============================================================
-- USERS (password: password123)
-- ============================================================
INSERT INTO users (email, password_hash, role, full_name, phone, created_at, updated_at) VALUES
('alice@example.com',  '$2a$10$wniTUmNDL53jfr78huM71O66fl.UCNDHSYyzFfyqEJbcG6AJQdz1q', 'user',  'Alice Nguyen', '0901234567', NOW(), NOW()),
('bob@example.com',    '$2a$10$wniTUmNDL53jfr78huM71O66fl.UCNDHSYyzFfyqEJbcG6AJQdz1q', 'user',  'Bob Tran',     '0912345678', NOW(), NOW()),
('carol@example.com',  '$2a$10$wniTUmNDL53jfr78huM71O66fl.UCNDHSYyzFfyqEJbcG6AJQdz1q', 'user',  'Carol Le',     '0923456789', NOW(), NOW()),
('david@example.com',  '$2a$10$wniTUmNDL53jfr78huM71O66fl.UCNDHSYyzFfyqEJbcG6AJQdz1q', 'user',  'David Pham',   '0934567890', NOW(), NOW());

-- ============================================================
-- BANK ACCOUNTS
-- ============================================================
INSERT INTO bank_accounts (user_id, bank_name, account_number, account_name, created_at, updated_at) VALUES
(1, 'VietcomBank', '1234567890', 'NGUYEN THI ALICE', NOW(), NOW()),
(2, 'Techcombank',  '0987654321', 'TRAN VAN BOB',     NOW(), NOW()),
(3, 'BIDV',         '1122334455', 'LE THI CAROL',     NOW(), NOW());

-- ============================================================
-- BOOKING REQUESTS
-- ============================================================
INSERT INTO booking_requests (user_id, tour_id, status, booking_date, total_price, payment_method, created_at, updated_at) VALUES
(1, 1,  'paid',      NOW() - INTERVAL '30 days', 299, 'internet_banking', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
(1, 4,  'pending',   NOW() + INTERVAL '10 days',  249, 'internet_banking', NOW(),                      NOW()),
(1, 7,  'completed', NOW() - INTERVAL '60 days', 179, 'credit_card',      NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
(2, 2,  'paid',      NOW() - INTERVAL '15 days', 349, 'internet_banking', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
(2, 10, 'cancelled', NOW() - INTERVAL '5 days',   99, 'internet_banking', NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days'),
(2, 13, 'pending',   NOW() + INTERVAL '7 days',   49, 'cash',             NOW(),                      NOW()),
(3, 3,  'completed', NOW() - INTERVAL '45 days', 199, 'internet_banking', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
(3, 5,  'paid',      NOW() - INTERVAL '10 days', 279, 'internet_banking', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
(3, 8,  'pending',   NOW() + INTERVAL '20 days', 149, 'credit_card',      NOW(),                      NOW()),
(4, 6,  'paid',      NOW() - INTERVAL '20 days', 159, 'internet_banking', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
(4, 9,  'pending',   NOW() + INTERVAL '5 days',  129, 'internet_banking', NOW(),                      NOW()),
(4, 12, 'completed', NOW() - INTERVAL '90 days', 149, 'credit_card',      NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days');

-- ============================================================
-- PAYMENTS (for paid/completed bookings)
-- ============================================================
INSERT INTO payments (booking_request_id, amount, status, transaction_id, created_at, updated_at) VALUES
(1,  299, 'success', 'TXN-20260413-001', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
(3,  179, 'success', 'TXN-20260213-002', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),
(4,  349, 'success', 'TXN-20260428-003', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
(7,  199, 'success', 'TXN-20260328-004', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
(8,  279, 'success', 'TXN-20260503-005', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
(10, 159, 'success', 'TXN-20260423-006', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
(12, 149, 'success', 'TXN-20260212-007', NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days');

-- ============================================================
-- REVIEWS
-- ============================================================
INSERT INTO reviews (user_id, target_type, target_id, content, rating, likes_count, created_at, updated_at) VALUES
-- Phú Quốc
(1, 'tour', 1, 'Absolutely stunning! The beaches are pristine and the snorkeling was world-class. Guide was super knowledgeable.', 5, 12, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
(2, 'tour', 1, 'Great experience overall. The sunset cruise was breathtaking. Will definitely come back!', 5, 8,  NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
(3, 'tour', 1, 'Really enjoyed the island hopping. A bit crowded at peak time but still fantastic.', 4, 5,  NOW() - INTERVAL '3 days',  NOW() - INTERVAL '3 days'),
-- Sapa
(2, 'tour', 4, 'One of the best trips I''ve ever taken. Fansipan summit view was life-changing!', 5, 20, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
(4, 'tour', 4, 'Amazing terraced rice fields. The Hmong village stay was authentic and humbling.', 5, 15, NOW() - INTERVAL '8 days',  NOW() - INTERVAL '8 days'),
-- Hội An
(1, 'tour', 7, 'The lantern festival night was magical. Old Town is charming beyond words.', 5, 18, NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days'),
(3, 'tour', 7, 'Perfect for couples! Romantic riverside dinner was a highlight. Highly recommend.', 5, 10, NOW() - INTERVAL '2 days',  NOW() - INTERVAL '2 days'),
-- Nha Trang
(4, 'tour', 3, 'Vinpearl cable car was thrilling. Mud bath was so relaxing. Good value for money.', 4, 7,  NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days'),
(1, 'tour', 3, 'Great coastal city vibe. Hotel could be upgraded but the activities were excellent.', 3, 3,  NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days'),
-- Hà Nội Food
(2, 'tour', 13, 'Best street food tour ever! The Bún chả and egg coffee were revelations.', 5, 25, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
(3, 'tour', 13, 'Very well guided, knowledgeable about food history. Extremely good value.', 5, 14, NOW() - INTERVAL '6 days',  NOW() - INTERVAL '6 days'),
-- HCMC
(1, 'tour', 10, 'War Remnants Museum is a must. Bui Vien street at night was electric.', 4, 9,  NOW() - INTERVAL '85 days', NOW() - INTERVAL '85 days'),
(4, 'tour', 10, 'Compact but well-packed itinerary. Perfect weekend getaway from work.', 4, 6,  NOW() - INTERVAL '7 days',  NOW() - INTERVAL '7 days'),
-- Hà Giang
(3, 'tour', 5, 'Mã Pí Lèng Pass took my breath away. Literally the most scenic road I''ve ever driven.', 5, 30, NOW() - INTERVAL '7 days',  NOW() - INTERVAL '7 days'),
(2, 'tour', 5, 'Incredible landscapes and very friendly locals. This should be on everyone''s bucket list.', 5, 22, NOW() - INTERVAL '3 days',  NOW() - INTERVAL '3 days');

-- ============================================================
-- COMMENTS
-- ============================================================
INSERT INTO comments (user_id, review_id, parent_comment_id, content, created_at, updated_at) VALUES
(2, 1, NULL, 'Totally agree! The snorkeling spot near the north beach was incredible.', NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days'),
(3, 1, NULL, 'Which guide did you use? Looking to book next month!', NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days'),
(1, 1, 3,    'We used Mr. Minh from Ocean Adventures – highly recommend him!', NOW() - INTERVAL '23 days', NOW() - INTERVAL '23 days'),
(4, 4, NULL, 'Fansipan in cloud is also beautiful even if you can''t see the view!', NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days'),
(1, 6, NULL, 'The lanterns on the river at full moon night is something else entirely.', NOW() - INTERVAL '54 days', NOW() - INTERVAL '54 days'),
(4, 10,NULL, 'Egg coffee changed my life. I dream about it now 😄',                    NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days'),
(1, 14,NULL, 'Did you do the full loop or just the highlights?',                        NOW() - INTERVAL '6 days',  NOW() - INTERVAL '6 days'),
(3, 14,2,    'We did the full 4-day loop. Don''t miss the Dong Van rocky plateau!',     NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days');

-- ============================================================
-- LIKES
-- ============================================================
INSERT INTO likes (user_id, review_id, created_at) VALUES
(1, 4,  NOW() - INTERVAL '19 days'),
(1, 10, NOW() - INTERVAL '11 days'),
(1, 14, NOW() - INTERVAL '6 days'),
(2, 6,  NOW() - INTERVAL '53 days'),
(2, 7,  NOW() - INTERVAL '1 days'),
(2, 14, NOW() - INTERVAL '2 days'),
(3, 1,  NOW() - INTERVAL '24 days'),
(3, 4,  NOW() - INTERVAL '18 days'),
(3, 10, NOW() - INTERVAL '10 days'),
(4, 1,  NOW() - INTERVAL '24 days'),
(4, 6,  NOW() - INTERVAL '52 days'),
(4, 10, NOW() - INTERVAL '9 days');
