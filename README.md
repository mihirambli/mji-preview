# MJI Perfumes — homepage redesign prototype

A standalone version of the mjiperfumes.com homepage with the scroll animation as the hero and
the survey's homepage-relevant fixes applied. Product data, prices, notes and photos are the
client's own, as listed on the live site (Nov 2026); photos are loaded straight from
mjiperfumes.com, so nothing was copied.

```bash
node mji-homepage/server.mjs      # http://localhost:5174
```

## Page structure (top to bottom)

| # | Section | What changed vs the live homepage |
|---|---|---|
| 1 | Announcement + header | Nav simplified to Perfumes · Attars · Oud Oil · Bakhoor & Gifts · Discovery Set · Our Story (was Shop / Collections / Attars overlapping). Sticky, readable, phone menu. |
| 2 | **Scroll reel hero** | Bottle fills → caps → boxes as you scroll. Headline + "Shop bestsellers" / "Find your fragrance" visible on the first frame (live hero showed no text at first paint). |
| 3 | Trust strip | Kept (QR-verified, Razorpay, 2–3 days, free over ₹1,999, WhatsApp). |
| 4 | Shop by category | **One** category section (live site had "Featured collections" + "Shop by category" showing the same tiles). Counts fixed: 16 perfumes, 22 attars, 2 oud oil grades (live said "3 attars", "17 fragrances"). "From ₹…" on every tile. Oud oil gets its own tile. |
| 5 | Bestsellers | Filter chips (All / Perfumes / Attars / Oud oil / Bakhoor). Cards show **notes** (top → heart → base), **size picker with live price + ₹/ml**, honest "best value" (only when one size really is cheapest per ml — live site labels 100 ml "best value" at the same ₹40/ml as 10 ml), one-tap **Add to bag**. |
| 6 | Discovery Set | **Proposed product** (light ivory section): 5 × 2 ml, price as credit. ₹699 is a placeholder price for the client to decide. |
| 7 | Pure oud oil, graded | Super vs Super AAA with all size prices — the most premium products were buried in the grid. |
| 8 | From the tree to your skin | The nursery→bottle story told **once** (live homepage tells it three times), with the 112 kg export and ODOP facts as stats. |
| 9 | Verify your bottle | QR traceability, light section. |
| 10 | Layer it with bakhoor | The ritual from the product page, now a one-tap pair (Oudh Assamica 50 ml + Bakhoor Set, ₹4,000 = sum of both, no discount invented). |
| 11 | Fragrance finder band | Kept, shorter. |
| 12 | Reviews | **Layout only**, clearly labelled — needs real customer reviews (none exist on the live site). |
| 13 | Footer | Shop / The house / Help columns. |

Also: text contrast raised (secondary text ~8:1 vs ~3:1 on live), no content hidden behind
scroll-reveal animations, product photos slightly brightened, free-shipping progress shown
after every add to bag, WhatsApp button hidden only while the phone hero animation plays.

## Not real yet (needs the client or their code)
- Bag / checkout: "Add to bag" updates a counter and toast only — wire to their cart.
- Discovery Set and its price — a proposal.
- Reviews — need a collection method (post-delivery email / WhatsApp).
- Category counts are typed in; in their Next.js code they should come from the catalogue.
- The bottle in the animation is the generic draft bottle with "MJI" on the label.
- SEO descriptions on the live product pages say "From ₹4,000" for Oudh Assamica while the
  10 ml is ₹400 — fix in their product metadata.

## Swapping in final frames
```powershell
cd ..\scroll-animation\blender
.\render.ps1 -Quality final -Scene perfume_scene_mji.blend -Dest ..\..\mji-homepage\frames
.\render.ps1 -Quality final -Variant mobile -Scene perfume_scene_mji.blend -Dest ..\..\mji-homepage\frames
```
