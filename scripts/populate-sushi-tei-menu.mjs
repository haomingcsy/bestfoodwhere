import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BRAND_MENU_ID = '3b8f7a2a-7476-4fc2-a360-34397d5fd149';

const menuData = [
  {
    name: 'Chutoro Feast',
    sort_order: 1,
    items: [
      { name: 'Maguro Trio Temari', price: 'S$16.80', sort_order: 1 },
      { name: 'Chutoro Sashimi', price: 'S$21.80', sort_order: 2 },
      { name: 'Chutoro Nigiri (1pc)', price: 'S$9.80', sort_order: 3 },
      { name: 'Chutoro Gunkan', price: 'S$9.80', sort_order: 4 },
      { name: 'Maguro Zukushi (3 Kinds)', price: 'S$46.80', sort_order: 5 },
      { name: 'Aburi Chutoro Roll', price: 'S$23.80', sort_order: 6 },
      { name: 'Sanshoku Maguro Don', price: 'S$32.80', sort_order: 7 },
      { name: 'Chutoro Carpaccio', price: 'S$18.80', sort_order: 8 },
    ],
  },
  {
    name: 'Bento',
    sort_order: 2,
    items: [
      { name: 'Teriyaki Chicken Bento', price: 'S$9.50', sort_order: 1 },
      { name: 'Buta Belly Bento', price: 'S$13.00', sort_order: 2 },
      { name: 'Kaisen Tempura Bento', price: 'S$14.00', sort_order: 3 },
      { name: 'Yakiniku Bento', price: 'S$16.00', sort_order: 4 },
      { name: 'Unagi Bento', price: 'S$17.00', sort_order: 5 },
    ],
  },
  {
    name: 'Party Packs',
    sort_order: 3,
    items: [
      { name: 'Party Pack A (72 pieces)', price: 'S$88.80', sort_order: 1 },
      { name: 'Party Pack B (64 pieces)', price: 'S$83.50', sort_order: 2 },
      { name: 'Party Pack C (60 pieces)', price: 'S$71.50', sort_order: 3 },
      { name: 'Party Pack D (32 pieces)', price: 'S$67.80', sort_order: 4 },
      { name: 'Unagi Lover (26 pieces)', price: 'S$64.50', sort_order: 5 },
      { name: 'Salmon Lover (30 pieces)', price: 'S$50.80', sort_order: 6 },
      { name: 'Mini Pack A (18 pieces)', price: 'S$21.80', sort_order: 7 },
      { name: 'Mini Pack B (12 pieces)', price: 'S$24.80', sort_order: 8 },
      { name: 'Mini Pack C (8 pieces)', price: 'S$20.80', sort_order: 9 },
      { name: 'Sashimi A', price: 'S$50.80', sort_order: 10 },
      { name: 'Sashimi B', price: 'S$84.50', sort_order: 11 },
    ],
  },
  {
    name: 'Appetizers',
    sort_order: 4,
    items: [
      { name: 'Pitan Tofu', price: 'S$6.80', sort_order: 1 },
      { name: 'Chuka Iidako', price: 'S$6.50', sort_order: 2 },
      { name: 'Chuka Chinmi', price: 'S$6.50', sort_order: 3 },
      { name: 'Hanasaki Ika', price: 'S$6.50', sort_order: 4 },
      { name: 'Chuka Wakame', price: 'S$6.50', sort_order: 5 },
      { name: 'Ikura Shoyuzuke', price: 'S$9.80', sort_order: 6 },
      { name: 'Lobster Salad', price: 'S$8.80', sort_order: 7 },
      { name: 'Edamame', price: 'S$5.80', sort_order: 8 },
      { name: 'Chuka Kurage', price: 'S$6.50', sort_order: 9 },
      { name: 'Tako Wasabi', price: 'S$6.80', sort_order: 10 },
      { name: 'Salmon/Maguro Natto', price: 'S$6.80', sort_order: 11 },
      { name: 'Spicy Hotate', price: 'S$6.50', sort_order: 12 },
      { name: 'Organic Hiyayakko', price: 'S$5.80', sort_order: 13 },
      { name: 'Onsen Tamago', price: 'S$2.30', sort_order: 14 },
      { name: 'Ankimo Ponzu', price: 'S$8.50', sort_order: 15 },
    ],
  },
  {
    name: 'Special Rolls',
    sort_order: 5,
    items: [
      { name: 'Aburi Salmon Roll', price: 'S$15.80', sort_order: 1 },
      { name: 'Spicy Mentai Spider Roll', price: 'S$17.80', sort_order: 2 },
      { name: 'Dragon Roll', price: 'S$17.80', sort_order: 3 },
      { name: 'Phoenix Roll', price: 'S$22.80', sort_order: 4 },
      { name: 'Rainbow Roll', price: 'S$15.80', sort_order: 5 },
      { name: 'Special Unagi Roll', price: 'S$24.80', sort_order: 6 },
      { name: 'Salmon Oyako Spicy Roll', price: 'S$13.80', sort_order: 7 },
      { name: 'Double Unagi Roll', price: 'S$16.80', sort_order: 8 },
      { name: 'Kani Mentai Mayo Roll', price: 'S$11.80', sort_order: 9 },
      { name: 'Lobster Salad Roll', price: 'S$12.80', sort_order: 10 },
      { name: 'Golden Roll', price: 'S$18.80', sort_order: 11 },
    ],
  },
  {
    name: 'Shirobuta Pork Specialities',
    sort_order: 6,
    items: [
      { name: 'Hokkaido Shirobuta Pork Katsu', price: 'S$14.80', sort_order: 1 },
      { name: 'Kagoshima Wagyu Sushi (1pc)', price: 'S$6.80', sort_order: 2 },
      { name: 'Kagoshima Pork Belly Sushi', price: 'S$5.80', sort_order: 3 },
      { name: 'Kagoshima Pork Belly Temaki', price: 'S$5.80', sort_order: 4 },
      { name: 'Hokkaido Shirobuta Pork Belly Salad', price: 'S$12.80', sort_order: 5 },
      { name: 'Kagoshima Pork Belly Tamago Toji', price: 'S$11.80', sort_order: 6 },
      { name: 'Kagoshima Wagyu Saikoro Steak (120g)', price: 'S$39.80', sort_order: 7 },
      { name: 'Kagoshima Wagyu Steak', price: 'S$39.80', sort_order: 8 },
      { name: 'Kagoshima Wagyu Shabu Shabu', price: 'S$35.80', sort_order: 9 },
      { name: 'Kagoshima Wagyu Sukiyaki', price: 'S$36.80', sort_order: 10 },
      { name: 'Kagoshima Pork Shabu Shabu', price: 'S$18.80', sort_order: 11 },
      { name: 'Kagoshima Pork Sukiyaki', price: 'S$19.80', sort_order: 12 },
      { name: 'Hokkaido Shirobuta Pork Belly Don', price: 'S$12.80', sort_order: 13 },
      { name: 'Hokkaido Shirobuta Pork Katsu Don', price: 'S$16.80', sort_order: 14 },
      { name: 'Hokkaido Shirobuta Pork Katsu Curry Rice', price: 'S$18.80', sort_order: 15 },
      { name: 'Hokkaido Shirobuta Pork Belly Curry Rice', price: 'S$15.80', sort_order: 16 },
    ],
  },
  {
    name: 'Sashimi',
    sort_order: 7,
    items: [
      { name: 'Rishiri (5 Kinds)', price: 'S$58.80', sort_order: 1 },
      { name: 'Asama (3 Kinds)', price: 'S$23.00', sort_order: 2 },
      { name: 'Salmon Zukushi (3 Kinds)', price: 'S$21.80', sort_order: 3 },
      { name: 'Tokachi (4 Kinds)', price: 'S$44.80', sort_order: 4 },
      { name: 'Yufu (4 Kinds)', price: 'S$28.80', sort_order: 5 },
      { name: 'Suo (5 Kinds)', price: 'S$38.80', sort_order: 6 },
      { name: 'Biei (5 Kinds)', price: 'S$53.80', sort_order: 7 },
      { name: 'Kise (5 Kinds)', price: 'S$54.80', sort_order: 8 },
      { name: 'Scallop & Salmon Wafu Carpaccio', price: 'S$15.80', sort_order: 9 },
      { name: 'Salmon Wafu Carpaccio', price: 'S$13.80', sort_order: 10 },
      { name: 'Salmon Sashimi', price: 'S$10.80', sort_order: 11 },
      { name: 'Amaebi Sashimi', price: 'S$16.80', sort_order: 12 },
      { name: 'Nama Hotate Sashimi', price: 'S$14.80', sort_order: 13 },
      { name: 'Hokkigai Sashimi', price: 'S$10.80', sort_order: 14 },
      { name: 'Uni (100g)', price: 'S$95.80', sort_order: 15 },
      { name: 'Maguro Sashimi', price: 'S$15.80', sort_order: 16 },
      { name: 'Ootoro Sashimi', price: 'S$38.80', sort_order: 17 },
      { name: 'Hamachi Sashimi', price: 'S$14.80', sort_order: 18 },
      { name: 'Mekajiki Sashimi', price: 'S$12.80', sort_order: 19 },
    ],
  },
  {
    name: 'Salads',
    sort_order: 8,
    items: [
      { name: 'Sashimi Salad', price: 'S$12.80', sort_order: 1 },
      { name: 'Kani Avocado Salad', price: 'S$11.80', sort_order: 2 },
      { name: 'Corn Salad', price: 'S$8.80', sort_order: 3 },
      { name: 'Wakame Salad', price: 'S$9.80', sort_order: 4 },
      { name: 'Seafood Salad', price: 'S$12.80', sort_order: 5 },
      { name: 'Tokusen Salad', price: 'S$17.80', sort_order: 6 },
      { name: 'Yakiniku Salad', price: 'S$14.80', sort_order: 7 },
    ],
  },
  {
    name: 'Sushi Moriawase',
    sort_order: 9,
    items: [
      { name: 'Hodaka (8pcs)', price: 'S$19.80', sort_order: 1 },
      { name: 'Kirishima (18pcs)', price: 'S$32.80', sort_order: 2 },
      { name: 'Unagi Yoridori (10pcs)', price: 'S$24.80', sort_order: 3 },
      { name: 'Seto (6pcs)', price: 'S$20.80', sort_order: 4 },
      { name: 'Salmon Yoridori (9pcs)', price: 'S$12.80', sort_order: 5 },
      { name: 'Maguro Yoridori (9pcs)', price: 'S$18.80', sort_order: 6 },
    ],
  },
  {
    name: 'Nigiri Sushi',
    sort_order: 10,
    items: [
      { name: 'Ootoro Sushi (1pc)', price: 'S$9.80', sort_order: 1 },
      { name: 'Aburi Ootoro Sushi (1pc)', price: 'S$10.00', sort_order: 2 },
      { name: 'Hana Salmon Sushi', price: 'S$7.80', sort_order: 3 },
      { name: 'Salmon Belly Sushi', price: 'S$4.80', sort_order: 4 },
      { name: 'Aburi Salmon Belly Sushi', price: 'S$5.30', sort_order: 5 },
      { name: 'Mekajiki Sushi', price: 'S$5.80', sort_order: 6 },
    ],
  },
  {
    name: 'Gunkan Sushi',
    sort_order: 11,
    items: [
      { name: 'Uni Ikura Sushi (1pc)', price: 'S$10.80', sort_order: 1 },
      { name: 'Uni Sushi (1pc)', price: 'S$13.80', sort_order: 2 },
      { name: 'Negitoro Sushi', price: 'S$6.50', sort_order: 3 },
      { name: 'Ikura Sushi', price: 'S$6.50', sort_order: 4 },
      { name: 'Ankimo Sushi', price: 'S$5.80', sort_order: 5 },
      { name: 'Chuka Chinmi Sushi', price: 'S$4.80', sort_order: 6 },
      { name: 'Chuka Iidako Sushi', price: 'S$4.80', sort_order: 7 },
      { name: 'Chuka Kurage Sushi', price: 'S$4.80', sort_order: 8 },
      { name: 'Salmon Ikura Sushi', price: 'S$5.80', sort_order: 9 },
      { name: 'Spicy Hotate Sushi', price: 'S$4.80', sort_order: 10 },
      { name: 'Ebikko Sushi', price: 'S$3.30', sort_order: 11 },
      { name: 'Tuna Salad Sushi', price: 'S$4.20', sort_order: 12 },
      { name: 'Hanasaki Ika Sushi', price: 'S$4.80', sort_order: 13 },
      { name: 'Kani Corn Sushi', price: 'S$3.30', sort_order: 14 },
      { name: 'Kizami Unagi Sushi', price: 'S$6.50', sort_order: 15 },
      { name: 'Lobster Salad Sushi', price: 'S$6.50', sort_order: 16 },
      { name: 'Natto Sushi', price: 'S$4.20', sort_order: 17 },
      { name: 'Tobikko Sushi', price: 'S$4.80', sort_order: 18 },
      { name: 'Chuka Wakame Sushi', price: 'S$4.80', sort_order: 19 },
      { name: 'Corn Sushi', price: 'S$3.30', sort_order: 20 },
    ],
  },
  {
    name: 'Temaki',
    sort_order: 12,
    items: [
      { name: 'Negitoro Temaki', price: 'S$6.80', sort_order: 1 },
      { name: 'Salmon Ikura Temaki', price: 'S$6.80', sort_order: 2 },
      { name: 'Ootoro Temaki', price: 'S$10.80', sort_order: 3 },
      { name: 'California Temaki', price: 'S$4.80', sort_order: 4 },
      { name: 'Ikura Temaki', price: 'S$6.50', sort_order: 5 },
      { name: 'Ebi Tempura Temaki', price: 'S$5.80', sort_order: 6 },
      { name: 'Unagi Temaki', price: 'S$7.50', sort_order: 7 },
      { name: 'Salmon Skin Temaki', price: 'S$6.80', sort_order: 8 },
      { name: 'Uni Ikura Temaki', price: 'S$11.80', sort_order: 9 },
      { name: 'Uni Temaki', price: 'S$15.80', sort_order: 10 },
      { name: 'Nama Hotate Temaki', price: 'S$5.80', sort_order: 11 },
      { name: 'Salmon Avocado Temaki', price: 'S$5.50', sort_order: 12 },
      { name: 'Baked Salmon Temaki', price: 'S$4.80', sort_order: 13 },
      { name: 'Spicy Maguro Temaki', price: 'S$7.30', sort_order: 14 },
      { name: 'Spicy Salmon Temaki', price: 'S$5.00', sort_order: 15 },
      { name: 'Lobster Salad Temaki', price: 'S$6.50', sort_order: 16 },
      { name: 'Kappa Temaki', price: 'S$2.80', sort_order: 17 },
      { name: 'Spicy Tuna Salad Temaki', price: 'S$5.00', sort_order: 18 },
      { name: 'Tuna Salad Temaki', price: 'S$4.50', sort_order: 19 },
      { name: 'Maguro Temaki', price: 'S$6.50', sort_order: 20 },
      { name: 'Salmon Temaki', price: 'S$4.50', sort_order: 21 },
      { name: 'Unagi Avocado Temaki', price: 'S$8.50', sort_order: 22 },
      { name: 'Avocado Temaki', price: 'S$4.20', sort_order: 23 },
      { name: 'Natto Temaki', price: 'S$4.20', sort_order: 24 },
      { name: 'Tamago Temaki', price: 'S$3.30', sort_order: 25 },
      { name: 'Kanikama Temaki', price: 'S$4.50', sort_order: 26 },
      { name: 'Soft Shell Crab Temaki', price: 'S$7.30', sort_order: 27 },
    ],
  },
  {
    name: 'Makimono',
    sort_order: 13,
    items: [
      { name: 'Mini California Maki', price: 'S$7.50', sort_order: 1 },
      { name: 'Negitoro Maki', price: 'S$6.50', sort_order: 2 },
      { name: 'Ebikko Tempura Maki', price: 'S$7.50', sort_order: 3 },
      { name: 'Salmon Avocado Maki', price: 'S$5.80', sort_order: 4 },
      { name: 'Ebi Tempura Maki', price: 'S$5.80', sort_order: 5 },
      { name: 'Salmon Skin Maki', price: 'S$7.50', sort_order: 6 },
      { name: 'Natto Maki', price: 'S$4.20', sort_order: 7 },
      { name: 'Lobster Salad Tobikko Maki', price: 'S$7.80', sort_order: 8 },
      { name: 'Unatama Tobikko Maki', price: 'S$7.80', sort_order: 9 },
      { name: 'Spicy Maguro Maki', price: 'S$7.50', sort_order: 10 },
      { name: 'Ebikko Avocado Maki', price: 'S$6.50', sort_order: 11 },
      { name: 'Unakyu Maki', price: 'S$7.50', sort_order: 12 },
      { name: 'Salmon Maki', price: 'S$4.20', sort_order: 13 },
      { name: 'Baked Salmon Maki', price: 'S$4.80', sort_order: 14 },
      { name: 'Spicy Salmon Maki', price: 'S$4.80', sort_order: 15 },
      { name: 'Soft Shell Crab Maki', price: 'S$7.80', sort_order: 16 },
      { name: 'Avocado Maki', price: 'S$4.20', sort_order: 17 },
      { name: 'Kanikama Maki', price: 'S$4.20', sort_order: 18 },
      { name: 'Tamago Maki', price: 'S$3.30', sort_order: 19 },
      { name: 'Oshinko Maki', price: 'S$3.30', sort_order: 20 },
      { name: 'Kappa Maki', price: 'S$3.30', sort_order: 21 },
      { name: 'Tekka Maki', price: 'S$6.50', sort_order: 22 },
    ],
  },
  {
    name: 'Wanmono',
    sort_order: 14,
    items: [
      { name: 'Asari Sakamushi', price: 'S$14.80', sort_order: 1 },
      { name: 'Chawanmushi', price: 'S$5.50', sort_order: 2 },
      { name: 'Unagi Chawanmushi', price: 'S$9.80', sort_order: 3 },
      { name: 'Zuwai Gani Chawanmushi', price: 'S$8.00', sort_order: 4 },
      { name: 'Ikura Chawanmushi', price: 'S$8.80', sort_order: 5 },
      { name: 'Salmon Belly Miso Soup', price: 'S$10.50', sort_order: 6 },
      { name: 'Yasai Miso Soup', price: 'S$7.50', sort_order: 7 },
      { name: 'Asari Miso Soup', price: 'S$12.80', sort_order: 8 },
      { name: 'Miso Soup', price: 'S$2.80', sort_order: 9 },
    ],
  },
  {
    name: 'Tempura',
    sort_order: 15,
    items: [
      { name: 'Tempura Moriawase', price: 'S$11.80', sort_order: 1 },
      { name: 'Hanasaki Ika Tempura', price: 'S$9.80', sort_order: 2 },
      { name: 'Yasai Tempura', price: 'S$9.00', sort_order: 3 },
      { name: 'Ebi Tempura', price: 'S$12.80', sort_order: 4 },
      { name: 'Ebi & Yasai Kakiage', price: 'S$7.80', sort_order: 5 },
    ],
  },
  {
    name: 'Agemono',
    sort_order: 16,
    items: [
      { name: 'Butterfly Shrimp', price: 'S$5.80', sort_order: 1 },
      { name: 'Hokkaido Corn Cream Croquette', price: 'S$9.80', sort_order: 2 },
      { name: 'Kani Croquette', price: 'S$9.80', sort_order: 3 },
      { name: 'Potato Croquette', price: 'S$4.80', sort_order: 4 },
      { name: 'Curry Croquette', price: 'S$8.80', sort_order: 5 },
      { name: 'Agedashi Tofu', price: 'S$5.80', sort_order: 6 },
      { name: 'Big Takoyaki', price: 'S$7.80', sort_order: 7 },
      { name: 'Soft Shell Crab', price: 'S$15.80', sort_order: 8 },
      { name: 'Nanban Chicken', price: 'S$11.80', sort_order: 9 },
      { name: 'Chicken Karaage', price: 'S$8.80', sort_order: 10 },
      { name: 'Chicken Katsu', price: 'S$10.80', sort_order: 11 },
    ],
  },
  {
    name: 'Nabemono',
    sort_order: 17,
    items: [
      { name: 'Sukiyaki', price: 'S$19.80', sort_order: 1 },
      { name: 'Mikan Sukiyaki', price: 'S$21.80', sort_order: 2 },
      { name: 'Unagi Tamago Toji', price: 'S$18.80', sort_order: 3 },
      { name: 'Gyu Tamago Toji', price: 'S$13.80', sort_order: 4 },
      { name: 'Kaisen Yosenabe', price: 'S$14.80', sort_order: 5 },
      { name: 'Salmon Yosenabe', price: 'S$16.80', sort_order: 6 },
    ],
  },
  {
    name: 'Yakimono',
    sort_order: 18,
    items: [
      { name: 'Ebi Mentaiyaki', price: 'S$10.50', sort_order: 1 },
      { name: 'Unagi Kabayaki', price: 'S$29.80', sort_order: 2 },
      { name: 'Hotate Mentaiyaki', price: 'S$12.80', sort_order: 3 },
      { name: 'Homemade Meat Gyoza', price: 'S$8.80', sort_order: 4 },
      { name: 'Dashimaki Tamago', price: 'S$6.80', sort_order: 5 },
      { name: 'Aburi Iberico Pork Cheek', price: 'S$13.80', sort_order: 6 },
      { name: 'Teriyaki Steak With Garlic', price: 'S$15.80', sort_order: 7 },
      { name: 'Ika Sugata Mentaiyaki', price: 'S$16.80', sort_order: 8 },
      { name: 'Ika Sugata Shio/Teriyaki', price: 'S$14.80', sort_order: 9 },
      { name: 'Gyuniku Roll', price: 'S$14.80', sort_order: 10 },
      { name: 'Salmon Enoki Roll', price: 'S$9.80', sort_order: 11 },
      { name: 'Salmon Head Shio (Half)', price: 'S$9.80', sort_order: 12 },
      { name: 'Saba Shio/Teriyaki', price: 'S$12.80', sort_order: 13 },
      { name: 'Shishamo', price: 'S$5.80', sort_order: 14 },
      { name: 'Salmon Shio/Teriyaki', price: 'S$12.80', sort_order: 15 },
      { name: 'Gindara Saikyoyaki', price: 'S$17.80', sort_order: 16 },
      { name: 'Hamachi Kama Shio', price: 'S$17.80', sort_order: 17 },
      { name: 'Salmon Mentaiyaki', price: 'S$16.80', sort_order: 18 },
      { name: 'Teriyaki Chicken', price: 'S$9.80', sort_order: 19 },
      { name: 'Yakitori', price: 'S$7.80', sort_order: 20 },
      { name: 'Yasai Itame', price: 'S$7.50', sort_order: 21 },
      { name: 'Asari Butter', price: 'S$15.80', sort_order: 22 },
    ],
  },
  {
    name: 'Noodles',
    sort_order: 19,
    items: [
      { name: 'Kaisen Ramen', price: 'S$17.80', sort_order: 1 },
      { name: 'Kitsune Udon/Soba/Ramen', price: 'S$11.80', sort_order: 2 },
      { name: 'Udon/Soba', price: 'S$9.80', sort_order: 3 },
      { name: 'Nabeyaki Udon', price: 'S$12.80', sort_order: 4 },
      { name: 'Tonkotsu Udon/Soba/Ramen', price: 'S$9.80', sort_order: 5 },
      { name: 'Spicy Miso Udon/Soba/Ramen', price: 'S$9.80', sort_order: 6 },
      { name: 'Chasyu Ramen', price: 'S$14.80', sort_order: 7 },
      { name: 'Onsen Tamago Udon/Soba/Ramen', price: 'S$11.80', sort_order: 8 },
      { name: 'Niku Udon/Soba/Ramen', price: 'S$15.80', sort_order: 9 },
      { name: 'Hotate Tamago Toji Udon/Soba/Ramen', price: 'S$13.80', sort_order: 10 },
      { name: 'Yaki Udon/Soba', price: 'S$12.80', sort_order: 11 },
      { name: 'Hiyashi Chuka (Original/Sesame)', price: 'S$13.80', sort_order: 12 },
      { name: 'Chicken Tamago Toji Udon/Soba/Ramen', price: 'S$13.80', sort_order: 13 },
      { name: 'Zaru Udon', price: 'S$9.80', sort_order: 14 },
      { name: 'Zaru Cha Soba', price: 'S$9.80', sort_order: 15 },
      { name: 'Zaru Soba', price: 'S$9.80', sort_order: 16 },
      { name: 'Kakiage Udon/Soba/Ramen', price: 'S$14.80', sort_order: 17 },
      { name: 'Tenzaru Udon/Soba/Cha Soba', price: 'S$15.80', sort_order: 18 },
      { name: 'Tempura Udon/Soba/Ramen', price: 'S$15.80', sort_order: 19 },
    ],
  },
  {
    name: 'Donmono',
    sort_order: 20,
    items: [
      { name: 'Salmon Ikura Don', price: 'S$19.80', sort_order: 1 },
      { name: 'Una Bara Chirashi Don', price: 'S$22.80', sort_order: 2 },
      { name: 'Tokusen Ryoshi Don', price: 'S$36.80', sort_order: 3 },
      { name: 'Negitoro Don', price: 'S$14.80', sort_order: 4 },
      { name: 'Maguro Don', price: 'S$18.80', sort_order: 5 },
      { name: 'Bara Chirashi Don', price: 'S$14.80', sort_order: 6 },
      { name: 'Aburi Mentai Don', price: 'S$17.80', sort_order: 7 },
      { name: 'Jo Unagi Don', price: 'S$30.80', sort_order: 8 },
      { name: 'Unagi Hitsumabushi', price: 'S$18.80', sort_order: 9 },
      { name: 'Tendon', price: 'S$13.80', sort_order: 10 },
      { name: 'Ebi & Yasai Kakiage Don', price: 'S$14.80', sort_order: 11 },
      { name: 'Aburi Iberico Pork Cheek Don', price: 'S$16.80', sort_order: 12 },
      { name: 'Chasyu Don', price: 'S$14.80', sort_order: 13 },
      { name: 'Yakiniku Don', price: 'S$14.80', sort_order: 14 },
      { name: 'Yakitori Don', price: 'S$12.80', sort_order: 15 },
      { name: 'Kaisen Ikura Fried Rice', price: 'S$15.80', sort_order: 16 },
      { name: 'Chicken Katsu Don', price: 'S$13.80', sort_order: 17 },
      { name: 'Fried Garlic Rice', price: 'S$9.80', sort_order: 18 },
      { name: 'Oyako Don', price: 'S$12.80', sort_order: 19 },
      { name: 'Ebi Don', price: 'S$12.80', sort_order: 20 },
      { name: 'Unatama Don', price: 'S$19.80', sort_order: 21 },
      { name: 'Beef Curry Rice', price: 'S$16.80', sort_order: 22 },
      { name: 'Chicken Katsu Curry Rice', price: 'S$15.80', sort_order: 23 },
      { name: 'Chicken Curry Rice', price: 'S$12.80', sort_order: 24 },
      { name: 'Karaage Curry Rice', price: 'S$13.80', sort_order: 25 },
      { name: 'Yasai Curry Rice', price: 'S$12.80', sort_order: 26 },
      { name: 'Steamed Rice', price: 'S$2.00', sort_order: 27 },
      { name: 'Sushi Rice', price: 'S$2.00', sort_order: 28 },
    ],
  },
  {
    name: 'Desserts',
    sort_order: 21,
    items: [
      { name: 'Orange Jelly', price: 'S$4.00', sort_order: 1 },
      { name: 'Grape Jelly', price: 'S$4.00', sort_order: 2 },
    ],
  },
  {
    name: 'Drinks',
    sort_order: 22,
    items: [
      { name: 'Coke', price: 'S$3.90', sort_order: 1 },
      { name: 'Coke No Sugar', price: 'S$3.90', sort_order: 2 },
      { name: 'Sprite', price: 'S$3.90', sort_order: 3 },
      { name: 'Ice Lemon Tea', price: 'S$3.90', sort_order: 4 },
      { name: 'Qoo White Grape', price: 'S$3.90', sort_order: 5 },
      { name: 'Suntory Oolong Tea', price: 'S$3.90', sort_order: 6 },
      { name: 'Vida C Lemon', price: 'S$3.90', sort_order: 7 },
    ],
  },
];

