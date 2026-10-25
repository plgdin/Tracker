import type { Product, Category, Order, StoreSettings } from '../types/ecommerce';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-dry-fruits',
    name: 'Dry Fruits, Nuts & Seeds',
    slug: 'dry-fruits-nuts-seeds',
    description: 'Premium international Queen Kalmi dates, Medjoul dates, Mamra almonds, cashews, pistachios, figs, and superseeds.',
    imageUrl: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-ahhl2flolc.jpg',
    color: '#EAF05C',
    iconName: 'Cookie',
    displayOrder: 1,
  },

  {
    id: 'cat-tools-equipment',
    name: 'Baking Tools & Equipment',
    slug: 'tools-equipment',
    description: 'Revolving turn tables, offset spatulas, stainless steel scrapers, piping tips and digital weighing scales.',
    imageUrl: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-xvwotvyf9p.jpg',
    color: '#FF5C34', // Orange Topaze
    iconName: 'Wrench',
    displayOrder: 1,
  },
  {
    id: 'cat-moulds-cutters',
    name: 'Cake Moulds & Bakeware',
    slug: 'moulds-cutters',
    description: 'Silicone geometric moulds, Kanchan Udyog aluminium cake pans, muffin tins and plunger cutter sets.',
    imageUrl: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-gfxnhuf12m.jpg',
    color: '#D7EFFF', // Cool Blue
    iconName: 'Layers',
    displayOrder: 2,
  },
  {
    id: 'cat-baking-ingredients',
    name: 'Baking Raw Materials & Ingredients',
    slug: 'baking-ingredients',
    description: 'Dark/milk/white compound chocolate slabs, couverture callets, cocoa powder, whipped cream, dried cranberries and nuts.',
    imageUrl: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-ahhl2flolc.jpg',
    color: '#FF5C34', // Orange Topaze
    iconName: 'Cookie',
    displayOrder: 3,
  },
  {
    id: 'cat-packaging-supplies',
    name: 'Boxes, Boards & Packaging',
    slug: 'packaging-supplies',
    description: 'Tall transparent window cake boxes, gold masonite cake boards, cupcake inserts and greaseproof wraps.',
    imageUrl: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-96i8b18arz.jpg',
    color: '#351E28', // Cassis
    iconName: 'Package',
    displayOrder: 4,
  },
  {
    id: 'cat-cake-decoration',
    name: 'Cake Decoration & Nozzles',
    slug: 'cake-decoration',
    description: 'Russian piping nozzles, luster dust, cake stencils, acrylic birthday toppers and sugar pearls.',
    imageUrl: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-85hi5gmdrc.jpg',
    color: '#EAF05C', // Wasabi
    iconName: 'Sparkles',
    displayOrder: 5,
  },
  {
    id: 'cat-colours-flavours',
    name: 'Colours, Essences & Flavours',
    slug: 'colours-flavours',
    description: 'Magic Colours concentrated gel food colours, oil candy pigments, pure vanilla extracts and baking emulsions.',
    imageUrl: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-s550i6yh1y.jpg',
    color: '#AEBBA0', // Vert Sauge
    iconName: 'Palette',
    displayOrder: 6,
  },
  {
    id: 'cat-creams-frosting',
    name: 'Whipping Creams & Frosting',
    slug: 'creams-frosting',
    description: 'Non-dairy whipping cream toppings, buttercream bases, mirror glazes, and pastry fillings.',
    imageUrl: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-ahhl2flolc.jpg',
    color: '#D7EFFF', // Cool Blue
    iconName: 'IceCream',
    displayOrder: 7,
  },
  {
    id: 'cat-cake-toppers',
    name: 'Cake Toppers & Accents',
    slug: 'cake-toppers',
    description: 'Acrylic birthday toppers, anniversary figurines, dried floral bundles, and wafer decorations.',
    imageUrl: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-85hi5gmdrc.jpg',
    color: '#EAF05C', // Wasabi
    iconName: 'Crown',
    displayOrder: 8,
  },
  {
    id: 'cat-sprinkles-edible',
    name: 'Sprinkles & Edibles',
    slug: 'sprinkles-edible',
    description: 'Metallic dragees, chocolate pearls, golden flakes, confetti medleys, and sugar rods.',
    imageUrl: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-s550i6yh1y.jpg',
    color: '#AEBBA0', // Vert Sauge
    iconName: 'Stars',
    displayOrder: 9,
  },
  {
    id: 'cat-other-essentials',
    name: 'Parchment & Disposables',
    slug: 'other-essentials',
    description: 'Heavy parchment rolls, disposable piping bags, sugar thermometers, and oven liners.',
    imageUrl: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-xvwotvyf9p.jpg',
    color: '#FF5C34', // Orange Topaze
    iconName: 'CheckCircle',
    displayOrder: 10,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "jd-prod-01",
    "name": "Happilo Premium International Queen Kalmi Dates",
    "slug": "happilo-premium-international-queen-kalmi-dates",
    "description": "Authentic Happilo Premium International Queen Kalmi Dates sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 340,
    "discountPrice": 299,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-xvwotvyf9p.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/happilo-queen-kalmi-dates-r1t2z3.jpg"
    ],
    "stock": 21,
    "rating": 4.7,
    "reviewsCount": 15,
    "isFeatured": true,
    "isActive": true,
    "brand": "Happilo",
    "unit": "500g Pack",
    "tags": [
      "Dates",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-25T18:23:46.984Z"
  },
  {
    "id": "jd-prod-02",
    "name": "Happilo Premium International King Medjoul Dates",
    "slug": "happilo-premium-international-king-medjoul-dates",
    "description": "Authentic Happilo Premium International King Medjoul Dates sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 340,
    "discountPrice": 299,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-85hi5gmdrc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/happilo-king-medjoul-dates-r1t2z4.jpg"
    ],
    "stock": 25,
    "rating": 4.8,
    "reviewsCount": 16,
    "isFeatured": true,
    "isActive": true,
    "brand": "Happilo",
    "unit": "500g Pack",
    "tags": [
      "Dates",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-24T18:23:46.987Z"
  },
  {
    "id": "jd-prod-03",
    "name": "Happilo Premium Afghani Seedless Black Raisins",
    "slug": "happilo-premium-afghani-seedless-black-raisins",
    "description": "Authentic Happilo Premium Afghani Seedless Black Raisins sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 220,
    "discountPrice": 194,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-ahhl2flolc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/happilo-black-raisins-r1t2z5.jpg"
    ],
    "stock": 30,
    "rating": 4.9,
    "reviewsCount": 17,
    "isFeatured": true,
    "isActive": true,
    "brand": "Happilo",
    "unit": "250g Pack",
    "tags": [
      "Raisins",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-23T18:23:46.987Z"
  },
  {
    "id": "jd-prod-04",
    "name": "Urban Platter Mamra Almonds",
    "slug": "urban-platter-mamra-almonds",
    "description": "Authentic Urban Platter Mamra Almonds sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 480,
    "discountPrice": 422,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-96i8b18arz.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/urban-platter-mamra-almonds-r1t2z6.jpg"
    ],
    "stock": 20,
    "rating": 5,
    "reviewsCount": 18,
    "isFeatured": true,
    "isActive": true,
    "brand": "Urban Platter",
    "unit": "500g Pack",
    "tags": [
      "Almonds",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-22T18:23:46.987Z"
  },
  {
    "id": "jd-prod-05",
    "name": "Dried Jumbo Afghan Figs",
    "slug": "dried-jumbo-afghan-figs",
    "description": "Authentic Dried Jumbo Afghan Figs sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 450,
    "discountPrice": 396,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-gfxnhuf12m.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/jumbo-afghan-figs-r1t2z7.jpg"
    ],
    "stock": 21,
    "rating": 4.7,
    "reviewsCount": 19,
    "isFeatured": true,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "250g Pack",
    "tags": [
      "Figs",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-21T18:23:46.987Z"
  },
  {
    "id": "jd-prod-06",
    "name": "California Gold Almonds",
    "slug": "california-gold-almonds",
    "description": "Authentic California Gold Almonds sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 480,
    "discountPrice": 422,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-s550i6yh1y.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/california-gold-almonds-r1t2z8.jpg"
    ],
    "stock": 18,
    "rating": 4.8,
    "reviewsCount": 20,
    "isFeatured": true,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "500g Pack",
    "tags": [
      "Almonds",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-20T18:23:46.987Z"
  },
  {
    "id": "jd-prod-07",
    "name": "Borges California Pistachios Roasted & Salted",
    "slug": "borges-california-pistachios-roasted-salted",
    "description": "Authentic Borges California Pistachios Roasted & Salted sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 490,
    "discountPrice": 431,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-xvwotvyf9p.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/borges-pistachios-r1t2z9.jpg"
    ],
    "stock": 32,
    "rating": 4.9,
    "reviewsCount": 21,
    "isFeatured": true,
    "isActive": true,
    "brand": "Borges",
    "unit": "250g Pack",
    "tags": [
      "Pistachios",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-19T18:23:46.987Z"
  },
  {
    "id": "jd-prod-08",
    "name": "Tulsi California Walnuts Premium",
    "slug": "tulsi-california-walnuts-premium",
    "description": "Authentic Tulsi California Walnuts Premium sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 580,
    "discountPrice": 510,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-85hi5gmdrc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/tulsi-california-walnuts-r1t2z10.jpg"
    ],
    "stock": 15,
    "rating": 5,
    "reviewsCount": 22,
    "isFeatured": true,
    "isActive": true,
    "brand": "Tulsi",
    "unit": "500g Pack",
    "tags": [
      "Walnuts",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-18T18:23:46.987Z"
  },
  {
    "id": "jd-prod-09",
    "name": "Happilo Premium Salted Roasted Pistachios Snack Pack",
    "slug": "happilo-premium-salted-roasted-pistachios-snack-pack",
    "description": "Authentic Happilo Premium Salted Roasted Pistachios Snack Pack sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 490,
    "discountPrice": 431,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-ahhl2flolc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/happilo-salted-pistachios-r1t2z11.jpg"
    ],
    "stock": 18,
    "rating": 4.7,
    "reviewsCount": 23,
    "isFeatured": false,
    "isActive": true,
    "brand": "Happilo",
    "unit": "250g Pack",
    "tags": [
      "Pistachios",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-17T18:23:46.987Z"
  },
  {
    "id": "jd-prod-10",
    "name": "Happilo Premium Seedless Green Raisins",
    "slug": "happilo-premium-seedless-green-raisins",
    "description": "Authentic Happilo Premium Seedless Green Raisins sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 220,
    "discountPrice": 194,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-96i8b18arz.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/happilo-green-raisins-r1t2z12.jpg"
    ],
    "stock": 15,
    "rating": 4.8,
    "reviewsCount": 24,
    "isFeatured": false,
    "isActive": true,
    "brand": "Happilo",
    "unit": "250g Pack",
    "tags": [
      "Raisins",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-16T18:23:46.987Z"
  },
  {
    "id": "jd-prod-11",
    "name": "NayaKart Special Dry Fruit Assortment Gift Box",
    "slug": "nayakart-special-dry-fruit-assortment-gift-box",
    "description": "Authentic NayaKart Special Dry Fruit Assortment Gift Box sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 1250,
    "discountPrice": 1100,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-gfxnhuf12m.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/dry-fruit-gift-box-1.jpg"
    ],
    "stock": 18,
    "rating": 4.9,
    "reviewsCount": 25,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "Gift Box (1kg)",
    "tags": [
      "Gift packs",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-15T18:23:46.987Z"
  },
  {
    "id": "jd-prod-12",
    "name": "Premium Cashew Nuts W320",
    "slug": "premium-cashew-nuts-w320",
    "description": "Authentic Premium Cashew Nuts W320 sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 520,
    "discountPrice": 458,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-s550i6yh1y.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/cashew-nuts-w320-1.jpg"
    ],
    "stock": 15,
    "rating": 5,
    "reviewsCount": 26,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "500g Pack",
    "tags": [
      "Cashews",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-14T18:23:46.987Z"
  },
  {
    "id": "jd-prod-13",
    "name": "Roasted & Salted Cashews",
    "slug": "roasted-salted-cashews",
    "description": "Authentic Roasted & Salted Cashews sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 520,
    "discountPrice": 458,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-xvwotvyf9p.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/roasted-cashews-1.jpg"
    ],
    "stock": 32,
    "rating": 4.7,
    "reviewsCount": 27,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "500g Pack",
    "tags": [
      "Cashews",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-13T18:23:46.987Z"
  },
  {
    "id": "jd-prod-14",
    "name": "Premium Dried Cranberries",
    "slug": "premium-dried-cranberries",
    "description": "Authentic Premium Dried Cranberries sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 390,
    "discountPrice": 343,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-85hi5gmdrc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/dried-cranberries-1.jpg"
    ],
    "stock": 31,
    "rating": 4.8,
    "reviewsCount": 28,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "200g Pack",
    "tags": [
      "Berries",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-12T18:23:46.987Z"
  },
  {
    "id": "jd-prod-15",
    "name": "Dried Blueberries Imported",
    "slug": "dried-blueberries-imported",
    "description": "Authentic Dried Blueberries Imported sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 390,
    "discountPrice": 343,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-ahhl2flolc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/dried-blueberries-1.jpg"
    ],
    "stock": 18,
    "rating": 4.9,
    "reviewsCount": 29,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "200g Pack",
    "tags": [
      "Berries",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-11T18:23:46.987Z"
  },
  {
    "id": "jd-prod-16",
    "name": "Turkish Apricots Dried",
    "slug": "turkish-apricots-dried",
    "description": "Authentic Turkish Apricots Dried sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 360,
    "discountPrice": 317,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-96i8b18arz.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/turkish-apricots-1.jpg"
    ],
    "stock": 22,
    "rating": 5,
    "reviewsCount": 30,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "250g Pack",
    "tags": [
      "Apricots",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-10T18:23:46.987Z"
  },
  {
    "id": "jd-prod-17",
    "name": "Pitted Prunes Imported",
    "slug": "pitted-prunes-imported",
    "description": "Authentic Pitted Prunes Imported sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 380,
    "discountPrice": 334,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-gfxnhuf12m.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/pitted-prunes-1.jpg"
    ],
    "stock": 23,
    "rating": 4.7,
    "reviewsCount": 31,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "250g Pack",
    "tags": [
      "Prunes",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-09T18:23:46.987Z"
  },
  {
    "id": "jd-prod-18",
    "name": "Roasted Pecan Nuts",
    "slug": "roasted-pecan-nuts",
    "description": "Authentic Roasted Pecan Nuts sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 650,
    "discountPrice": 572,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-s550i6yh1y.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/roasted-pecans-1.jpg"
    ],
    "stock": 15,
    "rating": 4.8,
    "reviewsCount": 32,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "250g Pack",
    "tags": [
      "Nuts",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-08T18:23:46.988Z"
  },
  {
    "id": "jd-prod-19",
    "name": "Macadamia Nuts Roasted",
    "slug": "macadamia-nuts-roasted",
    "description": "Authentic Macadamia Nuts Roasted sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 650,
    "discountPrice": 572,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-xvwotvyf9p.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/macadamia-nuts-1.jpg"
    ],
    "stock": 35,
    "rating": 4.9,
    "reviewsCount": 33,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "250g Pack",
    "tags": [
      "Nuts",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-07T18:23:46.988Z"
  },
  {
    "id": "jd-prod-20",
    "name": "Brazilian Nuts Raw",
    "slug": "brazilian-nuts-raw",
    "description": "Authentic Brazilian Nuts Raw sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 650,
    "discountPrice": 572,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-85hi5gmdrc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/brazil-nuts-1.jpg"
    ],
    "stock": 16,
    "rating": 5,
    "reviewsCount": 34,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "250g Pack",
    "tags": [
      "Nuts",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-06T18:23:46.988Z"
  },
  {
    "id": "jd-prod-21",
    "name": "Pine Nuts (Chilgoza)",
    "slug": "pine-nuts-chilgoza",
    "description": "Authentic Pine Nuts (Chilgoza) sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 650,
    "discountPrice": 572,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-ahhl2flolc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/pine-nuts-1.jpg"
    ],
    "stock": 16,
    "rating": 4.7,
    "reviewsCount": 35,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "250g Pack",
    "tags": [
      "Nuts",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-05T18:23:46.988Z"
  },
  {
    "id": "jd-prod-22",
    "name": "Roasted Hazelnut Kernels",
    "slug": "roasted-hazelnut-kernels",
    "description": "Authentic Roasted Hazelnut Kernels sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 650,
    "discountPrice": 572,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-96i8b18arz.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/hazelnuts-1.jpg"
    ],
    "stock": 29,
    "rating": 4.8,
    "reviewsCount": 36,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "250g Pack",
    "tags": [
      "Nuts",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-04T18:23:46.988Z"
  },
  {
    "id": "jd-prod-23",
    "name": "Chia Seeds Organic",
    "slug": "chia-seeds-organic",
    "description": "Authentic Chia Seeds Organic sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 240,
    "discountPrice": 211,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-gfxnhuf12m.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/chia-seeds-1.jpg"
    ],
    "stock": 14,
    "rating": 4.9,
    "reviewsCount": 37,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "200g Pack",
    "tags": [
      "Seeds",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-03T18:23:46.988Z"
  },
  {
    "id": "jd-prod-24",
    "name": "Pumpkin Seeds Roasted",
    "slug": "pumpkin-seeds-roasted",
    "description": "Authentic Pumpkin Seeds Roasted sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 240,
    "discountPrice": 211,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-s550i6yh1y.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/pumpkin-seeds-1.jpg"
    ],
    "stock": 37,
    "rating": 5,
    "reviewsCount": 38,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "200g Pack",
    "tags": [
      "Seeds",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-02T18:23:46.988Z"
  },
  {
    "id": "jd-prod-25",
    "name": "Sunflower Seeds Roasted",
    "slug": "sunflower-seeds-roasted",
    "description": "Authentic Sunflower Seeds Roasted sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 240,
    "discountPrice": 211,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-xvwotvyf9p.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/sunflower-seeds-1.jpg"
    ],
    "stock": 31,
    "rating": 4.7,
    "reviewsCount": 39,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "200g Pack",
    "tags": [
      "Seeds",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-10-01T18:23:46.988Z"
  },
  {
    "id": "jd-prod-26",
    "name": "Flax Seeds Roasted",
    "slug": "flax-seeds-roasted",
    "description": "Authentic Flax Seeds Roasted sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 240,
    "discountPrice": 211,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-85hi5gmdrc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/flax-seeds-1.jpg"
    ],
    "stock": 16,
    "rating": 4.8,
    "reviewsCount": 15,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "200g Pack",
    "tags": [
      "Seeds",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-30T18:23:46.988Z"
  },
  {
    "id": "jd-prod-27",
    "name": "Mixed Seeds Superblend",
    "slug": "mixed-seeds-superblend",
    "description": "Authentic Mixed Seeds Superblend sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 240,
    "discountPrice": 211,
    "categoryId": "cat-dry-fruits",
    "categoryName": "Dry Fruits, Nuts & Seeds",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-ahhl2flolc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/mixed-seeds-1.jpg"
    ],
    "stock": 33,
    "rating": 4.9,
    "reviewsCount": 16,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "200g Pack",
    "tags": [
      "Seeds",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-29T18:23:46.988Z"
  },
  {
    "id": "jd-prod-28",
    "name": "Bakery Chocolate Chips Dark",
    "slug": "bakery-chocolate-chips-dark",
    "description": "Authentic Bakery Chocolate Chips Dark sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 240,
    "discountPrice": 211,
    "categoryId": "cat-baking-ingredients",
    "categoryName": "Baking Raw Materials & Ingredients",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-96i8b18arz.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/choco-chips-1.jpg"
    ],
    "stock": 37,
    "rating": 5,
    "reviewsCount": 17,
    "isFeatured": false,
    "isActive": true,
    "brand": "Morde",
    "unit": "400g Slab",
    "tags": [
      "Baking",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-28T18:23:46.988Z"
  },
  {
    "id": "jd-prod-29",
    "name": "Baking Cocoa Powder Dutch Processed",
    "slug": "baking-cocoa-powder-dutch-processed",
    "description": "Authentic Baking Cocoa Powder Dutch Processed sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 280,
    "discountPrice": 246,
    "categoryId": "cat-baking-ingredients",
    "categoryName": "Baking Raw Materials & Ingredients",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-gfxnhuf12m.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/cocoa-powder-1.jpg"
    ],
    "stock": 16,
    "rating": 4.7,
    "reviewsCount": 18,
    "isFeatured": false,
    "isActive": true,
    "brand": "Cadbury Professional",
    "unit": "250g Jar",
    "tags": [
      "Baking",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-27T18:23:46.988Z"
  },
  {
    "id": "jd-prod-30",
    "name": "Vanilla Essence Premium",
    "slug": "vanilla-essence-premium",
    "description": "Authentic Vanilla Essence Premium sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 140,
    "discountPrice": 123,
    "categoryId": "cat-baking-ingredients",
    "categoryName": "Baking Raw Materials & Ingredients",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-s550i6yh1y.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/vanilla-essence-1.jpg"
    ],
    "stock": 30,
    "rating": 4.8,
    "reviewsCount": 19,
    "isFeatured": false,
    "isActive": true,
    "brand": "Bush",
    "unit": "100ml Bottle",
    "tags": [
      "Baking",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-26T18:23:46.988Z"
  },
  {
    "id": "jd-prod-31",
    "name": "Baking Powder Double Acting",
    "slug": "baking-powder-double-acting",
    "description": "Authentic Baking Powder Double Acting sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 85,
    "discountPrice": 75,
    "categoryId": "cat-baking-ingredients",
    "categoryName": "Baking Raw Materials & Ingredients",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-xvwotvyf9p.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/baking-powder-1.jpg"
    ],
    "stock": 17,
    "rating": 4.9,
    "reviewsCount": 20,
    "isFeatured": false,
    "isActive": true,
    "brand": "Weikfield",
    "unit": "100g Box",
    "tags": [
      "Baking",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-25T18:23:46.988Z"
  },
  {
    "id": "jd-prod-32",
    "name": "Baking Soda Sodium Bicarbonate",
    "slug": "baking-soda-sodium-bicarbonate",
    "description": "Authentic Baking Soda Sodium Bicarbonate sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 85,
    "discountPrice": 75,
    "categoryId": "cat-baking-ingredients",
    "categoryName": "Baking Raw Materials & Ingredients",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-85hi5gmdrc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/baking-soda-1.jpg"
    ],
    "stock": 16,
    "rating": 5,
    "reviewsCount": 21,
    "isFeatured": false,
    "isActive": true,
    "brand": "Weikfield",
    "unit": "100g Box",
    "tags": [
      "Baking",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-24T18:23:46.988Z"
  },
  {
    "id": "jd-prod-33",
    "name": "Tutti Frutti Colored Candied Papaya",
    "slug": "tutti-frutti-colored-candied-papaya",
    "description": "Authentic Tutti Frutti Colored Candied Papaya sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 160,
    "discountPrice": 141,
    "categoryId": "cat-baking-ingredients",
    "categoryName": "Baking Raw Materials & Ingredients",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-ahhl2flolc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/tutti-frutti-1.jpg"
    ],
    "stock": 28,
    "rating": 4.7,
    "reviewsCount": 22,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "250g Pack",
    "tags": [
      "Baking",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-23T18:23:46.988Z"
  },
  {
    "id": "jd-prod-34",
    "name": "Glazed Red Cherries",
    "slug": "glazed-red-cherries",
    "description": "Authentic Glazed Red Cherries sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 160,
    "discountPrice": 141,
    "categoryId": "cat-baking-ingredients",
    "categoryName": "Baking Raw Materials & Ingredients",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-96i8b18arz.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/glazed-cherries-1.jpg"
    ],
    "stock": 21,
    "rating": 4.8,
    "reviewsCount": 23,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Select",
    "unit": "250g Pack",
    "tags": [
      "Baking",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-22T18:23:46.988Z"
  },
  {
    "id": "jd-prod-35",
    "name": "Cake Gel Emulsifier",
    "slug": "cake-gel-emulsifier",
    "description": "Authentic Cake Gel Emulsifier sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 320,
    "discountPrice": 282,
    "categoryId": "cat-baking-ingredients",
    "categoryName": "Baking Raw Materials & Ingredients",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-gfxnhuf12m.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/cake-gel-1.jpg"
    ],
    "stock": 39,
    "rating": 4.9,
    "reviewsCount": 24,
    "isFeatured": false,
    "isActive": true,
    "brand": "Confect",
    "unit": "500g Tub",
    "tags": [
      "Baking",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-21T18:23:46.988Z"
  },
  {
    "id": "jd-prod-36",
    "name": "Whipped Cream Powder",
    "slug": "whipped-cream-powder",
    "description": "Authentic Whipped Cream Powder sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 85,
    "discountPrice": 75,
    "categoryId": "cat-baking-ingredients",
    "categoryName": "Baking Raw Materials & Ingredients",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-s550i6yh1y.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/whipped-cream-powder-1.jpg"
    ],
    "stock": 36,
    "rating": 5,
    "reviewsCount": 25,
    "isFeatured": false,
    "isActive": true,
    "brand": "Weikfield",
    "unit": "100g Box",
    "tags": [
      "Baking",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-20T18:23:46.988Z"
  },
  {
    "id": "jd-prod-37",
    "name": "Fondant White Sugar Paste",
    "slug": "fondant-white-sugar-paste",
    "description": "Authentic Fondant White Sugar Paste sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 320,
    "discountPrice": 282,
    "categoryId": "cat-baking-ingredients",
    "categoryName": "Baking Raw Materials & Ingredients",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-xvwotvyf9p.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/fondant-paste-1.jpg"
    ],
    "stock": 13,
    "rating": 4.7,
    "reviewsCount": 26,
    "isFeatured": false,
    "isActive": true,
    "brand": "Confect",
    "unit": "500g Tub",
    "tags": [
      "Baking",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-19T18:23:46.988Z"
  },
  {
    "id": "jd-prod-38",
    "name": "Silicone Baking Mat",
    "slug": "silicone-baking-mat",
    "description": "Authentic Silicone Baking Mat sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 320,
    "discountPrice": 282,
    "categoryId": "cat-tools-equipment",
    "categoryName": "Baking Tools & Equipment",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-85hi5gmdrc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/silicone-mat-1.jpg"
    ],
    "stock": 14,
    "rating": 4.8,
    "reviewsCount": 27,
    "isFeatured": false,
    "isActive": true,
    "brand": "MasterBake",
    "unit": "Piece",
    "tags": [
      "Tools",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-18T18:23:46.988Z"
  },
  {
    "id": "jd-prod-39",
    "name": "Disposable Piping Bags 100pcs",
    "slug": "disposable-piping-bags-100pcs",
    "description": "Authentic Disposable Piping Bags 100pcs sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 290,
    "discountPrice": 255,
    "categoryId": "cat-tools-equipment",
    "categoryName": "Baking Tools & Equipment",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-ahhl2flolc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/piping-bags-1.jpg"
    ],
    "stock": 17,
    "rating": 4.9,
    "reviewsCount": 28,
    "isFeatured": false,
    "isActive": true,
    "brand": "MasterBake",
    "unit": "Pack of 100",
    "tags": [
      "Tools",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-17T18:23:46.988Z"
  },
  {
    "id": "jd-prod-40",
    "name": "Stainless Steel Nozzles Set",
    "slug": "stainless-steel-nozzles-set",
    "description": "Authentic Stainless Steel Nozzles Set sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 450,
    "discountPrice": 396,
    "categoryId": "cat-tools-equipment",
    "categoryName": "Baking Tools & Equipment",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-96i8b18arz.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/nozzles-set-1.jpg"
    ],
    "stock": 12,
    "rating": 5,
    "reviewsCount": 29,
    "isFeatured": false,
    "isActive": true,
    "brand": "MasterBake",
    "unit": "Set of 12",
    "tags": [
      "Tools",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-16T18:23:46.988Z"
  },
  {
    "id": "jd-prod-41",
    "name": "Cake Turntable Rotating Stand",
    "slug": "cake-turntable-rotating-stand",
    "description": "Authentic Cake Turntable Rotating Stand sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 650,
    "discountPrice": 572,
    "categoryId": "cat-tools-equipment",
    "categoryName": "Baking Tools & Equipment",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-gfxnhuf12m.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/turntable-1.jpg"
    ],
    "stock": 40,
    "rating": 4.7,
    "reviewsCount": 30,
    "isFeatured": false,
    "isActive": true,
    "brand": "MasterBake",
    "unit": "Piece",
    "tags": [
      "Tools",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-15T18:23:46.988Z"
  },
  {
    "id": "jd-prod-42",
    "name": "Palette Knife Offset Spatula",
    "slug": "palette-knife-offset-spatula",
    "description": "Authentic Palette Knife Offset Spatula sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 220,
    "discountPrice": 194,
    "categoryId": "cat-tools-equipment",
    "categoryName": "Baking Tools & Equipment",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-s550i6yh1y.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/palette-knife-1.jpg"
    ],
    "stock": 12,
    "rating": 4.8,
    "reviewsCount": 31,
    "isFeatured": false,
    "isActive": true,
    "brand": "MasterBake",
    "unit": "Piece",
    "tags": [
      "Tools",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-14T18:23:46.988Z"
  },
  {
    "id": "jd-prod-43",
    "name": "Digital Kitchen Weighing Scale",
    "slug": "digital-kitchen-weighing-scale",
    "description": "Authentic Digital Kitchen Weighing Scale sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 550,
    "discountPrice": 484,
    "categoryId": "cat-tools-equipment",
    "categoryName": "Baking Tools & Equipment",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-xvwotvyf9p.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/kitchen-scale-1.jpg"
    ],
    "stock": 37,
    "rating": 4.9,
    "reviewsCount": 32,
    "isFeatured": false,
    "isActive": true,
    "brand": "MasterBake",
    "unit": "Piece",
    "tags": [
      "Tools",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-13T18:23:46.988Z"
  },
  {
    "id": "jd-prod-44",
    "name": "Aluminum Cake Tin Round 8 inch",
    "slug": "aluminum-cake-tin-round-8-inch",
    "description": "Authentic Aluminum Cake Tin Round 8 inch sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 380,
    "discountPrice": 334,
    "categoryId": "cat-moulds-cutters",
    "categoryName": "Cake Moulds & Bakeware",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-85hi5gmdrc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/cake-tin-8-1.jpg"
    ],
    "stock": 35,
    "rating": 5,
    "reviewsCount": 33,
    "isFeatured": false,
    "isActive": true,
    "brand": "Kanchan Udyog",
    "unit": "Piece",
    "tags": [
      "Bakeware",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-12T18:23:46.988Z"
  },
  {
    "id": "jd-prod-45",
    "name": "Springform Cake Pan Non-Stick",
    "slug": "springform-cake-pan-non-stick",
    "description": "Authentic Springform Cake Pan Non-Stick sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 380,
    "discountPrice": 334,
    "categoryId": "cat-moulds-cutters",
    "categoryName": "Cake Moulds & Bakeware",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-ahhl2flolc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/springform-pan-1.jpg"
    ],
    "stock": 35,
    "rating": 4.7,
    "reviewsCount": 34,
    "isFeatured": false,
    "isActive": true,
    "brand": "Kanchan Udyog",
    "unit": "Piece",
    "tags": [
      "Bakeware",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-11T18:23:46.988Z"
  },
  {
    "id": "jd-prod-46",
    "name": "Loaf Bread Tin Non-Stick",
    "slug": "loaf-bread-tin-non-stick",
    "description": "Authentic Loaf Bread Tin Non-Stick sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 380,
    "discountPrice": 334,
    "categoryId": "cat-moulds-cutters",
    "categoryName": "Cake Moulds & Bakeware",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-96i8b18arz.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/loaf-tin-1.jpg"
    ],
    "stock": 21,
    "rating": 4.8,
    "reviewsCount": 35,
    "isFeatured": false,
    "isActive": true,
    "brand": "Kanchan Udyog",
    "unit": "Piece",
    "tags": [
      "Bakeware",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-10T18:23:46.988Z"
  },
  {
    "id": "jd-prod-47",
    "name": "Muffin Cupcake Silicon Mould 12 Cup",
    "slug": "muffin-cupcake-silicon-mould-12-cup",
    "description": "Authentic Muffin Cupcake Silicon Mould 12 Cup sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 290,
    "discountPrice": 255,
    "categoryId": "cat-moulds-cutters",
    "categoryName": "Cake Moulds & Bakeware",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-gfxnhuf12m.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/muffin-mould-1.jpg"
    ],
    "stock": 31,
    "rating": 4.9,
    "reviewsCount": 36,
    "isFeatured": false,
    "isActive": true,
    "brand": "Kanchan Udyog",
    "unit": "Piece",
    "tags": [
      "Bakeware",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-09T18:23:46.988Z"
  },
  {
    "id": "jd-prod-48",
    "name": "Paper Cupcake Liners (Pack of 100)",
    "slug": "paper-cupcake-liners-pack-of-100",
    "description": "Authentic Paper Cupcake Liners (Pack of 100) sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 160,
    "discountPrice": 141,
    "categoryId": "cat-moulds-cutters",
    "categoryName": "Cake Moulds & Bakeware",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-s550i6yh1y.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/cupcake-liners-1.jpg"
    ],
    "stock": 29,
    "rating": 5,
    "reviewsCount": 37,
    "isFeatured": false,
    "isActive": true,
    "brand": "Kanchan Udyog",
    "unit": "Pack of 100",
    "tags": [
      "Bakeware",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-08T18:23:46.988Z"
  },
  {
    "id": "jd-prod-49",
    "name": "Cake Box with Window 1kg",
    "slug": "cake-box-with-window-1kg",
    "description": "Authentic Cake Box with Window 1kg sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 240,
    "discountPrice": 211,
    "categoryId": "cat-packaging-supplies",
    "categoryName": "Boxes, Boards & Packaging",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-xvwotvyf9p.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/cake-box-1kg-1.jpg"
    ],
    "stock": 24,
    "rating": 4.7,
    "reviewsCount": 38,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Packaging",
    "unit": "Set of 10",
    "tags": [
      "Packaging",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-07T18:23:46.988Z"
  },
  {
    "id": "jd-prod-50",
    "name": "Cupcake Box 6 Cavity with Insert",
    "slug": "cupcake-box-6-cavity-with-insert",
    "description": "Authentic Cupcake Box 6 Cavity with Insert sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 240,
    "discountPrice": 211,
    "categoryId": "cat-packaging-supplies",
    "categoryName": "Boxes, Boards & Packaging",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-85hi5gmdrc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/cupcake-box-6-1.jpg"
    ],
    "stock": 35,
    "rating": 4.8,
    "reviewsCount": 39,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Packaging",
    "unit": "Set of 10",
    "tags": [
      "Packaging",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-06T18:23:46.988Z"
  },
  {
    "id": "jd-prod-51",
    "name": "Cake Board Gold Round 8 inch",
    "slug": "cake-board-gold-round-8-inch",
    "description": "Authentic Cake Board Gold Round 8 inch sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 180,
    "discountPrice": 158,
    "categoryId": "cat-packaging-supplies",
    "categoryName": "Boxes, Boards & Packaging",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-ahhl2flolc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/cake-board-1.jpg"
    ],
    "stock": 18,
    "rating": 4.9,
    "reviewsCount": 15,
    "isFeatured": false,
    "isActive": true,
    "brand": "NayaKart Packaging",
    "unit": "Set of 10",
    "tags": [
      "Packaging",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-05T18:23:46.988Z"
  },
  {
    "id": "jd-prod-52",
    "name": "Birthday Number Candles Gold",
    "slug": "birthday-number-candles-gold",
    "description": "Authentic Birthday Number Candles Gold sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 120,
    "discountPrice": 106,
    "categoryId": "cat-cake-toppers",
    "categoryName": "Cake Toppers & Accents",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-96i8b18arz.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/number-candles-1.jpg"
    ],
    "stock": 29,
    "rating": 5,
    "reviewsCount": 16,
    "isFeatured": false,
    "isActive": true,
    "brand": "PartyCraft",
    "unit": "Piece",
    "tags": [
      "Party",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-04T18:23:46.988Z"
  },
  {
    "id": "jd-prod-53",
    "name": "Magic Sparkler Candles",
    "slug": "magic-sparkler-candles",
    "description": "Authentic Magic Sparkler Candles sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 120,
    "discountPrice": 106,
    "categoryId": "cat-cake-toppers",
    "categoryName": "Cake Toppers & Accents",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-gfxnhuf12m.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/sparkler-candles-1.jpg"
    ],
    "stock": 16,
    "rating": 4.7,
    "reviewsCount": 17,
    "isFeatured": false,
    "isActive": true,
    "brand": "PartyCraft",
    "unit": "Piece",
    "tags": [
      "Party",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-03T18:23:46.988Z"
  },
  {
    "id": "jd-prod-54",
    "name": "Happy Birthday Cake Topper Acrylic",
    "slug": "happy-birthday-cake-topper-acrylic",
    "description": "Authentic Happy Birthday Cake Topper Acrylic sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 150,
    "discountPrice": 132,
    "categoryId": "cat-cake-toppers",
    "categoryName": "Cake Toppers & Accents",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-s550i6yh1y.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/cake-topper-1.jpg"
    ],
    "stock": 21,
    "rating": 4.8,
    "reviewsCount": 18,
    "isFeatured": false,
    "isActive": true,
    "brand": "PartyCraft",
    "unit": "Piece",
    "tags": [
      "Party",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-02T18:23:46.988Z"
  },
  {
    "id": "jd-prod-55",
    "name": "Edible Silver Dust Sparkle",
    "slug": "edible-silver-dust-sparkle",
    "description": "Authentic Edible Silver Dust Sparkle sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 280,
    "discountPrice": 246,
    "categoryId": "cat-cake-decoration",
    "categoryName": "Cake Decoration & Nozzles",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-xvwotvyf9p.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/edible-silver-dust-1.jpg"
    ],
    "stock": 27,
    "rating": 4.9,
    "reviewsCount": 19,
    "isFeatured": false,
    "isActive": true,
    "brand": "Magic Colours",
    "unit": "Jar (10g)",
    "tags": [
      "Decoration",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-09-01T18:23:46.988Z"
  },
  {
    "id": "jd-prod-56",
    "name": "Edible Gold Dust Sparkle",
    "slug": "edible-gold-dust-sparkle",
    "description": "Authentic Edible Gold Dust Sparkle sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 280,
    "discountPrice": 246,
    "categoryId": "cat-cake-decoration",
    "categoryName": "Cake Decoration & Nozzles",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-85hi5gmdrc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/edible-gold-dust-1.jpg"
    ],
    "stock": 27,
    "rating": 5,
    "reviewsCount": 20,
    "isFeatured": false,
    "isActive": true,
    "brand": "Magic Colours",
    "unit": "Jar (10g)",
    "tags": [
      "Decoration",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-08-31T18:23:46.988Z"
  },
  {
    "id": "jd-prod-57",
    "name": "Gel Food Color Set (Pack of 8)",
    "slug": "gel-food-color-set-pack-of-8",
    "description": "Authentic Gel Food Color Set (Pack of 8) sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 480,
    "discountPrice": 422,
    "categoryId": "cat-cake-decoration",
    "categoryName": "Cake Decoration & Nozzles",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-ahhl2flolc.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/gel-colors-1.jpg"
    ],
    "stock": 26,
    "rating": 4.7,
    "reviewsCount": 21,
    "isFeatured": false,
    "isActive": true,
    "brand": "Magic Colours",
    "unit": "Set of 8",
    "tags": [
      "Decoration",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-08-30T18:23:46.988Z"
  },
  {
    "id": "jd-prod-58",
    "name": "Rainbow Sprinkles Sugar Pearls",
    "slug": "rainbow-sprinkles-sugar-pearls",
    "description": "Authentic Rainbow Sprinkles Sugar Pearls sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 190,
    "discountPrice": 167,
    "categoryId": "cat-cake-decoration",
    "categoryName": "Cake Decoration & Nozzles",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-96i8b18arz.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/sprinkles-1.jpg"
    ],
    "stock": 28,
    "rating": 4.8,
    "reviewsCount": 22,
    "isFeatured": false,
    "isActive": true,
    "brand": "Magic Colours",
    "unit": "Jar (150g)",
    "tags": [
      "Decoration",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-08-29T18:23:46.988Z"
  },
  {
    "id": "jd-prod-59",
    "name": "Compound Chocolate Slab Dark 400g",
    "slug": "compound-chocolate-slab-dark-400g",
    "description": "Authentic Compound Chocolate Slab Dark 400g sourced directly at NayaKart Kazhakuttam showroom. High-grade premium baking and confectionery product for retail and wholesale requirements.",
    "price": 240,
    "discountPrice": 211,
    "categoryId": "cat-baking-ingredients",
    "categoryName": "Baking Raw Materials & Ingredients",
    "images": [
      "https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-gfxnhuf12m.jpg",
      "https://content.jdmagicbox.com/quickflip/thiruvananthapuram/0471px471.x471.190622133608.y4j6/catalog/dark-chocolate-slab-1.jpg"
    ],
    "stock": 38,
    "rating": 4.9,
    "reviewsCount": 23,
    "isFeatured": false,
    "isActive": true,
    "brand": "Morde",
    "unit": "400g Slab",
    "tags": [
      "Baking",
      "Kazhakuttam In Stock"
    ],
    "createdAt": "2026-08-28T18:23:46.988Z"
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'BNJ-8241',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98451 22334',
    customerWhatsapp: '+91 98451 22334',
    pickupPreference: 'Today · 5:30 PM Counter Pickup',
    notes: 'Please pack the chocolate callets with cold gel pack if possible.',
    subtotal: 1040,
    discount: 50,
    total: 990,
    orderStatus: 'new',
    paymentStatus: 'pending',
    createdAt: '2026-03-24T14:20:00Z',
    items: [
      {
        id: 'item-1',
        orderId: 'ord-101',
        productId: 'prod-04',
        productName: 'Belgian Dark Couverture Chocolate Buttons',
        variantName: '500g Pouch',
        unitPrice: 590,
        quantity: 1,
        lineTotal: 590,
        image: 'https://images.unsplash.com/photo-1587248720327-8eb72564be1e?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'item-2',
        orderId: 'ord-101',
        productId: 'prod-18',
        productName: 'Rose Gold & Champagne Edible Pearls Medley',
        variantName: '150g Jar',
        unitPrice: 285,
        quantity: 1,
        lineTotal: 285,
        image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'item-3',
        orderId: 'ord-101',
        productId: 'prod-11',
        productName: 'Mirror Acrylic "Happy Birthday" Geometric Topper',
        variantName: 'Mirror Gold',
        unitPrice: 140,
        quantity: 1,
        lineTotal: 140,
        image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: 'BNJ-8239',
    customerName: 'Anand Mohan',
    customerPhone: '+91 97412 88492',
    pickupPreference: 'Tomorrow · Morning 11:00 AM',
    notes: 'Picking up for my home bakery weekend order.',
    subtotal: 2348,
    discount: 100,
    total: 2248,
    orderStatus: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2026-03-24T11:15:00Z',
    items: [
      {
        id: 'item-4',
        orderId: 'ord-102',
        productId: 'prod-13',
        productName: 'Heavy Duty Cast Iron Revolving Cake Turntable',
        variantName: '12-inch Unit',
        unitPrice: 1599,
        quantity: 1,
        lineTotal: 1599,
        image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'item-5',
        orderId: 'ord-102',
        productId: 'prod-09',
        productName: 'Chefmaster Liqua-Gel Food Color Set',
        variantName: 'Set of 8 x 20ml',
        unitPrice: 749,
        quantity: 1,
        lineTotal: 749,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'ord-103',
    orderNumber: 'BNJ-8235',
    customerName: 'Kavitha R.',
    customerPhone: '+91 94480 33921',
    pickupPreference: 'Today · Ready Now',
    notes: 'Urgent pickup by Dunzo/Porter driver.',
    subtotal: 515,
    discount: 0,
    total: 515,
    orderStatus: 'ready_for_pickup',
    paymentStatus: 'pending',
    createdAt: '2026-03-24T09:40:00Z',
    items: [
      {
        id: 'item-6',
        orderId: 'ord-103',
        productId: 'prod-07',
        productName: 'Rich Tropelite Non-Dairy Whipping Cream',
        variantName: '1kg Tetra Pack',
        unitPrice: 215,
        quantity: 1,
        lineTotal: 215,
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'item-7',
        orderId: 'ord-103',
        productId: 'prod-16',
        productName: 'Geometric 3D Diamond Heart Silicone Mould',
        variantName: 'Mould + Mini Mallet',
        unitPrice: 299,
        quantity: 1,
        lineTotal: 299,
        image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'ord-104',
    orderNumber: 'BNJ-8228',
    customerName: 'Vikram Joshi',
    customerPhone: '+91 99001 55667',
    pickupPreference: 'Yesterday · Collected',
    notes: 'Paid at physical cash counter.',
    subtotal: 1250,
    discount: 50,
    total: 1200,
    orderStatus: 'completed',
    paymentStatus: 'paid',
    createdAt: '2026-03-23T16:00:00Z',
    items: [
      {
        id: 'item-8',
        orderId: 'ord-104',
        productId: 'prod-01',
        productName: 'Russian Piping Tips Set (12-Piece)',
        unitPrice: 389,
        quantity: 1,
        lineTotal: 389,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'item-9',
        orderId: 'ord-104',
        productId: 'prod-22',
        productName: 'Extra Strong Anti-Slip Disposable Piping Bags',
        variantName: '12-inch Roll of 100',
        unitPrice: 320,
        quantity: 2,
        lineTotal: 640,
        image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
];

export const STORE_SHOWROOM_IMAGES = [
  {
    id: 'img-1',
    title: 'Baking Tools & Accessories Racks',
    url: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-xvwotvyf9p.jpg',
    category: 'Tools & Accessories',
  },
  {
    id: 'img-2',
    title: 'Main Showroom Display & Shelves',
    url: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-85hi5gmdrc.jpg',
    category: 'Showroom Interior',
  },
  {
    id: 'img-3',
    title: 'Raw Materials, Ingredients & Flavours Aisle',
    url: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-ahhl2flolc.jpg',
    category: 'Ingredients & Flavours',
  },
  {
    id: 'img-4',
    title: 'Cake Boxes, Drums & Packaging Section',
    url: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-96i8b18arz.jpg',
    category: 'Packaging & Boxes',
  },
  {
    id: 'img-5',
    title: 'Silicone & Aluminium Moulds Display',
    url: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-gfxnhuf12m.jpg',
    category: 'Moulds & Bakeware',
  },
  {
    id: 'img-6',
    title: 'Checkout Counter & Baker Consultation Desk',
    url: 'https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-s550i6yh1y.jpg',
    category: 'Store Counter',
  },
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'NayaKart',
  tagline: 'Wholesale & Retail Baking Tools, Raw Materials & Cake Packaging',
  description: 'NayaKart is your trusted wholesale and retail store for all professional baking tools, silicone moulds, cake packaging boxes, couverture chocolate slabs, essences, and confectionery raw materials. Located on Kazhakoottam to Karyavattom Road, Kazhakuttam, serving home bakers, pastry chefs, and bakeries across Thiruvananthapuram.',
  address: 'TC.1/4575 (1) Ground Floor, Kazhakoottam to Karyavattom Road, Kazhakuttam, Thiruvananthapuram - 695582, Kerala',
  phone: '+91 94471 13608',
  whatsappNumber: '919447113608',
  email: 'hello@nayakart.in',
  openingHours: 'Mon – Sat: 10:30 AM to 9:00 PM · Sunday: 10:30 AM to 3:00 PM',
  currency: 'INR',
  currencySymbol: '₹',
  announcement: '🛒 NayaKart: Specialty Baking Tools, Moulds & Raw Materials · Counter Pickup & WhatsApp Orders in Kazhakuttam!',
  logoUrl: '',
};
