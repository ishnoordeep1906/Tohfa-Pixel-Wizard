(function (root) {
  'use strict';
  const products = [
    { id: 'candle', imageAlt: "An amber glass scented candle with its metal lid resting beside it on a windowsill.", name: 'The Sunday candle', category: 'Slow living', price: 320, color: '#e9d8bb', note: 'Amber jar · vanilla & cedar', description: 'A little pocket of calm. An amber glass candle with a warm vanilla and cedar scent, made for a book, a bath, or absolutely no plans.', occasions: ['Birthday', 'Thank you', 'Just because'], detail: '120 g · amber glass jar', stock: 3 },
    { id: 'chocolate', imageAlt: "Chocolate bars and cocoa beans on a light surface.", name: 'A very good chocolate', category: 'Little treats', price: 180, color: '#d5b6a5', note: 'Dark chocolate · sea salt', description: 'Rich dark chocolate with a little sea salt. The sort of small treat that deserves a moment all to itself.', occasions: ['Birthday', 'Thank you', 'Just because'], detail: '60 g · contains milk and soy; may contain nuts', stock: 3 },
    { id: 'mug', imageAlt: "A speckled ceramic cup and saucer holding coffee on a wooden table.", name: 'Your everyday cup', category: 'Slow living', price: 380, color: '#d1d7c7', note: 'Ceramic · soft sage', description: 'A softly rounded ceramic cup for the first tea of the day and the conversations that run a little longer.', occasions: ['Birthday', 'Thank you', 'Just because'], detail: '250 ml · glazed ceramic', stock: 2 },
    { id: 'journal', imageAlt: "A black spiral notebook with a paper collage cover on a white desk.", name: 'Room for a thought', category: 'Paper & play', price: 240, color: '#d6bbbc', note: 'Pocket notebook · 80 pages', description: 'For small plans, big thoughts, and lists that may never get finished. A pocket notebook with unruled cream pages.', occasions: ['Birthday', 'Thank you'], detail: 'A6 · 80 unruled pages', stock: 3 },
    { id: 'tea', imageAlt: "A cup of prepared chai beside cardamom and other whole spices.", name: 'A slower kind of chai', category: 'Little treats', price: 220, color: '#d5d4b6', note: 'Loose leaf · warming spices', description: 'A fragrant black tea blend with cardamom, ginger, and cinnamon. An invitation to put the kettle on and take your time.', occasions: ['Thank you', 'Just because'], detail: '50 g · loose leaf · contains caffeine', stock: 3 },
    { id: 'honey', imageAlt: "Golden honey in an open glass jar with a wooden honey dipper.", name: 'A spoonful of sunshine', category: 'Little treats', price: 190, color: '#ead7a9', note: 'Honey · a tiny golden jar', description: 'A small golden jar for toast, tea, and a little extra sweetness. Pair it with our chai for a cosy afternoon.', occasions: ['Thank you', 'Just because'], detail: '75 g · honey · not suitable for infants under one', stock: 2 },
    { id: 'socks', imageAlt: "A folded pair of blue socks with a small ice-lolly pattern.", name: 'Stay-in socks', category: 'Slow living', price: 260, color: '#d8c2b7', note: 'Cotton blend · a playful blue', description: 'Soft socks for chilly floors and happily cancelled plans. A cheerful blue pair with a small, playful pattern.', occasions: ['Birthday', 'Just because'], detail: 'One size · adult UK 4–8 · cotton blend', stock: 3 },
    { id: 'bookmark', imageAlt: "Hand-painted floral bookmarks hanging from small wooden pegs.", name: 'One more chapter', category: 'Paper & play', price: 90, color: '#dde0cc', note: 'Botanical bookmark · textured card', description: 'A tiny garden tucked between the pages. A floral bookmark on textured card for their latest favourite book.', occasions: ['Birthday', 'Thank you', 'Just because'], detail: '5 × 15 cm · textured card', stock: 3 },
    { id: 'coaster', imageAlt: "An iced drink resting on a woven brown coaster beside a red flower.", name: 'A place for your cup', category: 'Slow living', price: 150, color: '#e4d1b4', note: 'Woven coaster · natural brown', description: 'A useful little companion for their favourite cup. A simple woven coaster in warm natural tones.', occasions: ['Thank you', 'Just because'], detail: '10 cm diameter · woven natural fibre', stock: 3 },
    { id: 'seeds', imageAlt: "Orange marigold flowers in a garden, showing the flowers the seeds can grow into.", name: 'Something to grow', category: 'Small joys', price: 110, color: '#c8d2ba', note: 'Marigold seeds · paper packet', description: 'A tiny beginning. A packet of marigold seeds with a simple growing note, for a sunny windowsill or garden corner.', occasions: ['Thank you', 'Just because'], detail: '1 seed packet · marigold', stock: 3 },
    { id: 'posy', imageAlt: "A small bouquet of dried flowers and grasses tied with twine.", name: 'A forever little posy', category: 'Small joys', price: 230, color: '#dfc0b6', note: 'Dried stems · tied by hand', description: 'A small bunch of dried stems in soft natural tones. A finishing touch that can find a home in their smallest vase.', occasions: ['Birthday', 'Thank you', 'Just because'], detail: 'Approx. 15 cm · decorative dried flowers', stock: 2 },
    { id: 'keyring', imageAlt: "A dark leather loop keyring holding a small set of keys on a wooden table.", name: 'Take a little sunshine', category: 'Small joys', price: 170, color: '#e3c9a1', note: 'Leather loop · metal ring', description: 'A useful little addition to their everyday keys. A simple leather loop with a sturdy metal ring.', occasions: ['Birthday', 'Thank you'], detail: '8 cm · leather and metal', stock: 0 },
    {
      id: 'photo-frame', imageAlt: "A light wooden frame holding a typographic print on a shelf beside a small plant.", name: 'Personalised Photo Frame', category: 'Personalised Gifts', price: 599,
      color: '#e5d5c3', note: 'A favourite moment, framed',
      description: 'That holiday, that laugh, that ordinary day you still talk about. A frame for the photograph that brings it all back.',
      occasions: ['Birthday', 'Thank you', 'Just because'], detail: 'One tabletop photo frame', stock: 2
    },
    {
      id: 'name-necklace', imageAlt: "A gold-coloured necklace with an E pendant beside a red satin pouch.", name: 'Custom Name Necklace', category: 'Jewellery', price: 799,
      color: '#e8d2b8', note: 'A name worth keeping close',
      description: 'A delicate necklace with a personal touch. A small keepsake for someone whose name means a lot to you.',
      occasions: ['Birthday', 'Thank you', 'Just because'], detail: 'One necklace · adjustable chain', stock: 2
    },
    {
      id: 'chocolate-hamper', imageAlt: "An open gift box of assorted chocolates arranged in individual compartments.", name: 'Luxury Chocolate Hamper', category: 'Gift Hampers', price: 999,
      color: '#d4b8a4', note: 'A box for the chocolate person',
      description: 'An assortment of chocolates for after dinner, a quiet afternoon, or absolutely no occasion. Sharing is entirely optional.',
      occasions: ['Birthday', 'Thank you', 'Just because'], detail: 'One assorted chocolate hamper · contains milk; may contain nuts and soy', stock: 2
    },
    {
      id: 'teddy-rose-box', imageAlt: "A grey teddy bear wearing a blue scarf and holding a red rose against a pink background.", name: 'Teddy Bear & Rose Box', category: 'Romantic Gifts', price: 699,
      color: '#e5c2c4', note: 'A little hug, with a rose',
      description: 'A soft teddy and a rose, brought together for the person who makes your days a little warmer. Finish it with a few words of your own.',
      occasions: ['Birthday', 'Just because'], detail: 'One teddy bear and one decorative rose', stock: 2
    },
    {
      id: 'personalised-mug', imageAlt: "A ceramic mug printed with the words I like you a latte against a dark background.", name: 'Personalised Coffee Mug', category: 'Personalised Gifts', price: 349,
      color: '#e7ddd1', note: 'For their first cup of the day',
      description: 'A ceramic mug with room for a little personality. Something familiar to reach for on busy mornings and slow weekends.',
      occasions: ['Birthday', 'Thank you', 'Just because'], detail: 'One ceramic coffee mug', stock: 3
    },
    {
      id: 'candle-gift-set', imageAlt: "Pink taper candles beside a rose and a wrapped kraft gift box on a white surface.", name: 'Scented Candle Gift Set', category: 'Home & Lifestyle', price: 649,
      color: '#e4d7bf', note: 'A softer end to the day',
      description: 'A pair of scented candles for a favourite corner, a long bath, or an evening with the phone put away.',
      occasions: ['Birthday', 'Thank you', 'Just because'], detail: 'Two scented candles · never leave burning candles unattended', stock: 2
    },
    {
      id: 'birthday-surprise-box', imageAlt: "A golden gift box tied with pink and gold ribbons, surrounded by pastel confetti.", name: 'Birthday Surprise Box', category: 'Birthday Gifts', price: 1299,
      color: '#e6c6ab', note: 'A whole box of happy birthday',
      description: 'A birthday collection of small treats and keepsakes, ready for their special day. Add your message and make the moment theirs.',
      occasions: ['Birthday'], detail: 'One birthday gift assortment', stock: 2
    },
    {
      id: 'mini-bouquet', imageAlt: "A small bouquet of pale flowers and greenery wrapped in white paper.", name: 'Mini Flower Bouquet', category: 'Flowers', price: 499,
      color: '#d5d9c8', note: 'Small stems, a lovely gesture',
      description: 'A small hand-tied bouquet for a desk, a bedside table, or a doorstep surprise. Sometimes a few flowers say it best.',
      occasions: ['Birthday', 'Thank you', 'Just because'], detail: 'One mini bouquet · seasonal flowers and colours may vary', stock: 3
    },
    {
      id: 'friendship-memory-box', imageAlt: "A keepsake box filled with old black-and-white photographs and cards.", name: 'Friendship Memory Box', category: 'Friendship Gifts', price: 899,
      color: '#d8c4b3', note: 'For all your remember-whens',
      description: 'A keepsake box for shared photographs, ticket stubs, little notes, and the stories only the two of you understand.',
      occasions: ['Birthday', 'Thank you', 'Just because'], detail: 'One keepsake box · photographs and mementos shown are styling examples', stock: 2
    },
    {
      id: 'skincare-hamper', imageAlt: "Three Curology skincare containers beside a kraft box on a lilac background.", name: 'Skincare Gift Hamper', category: 'Self-Care Gifts', price: 1199,
      color: '#d9d1e0', note: 'A little time for themselves',
      description: 'A skincare selection for someone who could use an unhurried evening. A thoughtful addition to their everyday routine.',
      occasions: ['Birthday', 'Thank you', 'Just because'], detail: 'One skincare assortment · pictured brands are representative', stock: 2
    },
    {
      id: 'photo-keychain', imageAlt: "A clear acrylic keychain with floral linework and a printed illustration on a pink and pale blue background.", name: 'Custom Photo Keychain', category: 'Personalised Gifts', price: 249,
      color: '#ddcdd4', note: 'A small memory to take along',
      description: 'A pocket-sized keepsake for the keys they carry every day. A tiny reminder of a favourite person, place, or moment.',
      occasions: ['Birthday', 'Thank you', 'Just because'], detail: 'One photo keychain with a metal ring', stock: 3
    },
    {
      id: 'celebration-hamper', imageAlt: "An open turquoise gift box containing chocolate, tea, a mug, and a small llama-shaped planter.", name: 'Premium Celebration Hamper', category: 'Gift Hampers', price: 1799,
      color: '#ddc9a6', note: 'For the moments worth marking',
      description: 'A generous collection of treats and thoughtful keepsakes for a milestone, a big thank you, or some very good news.',
      occasions: ['Birthday', 'Thank you', 'Just because'], detail: 'One celebration gift assortment', stock: 2
    }
  ];
  const packaging = [
    { id: 'kraft', name: 'The natural one', color: '#b98b60', ribbon: '#653944', price: 80, note: 'Kraft box · plum ribbon' },
    { id: 'plum', name: 'A little dramatic', color: '#633543', ribbon: '#deb898', price: 120, note: 'Plum box · linen ribbon' },
    { id: 'rose', name: 'Softly, softly', color: '#dfb5a5', ribbon: '#814739', price: 120, note: 'Rose box · rust ribbon' }
  ];
  const bundles = [
    { id: 'slow-sunday', name: 'The slow Sunday', subtitle: 'For their well-deserved pause.', items: { candle: 1, tea: 1, socks: 1 }, packaging: 'kraft', occasion: 'Just because', color: '#e5dcc9' },
    { id: 'little-thanks', name: 'A little thank you', subtitle: 'For the person who always shows up.', items: { mug: 1, honey: 1, coaster: 1 }, packaging: 'rose', occasion: 'Thank you', color: '#dce0d3' },
    { id: 'birthday', name: 'Another lovely year', subtitle: 'For all the good things ahead.', items: { journal: 1, chocolate: 1, posy: 1 }, packaging: 'plum', occasion: 'Birthday', color: '#e3ceca' }
  ];
  const data = { products, packaging, bundles, maxItems: 6, delivery: 79, freeDeliveryAt: 1499, currency: 'INR' };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else root.TohfaData = data;
})(typeof globalThis !== 'undefined' ? globalThis : this);
