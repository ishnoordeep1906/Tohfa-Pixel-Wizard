(function () {
  'use strict';
  const D = window.TohfaData, M = window.TohfaModel;
  const main = document.getElementById('main');
  const STORAGE_KEY = 'tohfa-shopping-v1';
  let state = M.cleanState(null), storageAvailable = true, lastOrder = null, confirmAction = null;
  let toastTimer;
  const ui = { step: 0, category: 'All', search: '', shopCategory: 'All', occasion: 'All', maxPrice: '', sort: 'featured', checkout: { destination: 'gift' }, errors: {} };
  try { state = M.cleanState(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')); }
  catch (_) { try { localStorage.removeItem(STORAGE_KEY); } catch (_) { storageAvailable = false; } }
  const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const categories = ['All', ...new Set(D.products.map(p => p.category))];
  const productImage = (id, more = '') => `<img src="assets/${id}.webp" alt="${esc(M.product(id)?.imageAlt || M.product(id)?.name || '')}" width="720" height="800" decoding="async" ${more}>`;
  const arrow = '<span class="arrow" aria-hidden="true">↗</span>';
  const breadcrumb = label => `<div class="breadcrumb"><a href="#home">Home</a><span aria-hidden="true">/</span><span>${label}</span></div>`;
  const countText = n => `${n} ${n === 1 ? 'little thing' : 'little things'}`;
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; }
    catch (_) { storageAvailable = false; }
    document.getElementById('storage-notice').hidden = storageAvailable;
  }
  function toast(message) {
    const t = document.getElementById('toast');
    clearTimeout(toastTimer); t.textContent = message; t.classList.add('visible');
    toastTimer = setTimeout(() => t.classList.remove('visible'), 4200);
  }
  function ask(title, description, action) {
    confirmAction = action;
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-description').textContent = description;
    document.getElementById('confirm-dialog').showModal();
  }
  function route() { return (location.hash.slice(1).split('?')[0] || 'home'); }
  function go(where) { if (location.hash === `#${where}`) render(true); else location.hash = where; }
  function boxGrid(draft, removable = false) {
    const slots = Object.entries(draft.items).flatMap(([id, quantity]) => Array(quantity).fill(id));
    return `<div class="box-grid">${Array.from({ length: 6 }, (_, i) => `<div class="box-slot">${slots[i] ? `${productImage(slots[i])}${removable ? `<button class="slot-remove" data-action="remove-item" data-id="${slots[i]}" aria-label="Remove one ${esc(M.product(slots[i]).name)}">×</button>` : ''}` : `<span aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>`}</div>`).join('')}</div>`;
  }
  function noteCard(draft) {
    return `<div class="mini-card"><div class="card-to">${draft.to ? `Dear ${esc(draft.to)},` : 'To someone lovely,'}</div><p class="card-message">${draft.message ? esc(draft.message) : 'A little something, just for you.'}</p><div class="card-from">${draft.from ? `With love, ${esc(draft.from)}` : 'With love, you'}</div></div>`;
  }
  function productCard(p) {
    const inBox = state.draft.items[p.id] || 0;
    return `<article class="product-card" style="--tile:${p.color}"><button class="product-image" data-action="detail" data-id="${p.id}" id="detail-${p.id}" aria-label="Read about ${esc(p.name)}"><span class="product-category">${esc(p.category)}</span>${productImage(p.id, 'loading="lazy"')}${!p.stock ? '<span class="stock-label">Back soon</span>' : inBox ? `<span class="stock-label">${inBox} in your box</span>` : ''}</button><div class="product-info"><div><h3>${esc(p.name)}</h3><p>${esc(p.note)}</p><div class="product-price">${money(p.price)}</div></div><button id="add-${p.id}" class="add-button" data-action="add-item" data-id="${p.id}" aria-label="Add ${esc(p.name)} to your box" ${!p.stock ? 'disabled' : ''}><span aria-hidden="true">+</span></button></div></article>`;
  }
  function bundleCard(b) {
    const box = M.cleanDraft(b), p = M.pack(b.packaging);
    return `<a class="bundle-card" href="#builder" data-action="bundle" data-id="${b.id}"><div class="bundle-art" style="--tile:${b.color};--box-color:${p.color}"><span class="bundle-label">${esc(b.occasion)}</span><div class="bundle-photos">${Object.keys(b.items).map(id => productImage(id, 'loading="lazy"')).join('')}</div></div><div class="bundle-info"><div><h3>${esc(b.name)}</h3><p>${esc(b.subtitle)}</p><div class="bundle-edit">Make this one yours <span aria-hidden="true">↗</span></div></div><span class="bundle-price">${money(M.boxPrice(box).subtotal)}</span></div></a>`;
  }
  function storyArt() {
    return `<div class="story-photo"><img src="assets/story.webp" alt="A kraft-paper gift tied with cotton string, a red wax seal, and a small evergreen sprig." width="1200" height="1000" loading="lazy" decoding="async"><div class="story-note"><p class="eyebrow">THE BEST REASON TO GIVE</p><p>“I saw this and<br>thought of you.”</p></div></div>`;
  }
  function homePage() {
    return `<div class="container"><section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow"><span class="tiny-star" aria-hidden="true">✳</span> THE ART OF A LITTLE SOMETHING</p><h1 id="hero-title">Little things.<br><em>Big feelings.</em></h1><p class="hero-description">For your favourite people, and all the reasons you love them. Thoughtful little gifts, brought together by you.</p><div class="hero-actions"><a href="#builder" class="button">Build their box ${arrow}</a><a href="#collections" class="text-link" data-action="scroll-collections">A little inspiration <span aria-hidden="true">↓</span></a></div><p class="hero-footnote"><span>Picked by you</span><span>Wrapped with care</span><span>Always personal</span></p></div><div class="hero-art"><img src="assets/hero.webp" alt="A ribbon-wrapped blush gift box beside dried flowers and a glass reed diffuser, photographed in soft daylight." width="1400" height="1400" fetchpriority="high"><div class="hero-caption"><span>A BOX FULL OF YOU.</span><span>EST. IN GOOD INTENTIONS</span></div></div></section><div class="occasion-strip"><p>A good day to make their day.</p><div class="occasion-links"><a href="#shop?occasion=Birthday">A birthday ${arrow}</a><a href="#shop?occasion=Thank%20you">A thank you ${arrow}</a><a href="#shop?occasion=Just%20because">Just because ${arrow}</a></div></div><section id="collections" class="section" aria-labelledby="collections-title"><div class="section-heading"><div><p class="eyebrow">A FEW GOOD PLACES TO START</p><h2 id="collections-title">Some lovely combinations.</h2></div><p>Start with a little inspiration.<br>Then add your own kind of thoughtful.</p></div><div class="bundle-grid">${D.bundles.map(bundleCard).join('')}</div><p class="subtle-note" style="margin-top:20px">Box prices include packaging and a personal note. Delivery is calculated in your bag.</p></section></div><section class="process-strip" aria-label="How to build a gift"><div class="container process-inner"><div class="process-intro"><p class="eyebrow">MADE PERSONAL, SIMPLY</p><h2>Three little steps.</h2></div><div class="process-step"><span class="step-number">01.</span><h3>Find their favourites.</h3><p>Choose up to six little things. A treat, a keepsake, a little everyday joy.</p></div><div class="process-step"><span class="step-number">02.</span><h3>Wrap it your way.</h3><p>Pick a box and ribbon that feel just like them. We’ll keep the price clear.</p></div><div class="process-step"><span class="step-number">03.</span><h3>Say your thing.</h3><p>A few words from you. Because the note is often the part they keep.</p></div></div></section><section class="container section story-teaser">${storyArt()}<div><p class="eyebrow">A LITTLE ABOUT TOHFA</p><h2>It’s never just<br>what’s in the box.</h2><p>It’s the inside joke. The small thank you. The “you’ve got this” when they need it most. We’re here for gifts that feel like you know them.</p><a href="#story" class="text-link">The thought behind Tohfa ${arrow}</a></div></section>`;
  }
  function filterProducts() {
    let products = D.products.filter(p => (!ui.search || `${p.name} ${p.note} ${p.category}`.toLowerCase().includes(ui.search.toLowerCase())) && (ui.shopCategory === 'All' || p.category === ui.shopCategory) && (ui.occasion === 'All' || p.occasions.includes(ui.occasion)) && (ui.maxPrice === '' || p.price <= Number(ui.maxPrice)));
    if (ui.sort === 'low') products.sort((a,b) => a.price - b.price);
    if (ui.sort === 'high') products.sort((a,b) => b.price - a.price);
    if (ui.sort === 'name') products.sort((a,b) => a.name.localeCompare(b.name));
    return products;
  }
  function filterChip(key, label) { return `<button class="filter-chip" data-action="clear-filter" data-key="${key}" aria-label="Remove ${esc(label)} filter">${esc(label)}<span aria-hidden="true">×</span></button>`; }
  function catalogResults() {
    const products = filterProducts();
    const chips = [ui.search ? filterChip('search', `“${ui.search}”`) : '', ui.shopCategory !== 'All' ? filterChip('shopCategory', ui.shopCategory) : '', ui.occasion !== 'All' ? filterChip('occasion', ui.occasion) : '', ui.maxPrice !== '' ? filterChip('maxPrice', `Up to ${money(Number(ui.maxPrice))}`) : ''].join('');
    return `<div class="filter-meta"><div class="active-filters">${chips}${chips ? '<button class="text-button" data-action="reset-filters">Clear all</button>' : '<span>Small delights, all in one place.</span>'}</div><span role="status">${products.length} ${products.length === 1 ? 'little thing' : 'little things'}</span></div>${products.length ? `<div class="product-grid">${products.map(productCard).join('')}</div>` : '<div class="empty-state"><h2>Nothing here just yet.</h2><p>Try a different word or remove a filter. There are plenty of lovely things to find.</p><button class="button button-light" data-action="reset-filters">Clear filters</button></div>'}`;
  }
  function options(items, current) { return items.map(x => `<option value="${esc(x)}" ${x === current ? 'selected' : ''}>${esc(x)}</option>`).join(''); }
  function shopPage() {
    return `<div class="container"><div class="page-intro">${breadcrumb('The little things')}<p class="eyebrow">GOOD THINGS COME IN SMALL PACKAGES</p><h1>Find their little joys.</h1><p class="intro-description">The tea person. The list maker. The one who deserves a slow Sunday. There’s a little something here for them.</p></div><section class="catalog-layout" aria-label="Product catalogue">${M.count(state.draft) ? `<div class="shop-builder-banner"><p><strong>Your box is coming together.</strong>${countText(M.count(state.draft))} · ${money(M.boxPrice(state.draft).subtotal)} before delivery</p><a class="button button-small" href="#builder">See your box ${arrow}</a></div>` : ''}<div class="filter-bar"><label class="search-field"><svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="5"/><path d="m12 12 5 5"/></svg><span class="sr-only">Search products</span><input id="shop-search" type="search" data-filter="search" placeholder="Find a little something…" value="${esc(ui.search)}" autocomplete="off"></label><label class="sr-only" for="shop-category">Product category</label><select id="shop-category" data-filter="shopCategory">${options(categories, ui.shopCategory)}</select><label class="sr-only" for="shop-occasion">Occasion</label><select id="shop-occasion" data-filter="occasion">${options(['All','Birthday','Thank you','Just because'], ui.occasion)}</select><label for="shop-price" class="filter-label">Up to ₹</label><input id="shop-price" type="number" min="0" max="10000" step="10" placeholder="Any" value="${esc(ui.maxPrice)}" data-filter="maxPrice"><label class="sr-only" for="shop-sort">Sort products</label><select id="shop-sort" data-filter="sort"><option value="featured" ${ui.sort === 'featured' ? 'selected' : ''}>Our favourites</option><option value="low" ${ui.sort === 'low' ? 'selected' : ''}>Price: low to high</option><option value="high" ${ui.sort === 'high' ? 'selected' : ''}>Price: high to low</option><option value="name" ${ui.sort === 'name' ? 'selected' : ''}>Name: A to Z</option></select></div><div id="catalog-results">${catalogResults()}</div></section></div>`;
  }
  function sidebar() {
    const d = state.draft, p = M.pack(d.packaging), prices = M.boxPrice(d), estimate = M.totals([d]), left = d.budget - estimate.total, n = M.count(d);
    return `<aside id="your-box" class="box-sidebar" aria-label="Your box preview and price"><div class="sidebar-head"><h2>Your little box.</h2><span>${n} / 6 items</span></div><div class="box-preview" style="--box-color:${p.color}">${boxGrid(d, true)}</div>${n ? `<ul class="box-item-list">${Object.entries(d.items).map(([id,quantity]) => `<li><span class="item-name">${esc(M.product(id).name)}${quantity > 1 ? ` × ${quantity}` : ''}</span><span>${money(M.product(id).price * quantity)}</span><button class="remove-line" data-action="remove-item" data-id="${id}" aria-label="Remove one ${esc(M.product(id).name)}">−</button></li>`).join('')}</ul>` : '<p class="subtle-note" style="margin-bottom:16px">An empty box. A whole lot of possibilities.</p>'}<div id="sidebar-note">${noteCard(d)}</div><div class="budget-row"><label for="gift-budget">A budget to keep in mind</label><div class="budget-input">₹<input id="gift-budget" type="number" min="300" max="10000" step="1" value="${d.budget}" aria-describedby="budget-feedback"></div></div><div id="budget-meter">${budgetMeter(d)}</div><div class="price-lines"><div class="price-line"><span>Your little things</span><span>${money(prices.items)}</span></div><div class="price-line"><span>${esc(p.name)} + card</span><span>${money(prices.packaging)}</span></div><div class="price-line"><span>Estimated delivery</span><span>${n ? estimate.delivery ? money(estimate.delivery) : 'On us' : '—'}</span></div><div class="price-line total"><span>Estimated total</span><span>${money(estimate.total)}</span></div></div><button class="button button-full" data-action="save-box" ${!n ? 'disabled' : ''}>${d.id && state.cart.some(b => b.id === d.id) ? 'Save your changes' : 'Add this box to your bag'} ${arrow}</button><p class="sidebar-caption">Delivery is recalculated for all boxes in your bag.</p>${n ? '<button class="text-button" style="margin-top:10px" data-action="reset-box">Start this box again</button>' : ''}</aside>`;
  }
  function budgetMeter(d) {
    const total = M.totals([d]).total, left = d.budget - total;
    return `<div class="budget-bar ${left < 0 ? 'over' : ''}" role="meter" aria-label="Gift budget used" aria-valuemin="0" aria-valuemax="${Math.max(d.budget, total)}" aria-valuenow="${total}" aria-valuetext="${money(total)} estimated total; budget ${money(d.budget)}"><span style="width:${Math.min(100,total / d.budget * 100)}%"></span></div><p id="budget-feedback" class="budget-note ${left < 0 ? 'over' : ''}" role="status">${left < 0 ? `${money(-left)} over your budget. You can swap an item or adjust it.` : `${money(left)} left in your budget, including estimated delivery.`}</p>`;
  }
  function builderPanel() {
    const d = state.draft;
    if (ui.step === 0) return `<div class="builder-filter" aria-label="Filter by category">${categories.map(c => `<button class="category-pill" data-action="builder-category" data-category="${esc(c)}" aria-pressed="${ui.category === c}">${esc(c === 'All' ? 'All the little things' : c)}</button>`).join('')}</div><div class="product-grid">${D.products.filter(p => ui.category === 'All' || p.category === ui.category).map(productCard).join('')}</div><div class="builder-bottom-actions"><p>Up to six little things.<br>Each one chosen by you.</p><button class="button" data-action="step" data-step="1">Choose the wrapping ${arrow}</button></div>`;
    if (ui.step === 1) return `<div class="panel-intro"><h2>The outside matters, too.</h2><p>Three ways to wrap a lovely thought. Every box includes a ribbon, paper filling, and your personal message card.</p></div><div class="packaging-options">${D.packaging.map(p => `<button class="packaging-option" data-action="packaging" data-id="${p.id}" aria-pressed="${d.packaging === p.id}" style="--box-color:${p.color};--ribbon:${p.ribbon}"><span class="pack-swatch" aria-hidden="true"><span class="pack-box"></span></span><h3>${esc(p.name)}</h3><p>${esc(p.note)}</p><span class="pack-price">${money(p.price)} <span>${d.packaging === p.id ? '✓ Selected' : ''}</span></span></button>`).join('')}</div><p class="packaging-detail">The same six-item capacity, whichever colour you choose. Packaging is charged once for each box.</p><div class="builder-bottom-actions"><button class="text-button" data-action="step" data-step="0">← Back to the little things</button><button class="button" data-action="step" data-step="2">Write your note ${arrow}</button></div>`;
    return `<div class="panel-intro"><h2>Now, the part they’ll keep.</h2><p>A whole speech or just a few words. Your card is included, and every field here is optional.</p></div><div class="message-form"><div class="form-row"><div class="field"><label for="note-to">To</label><input id="note-to" data-note="to" maxlength="35" value="${esc(d.to)}" placeholder="Someone lovely" autocomplete="off"></div><div class="field"><label for="note-from">From</label><input id="note-from" data-note="from" maxlength="35" value="${esc(d.from)}" placeholder="Your name" autocomplete="off"></div></div><div class="field"><label for="note-message">Your little note</label><textarea id="note-message" data-note="message" maxlength="180" placeholder="For all the little things you do. This one’s for you." aria-describedby="message-count">${esc(d.message)}</textarea><div id="message-count" class="character-count">${d.message.length} / 180 characters</div></div><p class="message-hint">Leave these blank to use the simple greeting shown in the preview.</p></div><div class="note-preview-large"><p class="eyebrow">A PEEK AT THEIR CARD</p><div id="large-note">${noteCard(d)}</div></div><div class="builder-bottom-actions"><button class="text-button" data-action="step" data-step="1">← Back to wrapping</button><button class="button" data-action="save-box" ${!M.count(d) ? 'disabled' : ''}>${d.id && state.cart.some(b => b.id === d.id) ? 'Save changes' : 'Add to your bag'} ${arrow}</button></div>`;
  }
  function builderPage() {
    return `<div class="container"><div class="page-intro builder-intro"><div>${breadcrumb('Build a box')}<p class="eyebrow">A GIFT THAT COULD ONLY COME FROM YOU</p><h1>Let’s make their day.</h1><p>A few favourite things, a ribbon, and a little note. You know them best.</p></div><span class="saved-status">${storageAvailable ? 'Your box is saved as you go' : 'This session only'}</span></div><div class="builder-layout"><section class="builder-main" aria-label="Customise your gift"><div class="builder-tabs" role="tablist" aria-label="Gift building steps">${['The little things','The wrapping','Your words'].map((s,i) => `<button id="tab-${i}" class="builder-tab" data-action="step" data-step="${i}" role="tab" aria-selected="${ui.step === i}" tabindex="${ui.step === i ? '0' : '-1'}" aria-controls="builder-panel"><span>0${i+1}</span>${s}</button>`).join('')}</div><div id="builder-panel" class="builder-panel" role="tabpanel" aria-labelledby="tab-${ui.step}">${builderPanel()}</div></section>${sidebar()}</div></div><div class="mobile-builder-summary"><div><strong>${money(M.totals([state.draft]).total)}</strong><p>${M.count(state.draft)} / 6 little things · estimated total</p></div><button data-action="view-box">Take a peek at your box ↑</button></div>`;
  }
  function summary(showButton = false) {
    const t = M.totals(state.cart);
    return `<aside class="order-summary" aria-label="Order summary"><h2>The lovely details.</h2>${state.cart.map((b,i) => `<div class="summary-box-row">${productImage(Object.keys(b.items)[0])}<div>Box ${i+1}${b.to ? ` for ${esc(b.to)}` : ''}<p>${countText(M.count(b))} · ${esc(M.pack(b.packaging).name)}</p></div><span>${money(M.boxPrice(b).subtotal)}</span></div>`).join('')}<div class="price-lines"><div class="price-line"><span>Boxes & packaging</span><span>${money(t.subtotal)}</span></div><div class="price-line"><span>Delivery</span><span>${t.delivery ? money(t.delivery) : 'On us'}</span></div><div class="price-line total"><span>Total</span><span>${money(t.total)}</span></div></div><p class="free-delivery-note">${t.delivery ? `${money(D.freeDeliveryAt-t.subtotal)} away from complimentary delivery.` : 'A little extra kindness: delivery is included.'}</p>${showButton ? `<a href="#checkout" class="button button-full">On to the final details ${arrow}</a>` : '<a href="#bag" class="text-link">Edit your bag <span aria-hidden="true">↗</span></a>'}<p class="summary-note">All prices are illustrative and include taxes.<br>No payment is collected in this practice shop.</p></aside>`;
  }
  function bagPage() {
    if (!state.cart.length) return `<div class="container"><div class="page-intro">${breadcrumb('Your bag')}</div><div class="empty-state"><img src="assets/favicon.svg" alt="" width="65" height="65"><p class="eyebrow" style="margin-bottom:15px">ROOM FOR SOMETHING LOVELY</p><h1>Your bag is a little quiet.</h1><p>${M.count(state.draft) ? 'Your unfinished box is waiting in the builder. Add it to your bag when it feels just right.' : 'Start with a few favourite things. We’ll help you turn them into a gift that feels personal.'}</p><div class="empty-cart-actions"><a class="button" href="#builder">${M.count(state.draft) ? 'Return to your box' : 'Build your first box'} ${arrow}</a><a class="button button-light" href="#shop">Explore the little things</a></div></div></div>`;
    return `<div class="container"><div class="page-intro">${breadcrumb('Your bag')}<p class="eyebrow">ALL THAT THOUGHT, IN ONE PLACE</p><h1>Your lovely little bag.</h1><p>${state.cart.length} ${state.cart.length === 1 ? 'box' : 'boxes'}, ready for a final look.</p></div><div class="two-column"><div>${state.cart.map((b,i) => `<article class="bag-box"><div class="bag-box-visual" style="--box-color:${M.pack(b.packaging).color}">${boxGrid(b)}</div><div><div class="bag-box-top"><h2>${b.to ? `A box for ${esc(b.to)}` : `Your gift box ${i+1}`}</h2><span>${money(M.boxPrice(b).subtotal)}</span></div><p class="bag-meta">${esc(M.pack(b.packaging).note)} · ${countText(M.count(b))}</p><p>${Object.entries(b.items).map(([id,q]) => `${esc(M.product(id).name)}${q>1 ? ` × ${q}` : ''}`).join(' · ')}</p><p class="bag-box-message">“${esc(b.message || 'A little something, just for you.')}”</p><div class="bag-box-actions"><button class="text-button" data-action="edit-box" data-id="${esc(b.id)}">Edit this box</button><button class="text-button" data-action="remove-box" data-id="${esc(b.id)}">Remove</button></div></div></article>`).join('')}<button class="text-link" data-action="new-box" style="margin-top:20px">Build another little box <span class="arrow" aria-hidden="true">+</span></button></div>${summary(true)}</div></div>`;
  }
  function field(name, label, type='text', extra='') {
    const e = ui.errors[name];
    return `<div class="field"><label for="checkout-${name}">${label}</label><input id="checkout-${name}" name="${name}" type="${type}" value="${esc(ui.checkout[name] || '')}" ${extra} ${e ? `aria-invalid="true" aria-describedby="error-${name}"` : ''}><span id="error-${name}" class="field-error" ${e ? '' : 'hidden'}>${esc(e || '')}</span></div>`;
  }
  function checkoutPage() {
    const v = ui.checkout;
    return `<div class="container"><div class="page-intro">${breadcrumb('The final details')}<p class="eyebrow">A FEW DETAILS, THEN IT’S ALL WRAPPED UP</p><h1>Where’s the love going?</h1></div><div class="two-column"><div><p class="checkout-top-note"><strong>This is a practice checkout.</strong> Use sample details. No payment, email, or physical order will be sent.</p><form id="checkout-form" novalidate><section class="checkout-section"><h2>01. A little about you.</h2><div class="form-row">${field('buyer','Your name','text','autocomplete="name" maxlength="80" required')}${field('email','Your email','email','autocomplete="email" maxlength="120" required')}</div></section><section class="checkout-section"><h2>02. Who’s opening the box?</h2><div class="destination-options"><label class="radio-card"><input id="checkout-destination-gift" type="radio" name="destination" value="gift" ${v.destination !== 'self' ? 'checked' : ''}>Send to someone lovely</label><label class="radio-card"><input id="checkout-destination-self" type="radio" name="destination" value="self" ${v.destination === 'self' ? 'checked' : ''}>Send to me</label></div>${v.destination !== 'self' ? field('recipient','Recipient’s name','text','autocomplete="shipping name" maxlength="80" required') : '<p class="subtle-note" style="margin-bottom:18px">We’ll use your name from above for the delivery.</p>'}${field('address',v.destination === 'self' ? 'Your delivery address' : 'Recipient’s delivery address','text','autocomplete="shipping street-address" maxlength="200" placeholder="House number, street, area" required')}<div class="form-row">${field('city','City','text','autocomplete="shipping address-level2" maxlength="80" required')}${field('pincode','PIN code','text','autocomplete="shipping postal-code" inputmode="numeric" pattern="[1-9][0-9]{5}" maxlength="6" placeholder="6-digit Indian PIN" required')}</div><p class="subtle-note">India only in this prototype. All boxes in your bag go to this one address.</p></section><section class="checkout-section"><h2>03. One last look.</h2><p class="subtle-note">Your gift notes stay with their individual boxes. Delivery is ${M.totals(state.cart).delivery ? `${money(D.delivery)} for this order` : 'included with this order'}. No extra charges will be added.</p><label class="checkout-ack"><input id="checkout-acknowledged" name="acknowledged" type="checkbox" ${v.acknowledged ? 'checked' : ''} ${ui.errors.acknowledged ? 'aria-invalid="true" aria-describedby="error-acknowledged"' : ''}>I understand this is a simulated order and no payment or delivery will take place.</label><p id="error-acknowledged" class="field-error" ${ui.errors.acknowledged ? '' : 'hidden'}>${esc(ui.errors.acknowledged || '')}</p><button class="button button-rust button-full checkout-submit" type="submit">Complete practice order · ${money(M.totals(state.cart).total)} ${arrow}</button></section></form></div>${summary(false)}</div></div>`;
  }
  function orderPage() {
    if (!lastOrder) return `<div class="container"><div class="empty-state"><h1>A new little beginning.</h1><p>Order details are kept only for this visit. Your bag and unfinished box are saved separately in your browser.</p><a href="#builder" class="button">Make a lovely box ${arrow}</a></div></div>`;
    const o = lastOrder;
    return `<div class="container"><section class="confirmation"><div class="confirmation-stamp" aria-hidden="true">✓</div><p class="eyebrow">THOUGHTFULLY PUT TOGETHER</p><h1>That’s a lovely<br><em>little gesture.</em></h1><p>Your practice order is complete. Here’s a keepsake of the box you put together for ${esc(o.recipient)}.</p><div class="order-receipt"><div class="receipt-heading"><strong>${esc(o.id)}</strong><span>${esc(o.date)}</span></div>${o.cart.map((b,i) => `<div class="summary-box-row">${productImage(Object.keys(b.items)[0])}<div>Gift box ${i+1}<p>${countText(M.count(b))} · ${esc(M.pack(b.packaging).name)}</p></div><span>${money(M.boxPrice(b).subtotal)}</span></div>`).join('')}<div class="price-lines"><div class="price-line"><span>Delivery</span><span>${o.totals.delivery ? money(o.totals.delivery) : 'Included'}</span></div><div class="price-line total"><span>Practice order total</span><span>${money(o.totals.total)}</span></div></div><p class="receipt-recipient">For ${esc(o.recipient)} · ${esc(o.city)}, ${esc(o.pincode)}</p><p class="receipt-note">No payment was collected. No order, email, or delivery has been created. Contact details are not saved to browser storage.</p></div><div class="receipt-actions"><button class="button button-light" data-action="print-order">Print this keepsake</button><a href="#home" class="button">Back to the little things ${arrow}</a></div></section></div>`;
  }
  function storyPage() {
    return `<div class="container"><article class="story-page"><div class="story-page-head"><p class="eyebrow">TOHFA / A GIFT, A GESTURE, A LITTLE THOUGHT</p><h1>For the people<br>who make life <em>lovely.</em></h1><p>A birthday remembered. A favour returned. An ordinary Tuesday made a little brighter. That’s the kind of gifting we’re here for.</p></div><div class="story-page-content">${storyArt()}<div><h2>A small thing can<br>say quite a lot.</h2><p>We imagined Tohfa as a little shop for the moments that don’t always have a name. The friend who listened. The sibling starting something new. The person who makes your tea just right.</p><p>Start with a few good things, add a little of their personality, and finish with your own words. The best part of the box is the thought you put into it.</p><a class="text-link" href="#builder">Make someone’s day ${arrow}</a></div></div><div class="story-values"><div><span class="step-number">01.</span><h3>Personal, always.</h3><p>You choose the contents, the wrapping, and the words. Every little decision makes the gift feel more like you.</p></div><div><span class="step-number">02.</span><h3>Small is enough.</h3><p>A useful notebook. A good cup. A little chocolate. Thoughtful doesn’t need to mean extravagant.</p></div><div><span class="step-number">03.</span><h3>Nothing tucked away.</h3><p>Clear product, packaging, and delivery prices. Your budget stays beside you while your box comes together.</p></div></div></article></div>`;
  }
  function helpPage() {
    return `<div class="container"><section class="help-page"><p class="eyebrow">THE SMALL PRINT, MADE SIMPLE</p><h1>A little help.</h1><p>Everything you might wonder while putting a box together.</p><div class="faq"><details open><summary>How does building a box work?</summary><p>Pick between one and six items, choose a packaging colour, and add an optional personal message. Add the box to your bag when it feels right. You can edit it from your bag or create another box.</p></details><details><summary>What’s included in the packaging price?</summary><p>The selected box, a matching ribbon, paper filling, and one message card. Natural kraft packaging is ${money(80)}; plum and rose packaging are ${money(120)}. This is charged once per box.</p></details><details><summary>How is delivery calculated?</summary><p>Delivery is ${money(D.delivery)} per order, or included when your boxes and packaging total at least ${money(D.freeDeliveryAt)}. The builder estimates delivery for one box; your bag recalculates it across the whole order. Prices include illustrative taxes. This practice shop does not offer real delivery.</p></details><details><summary>Can I send boxes to different people?</summary><p>You can personalise each box with a different name and message. One practice order uses a single delivery address for all boxes. For another address, complete one order and start another.</p></details><details><summary>Will my unfinished box be saved?</summary><p>Your product choices, gift note, budget, and bag are stored only in this browser when browser storage is available. They aren’t synchronised between devices. Checkout addresses and email details are not stored. Use “Clear saved shopping data” in the footer to remove the saved box and bag.</p></details><details><summary>Can I change my mind after adding a box?</summary><p>Absolutely. Select “Edit this box” in your bag. Change the contents, packaging, or note, then save your changes. The previous version stays in the bag until you save.</p></details><details><summary>Are these real products or orders?</summary><p>No. Tohfa is a fictional frontend practice project. Product descriptions, prices, availability, and delivery charges are illustrative. Checkout validates sample details and shows a local confirmation; it does not charge money, email anyone, or place an order. There is no real returns or customer-service operation.</p></details></div><div class="help-project"><h2>Made with a little thought.</h2><p>This project explores an original commercial website for a gifting business. The gift and product photographs are by independent photographers on Unsplash. They illustrate our fictional collection; props and pictured brands are not included in an order. The shop, builder, and simulated checkout run in your browser. No accounts, payment details, or external services are needed. <a href="photography.html" class="text-button">Photography credits</a>.</p><a href="#builder" class="text-link" style="margin-top:15px">Back to something lovely ${arrow}</a></div></section></div>`;
  }
  function render(scroll = false) {
    const r = route();
    if (r === 'main') return;
    if (r === 'collections') { go('home'); return; }
    if (r === 'checkout' && !state.cart.length) { go('bag'); return; }
    const active = document.activeElement;
    const focusId = active?.id;
    const focusAction = active?.dataset?.action, focusProduct = active?.dataset?.id, focusCategory = active?.dataset?.category;
    const start = active?.selectionStart, end = active?.selectionEnd;
    const pages = { home: homePage, shop: shopPage, builder: builderPage, bag: bagPage, checkout: checkoutPage, order: orderPage, story: storyPage, help: helpPage };
    main.innerHTML = (pages[r] || homePage)();
    const titles = { home: 'Little things. Big feelings.', shop: 'The little things', builder: 'Build their box', bag: 'Your lovely little bag', checkout: 'The final details', order: 'A lovely little gesture', story: 'Our story', help: 'A little help' };
    document.title = `Tohfa — ${titles[r] || titles.home}`;
    document.getElementById('bag-count').textContent = state.cart.length;
    document.querySelectorAll('[data-nav]').forEach(el => { if (el.dataset.nav === r) el.setAttribute('aria-current','page'); else el.removeAttribute('aria-current'); });
    document.getElementById('storage-notice').hidden = storageAvailable;
    if (scroll) { window.scrollTo({ top: 0, behavior: 'instant' }); main.focus({ preventScroll: true }); }
    else if (focusId || focusAction) {
      const replacement = (focusId && document.getElementById(focusId)) || [...document.querySelectorAll('[data-action]')].find(el => el.dataset.action === focusAction && el.dataset.id === focusProduct && el.dataset.category === focusCategory);
      replacement?.focus({ preventScroll: true });
      if (replacement?.setSelectionRange && typeof start === 'number') { try { replacement.setSelectionRange(start, end); } catch (_) {} }
    }
  }
  function openProduct(id) {
    const p = M.product(id); if (!p) return;
    document.getElementById('dialog-content').innerHTML = `<div class="product-dialog-grid"><button class="close-dialog" data-action="close-product" aria-label="Close product details">×</button><div class="dialog-art" style="--tile:${p.color}">${productImage(p.id)}</div><div class="dialog-copy"><p class="eyebrow">${esc(p.category)}</p><h2 id="dialog-title">${esc(p.name)}</h2><p class="detail-description">${esc(p.description)}</p><p class="detail-spec">${esc(p.detail)}</p><p class="detail-price">${money(p.price)}</p><button class="button button-full" data-action="modal-add" data-id="${p.id}" ${!p.stock ? 'disabled' : ''}>${p.stock ? 'Add a little joy' : 'Back soon'} ${p.stock ? arrow : ''}</button></div></div>`;
    document.getElementById('product-dialog').showModal();
  }
  function updateNote() {
    const side = document.getElementById('sidebar-note'), large = document.getElementById('large-note'), counter = document.getElementById('message-count');
    if (side) side.innerHTML = noteCard(state.draft);
    if (large) large.innerHTML = noteCard(state.draft);
    if (counter) counter.textContent = `${state.draft.message.length} / 180 characters`;
  }
  function resetFilters() { ui.search = ''; ui.shopCategory = 'All'; ui.occasion = 'All'; ui.maxPrice = ''; ui.sort = 'featured'; }
  function setStep(step) {
    ui.step = Math.max(0,Math.min(2,Number(step))); render();
    document.getElementById(`tab-${ui.step}`)?.focus({ preventScroll: true });
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action, id = button.dataset.id;
    event.preventDefault();
    try {
      if (action === 'skip-main') { main.focus({ preventScroll:true }); main.scrollIntoView({ behavior:'instant' }); }
      else if (action === 'detail') openProduct(id);
      else if (action === 'close-product') document.getElementById('product-dialog').close();
      else if (action === 'add-item' || action === 'modal-add') {
        state.draft = M.add(state.draft, id); persist();
        if (action === 'modal-add') document.getElementById('product-dialog').close();
        render(); toast(`${M.product(id).name} is in your box. ${M.count(state.draft)} of 6 items chosen.`);
      }
      else if (action === 'remove-item') { state.draft = M.remove(state.draft,id); persist(); render(); toast('A little room made in your box.'); }
      else if (action === 'builder-category') { ui.category = button.dataset.category; render(); }
      else if (action === 'step') setStep(button.dataset.step);
      else if (action === 'packaging') { state.draft.packaging = id; persist(); render(); toast(`${M.pack(id).name} selected.`); }
      else if (action === 'save-box') {
        const wasEdit = state.cart.some(b => b.id === state.draft.id);
        state.cart = M.saveBox(state.cart, state.draft, `box-${Date.now()}-${Math.random().toString(36).slice(2,8)}`);
        state.draft = M.blank(); ui.step = 0; persist(); go('bag'); toast(wasEdit ? 'Your lovely changes are saved.' : 'Your box is in the bag. A lovely little choice.');
      }
      else if (action === 'reset-box') ask('Start with a fresh box?', 'This clears the current contents and note. Any boxes already saved in your bag will stay there.', () => { state.draft = M.blank(); ui.step = 0; persist(); render(); toast('A fresh little beginning.'); });
      else if (action === 'bundle') {
        const b = D.bundles.find(x => x.id === id); if (!b) return;
        const load = () => { state.draft = M.cleanDraft({ ...b, id: null }); ui.step = 0; ui.category = 'All'; persist(); go('builder'); toast('A lovely starting point. Make it your own.'); };
        if (M.count(state.draft)) ask('Start with this combination?', 'This replaces your unfinished box. Saved boxes in your bag will stay as they are.', load); else load();
      }
      else if (action === 'edit-box') {
        const b = state.cart.find(x => x.id === id); if (!b) return;
        const edit = () => { state.draft = M.cleanDraft(b); ui.step = 0; persist(); go('builder'); };
        if (M.count(state.draft) && state.draft.id !== id) ask('Switch to this saved box?', 'Your unfinished changes will be replaced. The saved box will only change when you save it again.', edit); else edit();
      }
      else if (action === 'remove-box') ask('Take this box out of your bag?', 'You can always create another little something later.', () => { state.cart = state.cart.filter(b => b.id !== id); if (state.draft.id === id) state.draft = M.blank(); persist(); render(); toast('The box has been removed.'); });
      else if (action === 'new-box') {
        if (M.count(state.draft)) { go('builder'); toast('Your unfinished box is waiting for you.'); }
        else { state.draft = M.blank(); ui.step = 0; persist(); go('builder'); }
      }
      else if (action === 'view-box') document.getElementById('your-box')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start' });
      else if (action === 'scroll-collections') document.getElementById('collections')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      else if (action === 'clear-filter') { const key = button.dataset.key; if (['search','maxPrice'].includes(key)) ui[key] = ''; else if (['shopCategory','occasion'].includes(key)) ui[key] = 'All'; render(); }
      else if (action === 'reset-filters') { resetFilters(); render(); }
      else if (action === 'print-order') window.print();
      else if (action === 'clear-data') ask('Clear your saved shopping data?', 'This removes the unfinished box and all boxes in your bag from this browser. It cannot be undone.', () => { state = M.cleanState(null); ui.checkout = { destination:'gift' }; ui.errors = {}; lastOrder = null; persist(); go('home'); toast('Your saved shopping data has been cleared.'); });
      else if (action === 'cancel-confirm') { confirmAction = null; document.getElementById('confirm-dialog').close(); }
      else if (action === 'accept-confirm') { const fn = confirmAction; confirmAction = null; document.getElementById('confirm-dialog').close(); fn?.(); }
    } catch (error) { toast(error.message || 'Something needs another look. Please try again.'); }
  });
  document.addEventListener('input', event => {
    const el = event.target;
    if (el.dataset.filter) {
      ui[el.dataset.filter] = el.value;
      const results = document.getElementById('catalog-results'); if (results) results.innerHTML = catalogResults();
    }
    if (el.dataset.note) { state.draft[el.dataset.note] = el.value; persist(); updateNote(); }
    if (el.id === 'gift-budget') {
      const n = Number(el.value);
      if (el.value !== '' && Number.isFinite(n) && n >= 300 && n <= 10000) { state.draft.budget = Math.round(n); persist(); document.getElementById('budget-meter').innerHTML = budgetMeter(state.draft); }
    }
    if (el.closest('#checkout-form') && el.name) {
      ui.checkout[el.name] = el.type === 'checkbox' ? el.checked : el.value;
      if (ui.errors[el.name]) { delete ui.errors[el.name]; el.removeAttribute('aria-invalid'); document.getElementById(`error-${el.name}`)?.setAttribute('hidden',''); }
    }
  });
  document.addEventListener('change', event => {
    const el = event.target;
    if (el.id === 'gift-budget') {
      if (!el.validity.valid || el.value === '') { el.value = state.draft.budget; toast('Choose a whole-rupee budget between ₹300 and ₹10,000.'); }
    }
    if (el.name === 'destination') { ui.checkout.destination = el.value; delete ui.errors.recipient; render(); }
  });
  document.addEventListener('keydown', event => {
    if (event.target.getAttribute('role') === 'tab' && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
      event.preventDefault(); const step = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (ui.step + (event.key === 'ArrowRight' ? 1 : 2)) % 3; setStep(step);
    }
    if (event.key === 'Escape') { document.getElementById('mobile-nav').hidden = true; document.getElementById('menu-toggle').setAttribute('aria-expanded','false'); }
  });
  document.addEventListener('submit', event => {
    if (event.target.id !== 'checkout-form') return;
    event.preventDefault();
    if (!state.cart.length) { go('bag'); return; }
    const values = Object.fromEntries(new FormData(event.target));
    values.acknowledged = Boolean(values.acknowledged);
    ui.checkout = values; ui.errors = M.validateCheckout(values);
    if (Object.keys(ui.errors).length) { render(); const first = document.getElementById(`checkout-${Object.keys(ui.errors)[0]}`); first?.focus(); toast('A few details need a little attention.'); return; }
    const recipient = (values.destination === 'self' ? values.buyer : values.recipient).trim();
    lastOrder = { id: `TOHFA-${Date.now().toString(36).toUpperCase()}`, date: new Date().toLocaleDateString('en-IN', { day:'numeric',month:'short',year:'numeric' }), cart: state.cart.map(M.cleanDraft), totals: M.totals(state.cart), recipient, city: values.city.trim(), pincode: values.pincode.trim() };
    if (state.draft.id && state.cart.some(b => b.id === state.draft.id)) state.draft = M.blank();
    state.cart = []; ui.checkout = { destination:'gift' }; ui.errors = {}; persist(); go('order');
  });
  document.getElementById('menu-toggle').addEventListener('click', () => {
    const menu = document.getElementById('mobile-nav'), button = document.getElementById('menu-toggle');
    menu.hidden = !menu.hidden; button.setAttribute('aria-expanded',String(!menu.hidden)); button.setAttribute('aria-label',menu.hidden ? 'Open navigation' : 'Close navigation');
  });
  document.getElementById('confirm-dialog').addEventListener('cancel', () => { confirmAction = null; });
  window.addEventListener('hashchange', () => {
    const r = route();
    document.getElementById('mobile-nav').hidden = true; document.getElementById('menu-toggle').setAttribute('aria-expanded','false'); document.getElementById('menu-toggle').setAttribute('aria-label','Open navigation');
    if (r === 'shop') { const params = new URLSearchParams(location.hash.split('?')[1] || ''); if (params.has('occasion')) { resetFilters(); const o = params.get('occasion'); if (['Birthday','Thank you','Just because'].includes(o)) ui.occasion = o; } }
    render(true);
  });
  const initialParams = new URLSearchParams(location.hash.split('?')[1] || '');
  if (['Birthday','Thank you','Just because'].includes(initialParams.get('occasion'))) ui.occasion = initialParams.get('occasion');
  document.getElementById('year').textContent = new Date().getFullYear();
  render();
  // Browser storage can be disabled even when reading it did not throw.
  persist();
})();
