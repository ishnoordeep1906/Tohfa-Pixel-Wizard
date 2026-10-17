Tohfa — Little things. Big feelings.

Tohfa is a responsive gift-shop frontend built around personalised gifting. Customers can browse a collection of small gifts, choose a ready-made combination, or build a box with their own selection, packaging, and message.

The project uses HTML, CSS, and vanilla JavaScript. It runs without a framework, build step, or package installation.

Features

Storefront

Twelve products with real photographs, descriptions, prices, and availability states.

Search by product name, category, or short description.

Filters for category, occasion, and maximum price, with sorting options.

Product details in an accessible dialog.

Three starter gift combinations that customers can customise.

Dedicated brand story, help, and photography credits pages.

Gift-box builder

Choose between one and six items per box, within each product's quantity limit.

Add and remove items with an updated box preview and price breakdown.

Select natural kraft, plum, or rose packaging.

Add a recipient name, sender name, and personal message with a live card preview.

Set a budget and see how the box total compares, including estimated delivery.

Bag and checkout

Keep up to six independently personalised boxes in one bag.

Edit or remove a saved box before checkout.

Calculate delivery across the whole bag.

Validate buyer, recipient, and delivery details in a guest checkout form.

Display an order summary and printable confirmation.

Usability

Responsive layouts for mobile, tablet, and desktop.

Keyboard navigation, visible focus states, accessible dialogs, and reduced-motion support.

Saved drafts and bags using browser local storage.

Recovery from invalid saved data and an option to clear shopping data.

Continued use within the current session when browser storage is unavailable.

Technology

Technology

Purpose

HTML5

Page structure, navigation, forms, and dialogs

CSS3

Layout, responsive styling, and visual states

JavaScript

Routing, catalogue filtering, gift builder, bag, and checkout interaction

Local Storage

Retaining draft boxes and bag contents in the current browser

WebP

Locally bundled product and gift photography

Node.js test runner

Tests for business rules and application journeys

Getting started

Download and extract the project, then open dist/index.html in a modern browser. All required scripts, styles, fonts, and images are local or system-provided, so the storefront can run offline.

For local development, you can also serve the project over HTTP. From the project root, with Python installed, run:

python -m http.server 8000 --directory dist

Open http://localhost:8000 in your browser.

Navigation uses URL hashes, so the pages work on a static host without additional route configuration. Saving progress depends on the browser allowing local storage; private browsing and local-file settings can affect persistence.

Project structure

Path

Contents

dist/index.html

Shared page shell, navigation, footer, and dialogs

dist/styles.css

Branding, component styles, and responsive layouts

dist/data.js

Product catalogue, packaging options, starter combinations, and pricing settings

dist/model.js

Pricing, item limits, validation, and saved-data handling

dist/app.js

Page rendering, hash routing, and event handling

dist/photography.html

Photographer credits and original source links

dist/assets/

Fourteen WebP photographs, photo metadata, and brand icon

tests/model.test.cjs

Business-rule and data-handling tests

tests/application.test.cjs

Application interaction and checkout-flow tests

ATTRIBUTION.md

Photography sources and asset licensing notes

Pricing and box rules

All catalogue prices are displayed in Indian rupees (INR). The current configuration uses these rules:

Setting

Value

Items per box

1–6, subject to product quantity limits

Boxes per bag

Up to 6

Natural kraft packaging

₹80 per box

Plum or rose packaging

₹120 per box

Delivery

₹79 per order

Free-delivery threshold

₹1,499 in products and packaging

Packaging is charged once per non-empty box. The builder estimates delivery for the current box; the bag recalculates delivery for all boxes together. Exceeding a chosen budget shows feedback without blocking the customer.

Product prices are read from the catalogue rather than trusted from saved browser data. The box preview shows the selection visually; it does not calculate physical packing dimensions.

Customisation

Update dist/data.js to change products, prices, availability, packaging, and starter combinations.

Update dist/styles.css to adjust colours, typography, spacing, and responsive layouts.

Update dist/app.js to change page content and interactions.

Replace images in dist/assets/, keeping their filenames or updating the relevant references. Keep image descriptions and photography credits consistent with the replacements.

Data and privacy

Draft boxes, bag contents, budgets, and gift-note names and messages are saved in local storage when available. This data stays in the current browser and is not synchronised across devices. Customers can remove it using Clear saved shopping data in the footer.

Checkout contact details, delivery addresses, and order confirmations are held in memory for the current visit and are not written to local storage. User-entered text is escaped before insertion into rendered HTML.

Backend integration

This repository currently contains the frontend. Checkout validates details and displays a confirmation, but it does not collect payment, submit an order to a server, send an email, or arrange delivery. Availability and quantity limits come from the local catalogue rather than a live inventory service.

Before accepting customer orders, connect a backend for inventory, order storage, payment processing, and notifications. The server must independently validate prices, quantities, availability, delivery charges, and payment status. Browser storage should not be used as the authoritative order record.

Testing

With Node.js installed, run the tests from the project root:

node --test tests/*.test.cjs

The tests cover pricing, delivery thresholds, item and bag limits, saved-box edits, invalid storage recovery, checkout validation, HTML escaping, filtering, and complete order-form journeys.

Application tests use a lightweight DOM facade. They do not replace browser testing. Before release, check mobile and desktop layouts, keyboard navigation, dialog focus, image loading, saved-state behaviour, and printing in the supported browsers.

Deployment

Upload the contents of dist/ to a static hosting service. Use dist as the publish directory and index.html as the entry page. No build command is required for the current frontend.

Photography and credits

The website includes twelve product photographs, a main gift photograph, and a wrapping-detail photograph sourced from Unsplash. These are representative stock images; pictured brands and photographers are not affiliated with Tohfa.

The images are stored locally as optimised WebP files, totalling under 1 MB. Source links and licensing details are recorded in ATTRIBUTION.md, dist/assets/photos.json, and the photography credits page.

The flower logo and interface icons use SVG or CSS. Typography uses system fonts, including Georgia and Arial, with fallbacks.