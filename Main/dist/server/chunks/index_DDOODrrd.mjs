import { t as __exportAll } from "./rolldown-runtime_BBjsoOtd.mjs";
import { g as addAttribute, h as renderHead, i as renderComponent, m as maybeRenderHead, p as generateCspDigest, s as renderSlot, t as spreadAttributes, u as renderTemplate, x as createAstro, y as unescapeHTML } from "./server_DiftD9Vj.mjs";
import { t as createComponent } from "./compiler_Ch8emKFc.mjs";
//#region src/layouts/Layout.astro
createAstro("https://astro.build");
var $$Layout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Layout;
	const { title, description = "Prova — Pause, Prove, Protect" } = Astro.props;
	return renderTemplate`<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro.generator, "content")}><meta name="description"${addAttribute(description, "content")}><title>${title}</title>${renderHead($$result)}</head><body>${renderSlot($$result, $$slots["default"])}</body></html>`;
}, "/home/lily/Prova/Main/src/layouts/Layout.astro", void 0);
//#endregion
//#region node_modules/astro/dist/assets/runtime.js
function createSvgComponent({ meta, attributes, children, styles }) {
	const hasStyles = styles.length > 0;
	const Component = createComponent({
		async factory(result, props) {
			const normalizedProps = normalizeProps(attributes, props);
			if (hasStyles && result.cspDestination) for (const style of styles) {
				const hash = await generateCspDigest(style, result.cspAlgorithm);
				result._metadata.extraStyleHashes.push(hash);
			}
			return renderTemplate`<svg${spreadAttributes(normalizedProps)}>${unescapeHTML(children)}</svg>`;
		},
		propagation: hasStyles ? "self" : "none"
	});
	Object.defineProperty(Component, "toJSON", {
		value: () => meta,
		enumerable: false
	});
	return Object.assign(Component, meta);
}
var ATTRS_TO_DROP = [
	"xmlns",
	"xmlns:xlink",
	"version"
];
var DEFAULT_ATTRS = {};
function dropAttributes(attributes) {
	for (const attr of ATTRS_TO_DROP) delete attributes[attr];
	return attributes;
}
function normalizeProps(attributes, props) {
	return dropAttributes({
		...DEFAULT_ATTRS,
		...attributes,
		...props
	});
}
//#endregion
//#region src/assets/background.svg
var background_default = createSvgComponent({
	"meta": {
		"src": "/_astro/background.BPKAcmfN.svg",
		"width": 1440,
		"height": 1024,
		"format": "svg"
	},
	"attributes": {
		"width": "1440",
		"height": "1024",
		"fill": "none"
	},
	"children": "<path fill=\"url(#a)\" fill-rule=\"evenodd\" d=\"M-217.58 475.75c91.82-72.02 225.52-29.38 341.2-44.74C240 415.56 372.33 315.14 466.77 384.9c102.9 76.02 44.74 246.76 90.31 366.31 29.83 78.24 90.48 136.14 129.48 210.23 57.92 109.99 169.67 208.23 155.9 331.77-13.52 121.26-103.42 264.33-224.23 281.37-141.96 20.03-232.72-220.96-374.06-196.99-151.7 25.73-172.68 330.24-325.85 315.72-128.6-12.2-110.9-230.73-128.15-358.76-12.16-90.14 65.87-176.25 44.1-264.57-26.42-107.2-167.12-163.46-176.72-273.45-10.15-116.29 33.01-248.75 124.87-320.79Z\" clip-rule=\"evenodd\" style=\"opacity:.154\" /><path fill=\"url(#b)\" fill-rule=\"evenodd\" d=\"M1103.43 115.43c146.42-19.45 275.33-155.84 413.5-103.59 188.09 71.13 409 212.64 407.06 413.88-1.94 201.25-259.28 278.6-414.96 405.96-130 106.35-240.24 294.39-405.6 265.3-163.7-28.8-161.93-274.12-284.34-386.66-134.95-124.06-436-101.46-445.82-284.6-9.68-180.38 247.41-246.3 413.54-316.9 101.01-42.93 207.83 21.06 316.62 6.61Z\" clip-rule=\"evenodd\" style=\"opacity:.154\" /><defs><linearGradient id=\"b\" x1=\"373\" x2=\"1995.44\" y1=\"1100\" y2=\"118.03\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#D83333\" /><stop offset=\"1\" stop-color=\"#F041FF\" /></linearGradient><linearGradient id=\"a\" x1=\"107.37\" x2=\"1130.66\" y1=\"1993.35\" y2=\"1026.31\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#3245FF\" /><stop offset=\"1\" stop-color=\"#BC52EE\" /></linearGradient></defs>",
	"styles": []
});
//#endregion
//#region src/components/Hero.astro
var $$Hero = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${maybeRenderHead($$result)}<section class="hero"${addAttribute(`--hero-image: url(${background_default.src})`, "style")}><div class="hero-content"><h1> PROVA </h1><h2> Pause, Prove, Protect </h2></div></section>`;
}, "/home/lily/Prova/Main/src/components/Hero.astro", void 0);
//#endregion
//#region src/components/WaitlistForm.astro
createAstro("https://astro.build");
var $$WaitlistForm = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$WaitlistForm;
	const { action = "/api/waitlist", title = "Join the waitlist", description = "Be first to hear when Prova opens up. We only need your name and email.", buttonLabel = "Request early access" } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<section class="waitlist-card"><div class="waitlist-copy"><p class="waitlist-eyebrow">Prova Waitlist</p><h1>${title}</h1><p class="waitlist-description">${description}</p></div><form class="waitlist-form"${addAttribute(action, "action")} method="post" data-waitlist-form novalidate><label class="waitlist-field"><span>Name</span><input id="name" name="name" type="text" autocomplete="name" placeholder="Your Name" required></label><label class="waitlist-field"><span>Email</span><input id="email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="email@example.com" required></label><button class="waitlist-submit" type="submit">${buttonLabel}</button><p class="waitlist-message" data-form-message aria-live="polite"></p></form></section><script>
  const forms = document.querySelectorAll('[data-waitlist-form]');

  for (const form of forms) {
    if (!(form instanceof HTMLFormElement) || form.dataset.bound === 'true') continue;

    form.dataset.bound = 'true';

    const submitButton = form.querySelector('button[type="submit"]');
    const message = form.querySelector('[data-form-message]');
    const defaultButtonText = submitButton?.textContent ?? 'Submit';

    const setMessage = (text, tone = 'neutral') => {
      if (!(message instanceof HTMLElement)) return;
      message.textContent = text;
      message.dataset.tone = tone;
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const formData = new FormData(form);

      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';
      }

      setMessage('Submitting your request...', 'neutral');

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        });

        const payload = await response.json().catch(() => ({}));
        const text =
          typeof payload.message === 'string'
            ? payload.message
            : 'We could not submit your request. Please try again.';

        if (!response.ok) {
          setMessage(text, 'error');
          return;
        }

        form.reset();
        setMessage(text, 'success');
      } catch (error) {
        console.error('Waitlist submission failed', error);
        setMessage('The connection failed. Please try again in a moment.', 'error');
      } finally {
        if (submitButton instanceof HTMLButtonElement) {
          submitButton.disabled = false;
          submitButton.textContent = defaultButtonText;
        }
      }
    });
  }
<\/script>`;
}, "/home/lily/Prova/Main/src/components/WaitlistForm.astro", void 0);
//#endregion
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Prova" }, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Hero", $$Hero, {})}${maybeRenderHead($$result)}<main class="waitlist-page"><section class="waitlist-shell"><div class="waitlist-intro"><p>Pause, Prove, Protect</p><h2>Early access starts here.</h2></div>${renderComponent($$result, "WaitlistForm", $$WaitlistForm, {})}</section></main>` })}`;
}, "/home/lily/Prova/Main/src/pages/index.astro", void 0);
var $$file = "/home/lily/Prova/Main/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
