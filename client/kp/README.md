# Krishna Sweets

Premium JavaScript frontend for a heritage Indian sweets house established in 1946.

## Commands

- `npm run dev` — start the local development server
- `npm run build` — create a production build
- `npm run lint` — run static analysis

## Content replacement

All business details and navigation content live in `src/data/site.js`. Product and editorial data use the same central-data pattern. Development image files belong in `public/assets/images`; their replacement and source notes are documented there.

## Editing page sections

Each content-heavy page has a `sections` folder. Edit the matching file without touching the whole page:

- `src/pages/HomePage/sections` — hero, promises, categories, best sellers, review preview and heritage
- `src/pages/AboutPage/sections` — hero, brand story, family story, purity promise and timeline
- `src/pages/ReviewsPage/sections` — hero, trust stats, featured testimonial and review cards
- `src/pages/FaqPage/sections` — FAQ hero and accordion
- `src/pages/ContactPage/sections` — contact hero, details/form and map

The page-level `.module.css` file contains the styles for its sections. Shared site components such as the header, footer, cart, product cards and buttons remain under `src/components`.


https://krishna-sweets-three.vercel.app