async function main() {
  console.log('=== Sushi Tei Menu Population Script ===\n');

  // Step 0: Verify the brand_menu exists
  const { data: brandMenu, error: bmError } = await supabase
    .from('brand_menus')
    .select('id')
    .eq('id', BRAND_MENU_ID)
    .single();

  if (bmError || !brandMenu) {
    console.error('brand_menu not found:', bmError?.message);
    process.exit(1);
  }
  console.log(`Found brand_menu: ${BRAND_MENU_ID}`);

  // Step 1: Clean up any existing categories and items for this brand_menu
  const { data: existingCats } = await supabase
    .from('menu_categories')
    .select('id')
    .eq('brand_menu_id', BRAND_MENU_ID);

  if (existingCats && existingCats.length > 0) {
    const catIds = existingCats.map((c) => c.id);
    console.log(`Cleaning up ${catIds.length} existing categories and their items...`);
    // Delete items first
    const { error: delItemsErr } = await supabase
      .from('menu_items')
      .delete()
      .in('category_id', catIds);
    if (delItemsErr) {
      console.error('Error deleting existing items:', delItemsErr.message);
      process.exit(1);
    }
    // Delete categories
    const { error: delCatsErr } = await supabase
      .from('menu_categories')
      .delete()
      .eq('brand_menu_id', BRAND_MENU_ID);
    if (delCatsErr) {
      console.error('Error deleting existing categories:', delCatsErr.message);
      process.exit(1);
    }
    console.log('Cleanup complete.');
  }

  // Step 2: Insert categories
  const categoryRows = menuData.map((cat) => ({
    brand_menu_id: BRAND_MENU_ID,
    name: cat.name,
    sort_order: cat.sort_order,
  }));

  const { data: insertedCategories, error: catError } = await supabase
    .from('menu_categories')
    .insert(categoryRows)
    .select('id, name, sort_order');

  if (catError) {
    console.error('Error inserting categories:', catError.message);
    process.exit(1);
  }

  console.log(`\nInserted ${insertedCategories.length} categories.`);

  // Build a map from category name to id
  const catNameToId = {};
  for (const cat of insertedCategories) {
    catNameToId[cat.name] = cat.id;
  }

  // Step 3: Insert items
  let totalItems = 0;
  const allItemRows = [];

  for (const cat of menuData) {
    const categoryId = catNameToId[cat.name];
    if (!categoryId) {
      console.error(`No category ID found for: ${cat.name}`);
      process.exit(1);
    }
    for (const item of cat.items) {
      allItemRows.push({
        category_id: categoryId,
        brand_menu_id: BRAND_MENU_ID,
        name: item.name,
        description: item.description || null,
        price: item.price,
        original_image_url: item.original_image_url || null,
        cdn_image_url: item.cdn_image_url || null,
        sort_order: item.sort_order,
      });
    }
  }

  // Insert in batches of 100 to avoid payload limits
  const BATCH_SIZE = 100;
  for (let i = 0; i < allItemRows.length; i += BATCH_SIZE) {
    const batch = allItemRows.slice(i, i + BATCH_SIZE);
    const { error: itemError } = await supabase
      .from('menu_items')
      .insert(batch);
    if (itemError) {
      console.error(`Error inserting items batch ${Math.floor(i / BATCH_SIZE) + 1}:`, itemError.message);
      process.exit(1);
    }
    totalItems += batch.length;
    console.log(`  Inserted items batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} items`);
  }

  console.log(`\nTotal items inserted: ${totalItems}`);

  // Step 4: Update brand_menus metadata
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('brand_menus')
    .update({
      menu_item_count: totalItems,
      has_prices: true,
      scrape_status: 'completed',
      data_source: 'manual',
      menu_source_type: 'manual',
      last_scraped_at: now,
      last_menu_update_at: now,
      recommendations: ['Aburi Salmon Roll', 'Salmon Sashimi', 'Dragon Roll', 'Unagi Hitsumabushi', 'Chawanmushi'],
      enrichment_score: 1.0,
    })
    .eq('id', BRAND_MENU_ID);

  if (updateError) {
    console.error('Error updating brand_menus:', updateError.message);
    process.exit(1);
  }

  console.log('\nUpdated brand_menus metadata:');
  console.log(`  menu_item_count: ${totalItems}`);
  console.log('  has_prices: true');
  console.log("  scrape_status: 'completed'");
  console.log("  data_source: 'third_party'");
  console.log("  menu_source_type: 'aggregator'");
  console.log(`  last_scraped_at: ${now}`);
  console.log(`  last_menu_update_at: ${now}`);
  console.log('  recommendations: [Aburi Salmon Roll, Salmon Sashimi, Dragon Roll, Unagi Hitsumabushi, Chawanmushi]');
  console.log('  enrichment_score: 1.0');

  // Final summary
  console.log('\n=== SUMMARY ===');
  console.log(`Categories inserted: ${insertedCategories.length}`);
  console.log(`Menu items inserted: ${totalItems}`);
  console.log('Categories:');
  for (const cat of menuData) {
    console.log(`  ${cat.sort_order}. ${cat.name} (${cat.items.length} items)`);
  }
  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
