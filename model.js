(function (root) {
  'use strict';
  const D = typeof module !== 'undefined' && module.exports ? require('./data.js') : root.TohfaData;
  const product = id => D.products.find(p => p.id === id);
  const pack = id => D.packaging.find(p => p.id === id) || D.packaging[0];
  const blank = () => ({ id: null, items: {}, packaging: 'kraft', message: '', to: '', from: '', budget: 1500 });
  const text = (value, max) => typeof value === 'string' ? value.slice(0, max) : '';
  function cleanDraft(raw) {
    const d = blank();
    if (!raw || typeof raw !== 'object') return d;
    d.id = typeof raw.id === 'string' ? raw.id.slice(0, 80) : null;
    d.packaging = pack(raw.packaging).id;
    d.budget = Number.isFinite(Number(raw.budget)) ? Math.max(300, Math.min(10000, Math.round(Number(raw.budget)))) : 1500;
    d.message = text(raw.message, 180); d.to = text(raw.to, 35); d.from = text(raw.from, 35);
    let remaining = D.maxItems;
    for (const p of D.products) {
      const n = Math.max(0, Math.min(p.stock, remaining, Math.floor(Number(raw.items?.[p.id]) || 0)));
      if (n) { d.items[p.id] = n; remaining -= n; }
    }
    return d;
  }
  const count = d => Object.values(d.items).reduce((a, b) => a + b, 0);
  function boxPrice(d) {
    const items = Object.entries(d.items).reduce((sum, [id, n]) => sum + (product(id)?.price || 0) * n, 0);
    const packaging = count(d) ? pack(d.packaging).price : 0;
    return { items, packaging, subtotal: items + packaging };
  }
  function totals(cart) {
    const subtotal = cart.reduce((sum, b) => sum + boxPrice(b).subtotal, 0);
    const delivery = subtotal > 0 && subtotal < D.freeDeliveryAt ? D.delivery : 0;
    return { subtotal, delivery, total: subtotal + delivery };
  }
  function add(draft, id) {
    const d = cleanDraft(draft); const p = product(id);
    if (!p || p.stock < 1) throw new Error('This little thing is currently unavailable. Choose another favourite.');
    if (count(d) >= D.maxItems) throw new Error('Your box holds up to 6 items. Remove something to make a little room.');
    if ((d.items[id] || 0) >= p.stock) throw new Error(`Only ${p.stock} of this item can go in one box.`);
    d.items[id] = (d.items[id] || 0) + 1;
    return d;
  }
  function remove(draft, id) {
    const d = cleanDraft(draft);
    if (d.items[id] > 1) d.items[id]--; else delete d.items[id];
    return d;
  }
  function saveBox(cart, draft, id) {
    const d = cleanDraft(draft);
    if (!count(d)) throw new Error('Choose at least one little thing for your box.');
    const next = cart.map(cleanDraft);
    const index = d.id ? next.findIndex(b => b.id === d.id) : -1;
    if (index < 0 && next.length >= 6) throw new Error('Your bag holds up to 6 boxes. Finish this order before creating more.');
    d.id = index >= 0 ? next[index].id : id;
    if (typeof d.id !== 'string' || !d.id) throw new Error('The box needs an identifier. Please try again.');
    if (index >= 0) next[index] = d; else next.push(d);
    return next;
  }
  function cleanState(raw) {
    const seen = new Set();
    const cart = (Array.isArray(raw?.cart) ? raw.cart : []).map(cleanDraft).filter(d => {
      if (!count(d) || !d.id || seen.has(d.id)) return false;
      seen.add(d.id); return true;
    }).slice(0, 6);
    return { version: 1, draft: cleanDraft(raw?.draft), cart };
  }
  function validateCheckout(values) {
    const e = {};
    if (!String(values.buyer || '').trim()) e.buyer = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email || '').trim())) e.email = 'Enter an email address, such as you@example.com.';
    if (values.destination !== 'self' && !String(values.recipient || '').trim()) e.recipient = 'Who is this lovely box going to?';
    if (String(values.address || '').trim().length < 5) e.address = 'Enter a house number and street or area.';
    if (!String(values.city || '').trim()) e.city = 'Please enter a city.';
    if (!/^[1-9][0-9]{5}$/.test(String(values.pincode || '').trim())) e.pincode = 'Enter a valid 6-digit Indian PIN code.';
    if (!values.acknowledged) e.acknowledged = 'Please acknowledge that this is a practice checkout.';
    return e;
  }
  const api = { product, pack, blank, cleanDraft, count, boxPrice, totals, add, remove, saveBox, cleanState, validateCheckout };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TohfaModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
