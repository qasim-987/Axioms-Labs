/* Optional isolated QA: NODE_PATH=/path/to/browser-tools/node_modules node scripts/check-card-transitions.cjs
 * Requires Playwright, @sparticuz/chromium and pngjs outside application dependencies.
 * CAPTURE_DIR overrides the default .cache folder; BASE_URL defaults to localhost:3000.
 * Captures 40px increments through all three transitions both directions at both sizes.
 */
const fs = require("fs"),
  { chromium } = require("playwright"),
  bin = require("@sparticuz/chromium").default,
  { PNG } = require("pngjs");
(async () => {
  const phase = process.env.PHASE || "after",
    out =
      process.env.CAPTURE_DIR ||
      require("path").resolve(".cache/card-transitions-" + phase);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({
    executablePath: await bin.executablePath(),
    args: bin.args.filter((a) => a !== "--single-process"),
  });
  const results = [];
  try {
    for (const [w, h] of [
      [1912, 774],
      [1440, 800],
    ]) {
      const p = await b.newPage({ viewport: { width: w, height: h } }),
        errors = [];
      p.on("pageerror", (e) => errors.push(e.message));
      p.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      await p.goto(process.env.BASE_URL || "http://localhost:3000");
      await p.waitForSelector("#work");
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(1800);
      const geo = await p
        .locator("#services")
        .evaluate((s) => ({
          start:
            scrollY +
            s.parentElement.getBoundingClientRect().top -
            document
              .querySelector("[data-site-navbar] > div:first-child")
              .getBoundingClientRect().height,
          travel: innerHeight * 3.28,
        }));
      for (const reverse of [false, true]) {
        let n = 0;
        const windows = [
          [0.15, 0.31],
          [0.46, 0.62],
          [0.77, 0.92],
        ];
        for (const [a, z] of reverse ? [...windows].reverse() : windows) {
          let stops = [];
          for (let y = a * geo.travel; y < z * geo.travel; y += 40)
            stops.push(y);
          stops.push(z * geo.travel);
          if (reverse) stops.reverse();
          for (const y of stops) {
            await p.evaluate(
              (top) => scrollTo({ top, behavior: "instant" }),
              geo.start + y,
            );
            await p.waitForTimeout(650);
            const data = await p.locator("#services").evaluate((s) => {
              const cards = [...s.querySelectorAll("[role=link]")];
              return {
                t: s.dataset.cardTransition,
                rest: s
                  .querySelector("[role=link]")
                  ?.parentElement.getBoundingClientRect().x,
                clip: s.querySelector("[role=link]")?.parentElement
                  .parentElement.style.clipPath,
                counter: s
                  .querySelector('[aria-label^="Service "]')
                  ?.getAttribute("aria-label"),
                cards: cards.map((e) => {
                  const r = e.getBoundingClientRect(),
                    fill = e.querySelector("[data-card-ink]") || e.children[0],
                    content =
                      e.querySelector("[data-card-content]") || e.children[2];
                  return {
                    x: r.x,
                    y: r.y,
                    w: r.width,
                    h: r.height,
                    opacity: +getComputedStyle(e).opacity,
                    visible: getComputedStyle(e).visibility,
                    ink: +getComputedStyle(fill).opacity,
                    clip: getComputedStyle(fill).clipPath,
                    content: +getComputedStyle(content).opacity,
                    titleOpacity: +getComputedStyle(e.querySelector("h3"))
                      .opacity,
                    active: e.getAttribute("aria-hidden") === "false",
                    title: e.querySelector("h3")?.textContent,
                  };
                }),
              };
            });
            const file = `${w}-${reverse ? "reverse" : "forward"}-${String(n++).padStart(3, "0")}.png`;
            const png = PNG.sync.read(
              await p.screenshot({ path: out + "/" + file }),
            );
            const card = data.cards.find(
                (c) => c.visible === "visible" && c.w > 0,
              ),
              xx = Math.floor(card.x + card.w * 0.5),
              yy = Math.floor(card.y + card.h * 0.52),
              j = (yy * png.width + xx) * 4;
            data.pixel = [...png.data.slice(j, j + 3)];
            const lum = (x, y) => {
              const k = (Math.floor(y) * png.width + Math.floor(x)) * 4;
              const rgb = [...png.data.slice(k, k + 3)].map((v) => {
                v /= 255;
                return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
              });
              return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
            };
            data.leftLum = lum(data.rest - 3, card.y + card.h * 0.5);
            data.centerLum = lum(
              data.rest + card.w * 0.5,
              card.y + card.h * 0.52,
            );
            let mid = 0,
              total = 0;
            for (let xx = 0.2; xx <= 0.8; xx += 0.1)
              for (let yy = 0.3; yy <= 0.65; yy += 0.05) {
                let l = lum(data.rest + card.w * xx, card.y + card.h * yy);
                total++;
                if (l > 0.3 && l < 0.7) mid++;
              }
            data.midFraction = mid / total;
            data.file = file;
            data.scroll = y / geo.travel;
            results.push(data);
            fs.appendFileSync(
              out + "/frames.jsonl",
              JSON.stringify(data) + "\n",
            );
          }
        }
      }
      console.log(w, "captured", results.length, "errors", errors);
      if (errors.length) throw Error(errors.join("\n"));
      await p.close();
    }
    fs.writeFileSync(out + "/results.json", JSON.stringify(results, null, 2));
    if (phase === "after") {
      const assert = require("node:assert/strict");
      for (const r of results) {
        assert.ok(r.midFraction < 0.4, `${r.file}: broad gray midpoint`);
        assert.ok(r.leftLum > 0.7, `${r.file}: dark sliver left of rest edge`);
        assert.ok(
          r.cards.every((c) => c.ink === 1 && c.opacity === 1),
          `${r.file}: ink/shell opacity changed`,
        );
        assert.ok(
          r.cards.filter(
            (c) => c.visible === "visible" && c.content * c.titleOpacity > 0.4,
          ).length <= 1,
          `${r.file}: two readable titles`,
        );
        for (const c of r.cards)
          if (
            c.visible === "visible" &&
            c.content * c.titleOpacity > 0.01 &&
            c.clip !== "circle(0% at 0% 0%)"
          )
            assert.equal(
              c.clip,
              "circle(150% at 0% 0%)",
              `${r.file}: text before ink coverage`,
            );
        const active = r.cards.findIndex((c) => c.active);
        assert.equal(
          r.counter,
          `Service ${active + 1} of 4`,
          `${r.file}: active title/counter disagreement`,
        );
      }
      console.log(
        "PASS: opaque shells/ink, no broad gray, no left sliver, no readable title collision, ink before content, counter/active-title agreement",
      );
    }
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
