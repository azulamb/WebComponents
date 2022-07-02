/**
 * https://developers.google.com/identity/branding-guidelines
 */

interface GoogleButtonElement extends HTMLElement {
	dark: boolean;
	icon: boolean;
	href: string;
}

((script, init) => {
	if (document.readyState !== 'loading') {
		return init(script);
	}
	document.addEventListener('DOMContentLoaded', () => {
		init(script);
	});
})(<HTMLScriptElement> document.currentScript, (script: HTMLScriptElement) => {
	((component, tagname = 'google-button') => {
		if (customElements.get(tagname)) {
			return;
		}
		customElements.define(tagname, component);
	})(
		class extends HTMLElement implements GoogleButtonElement {
			protected link: HTMLAnchorElement;

			constructor() {
				super();

				const shadow = this.attachShadow({ mode: 'open' });

				const style = document.createElement('style');
				style.innerHTML = [
					':host { --back: #fff; --front: #000; --base-size: 2px; display: inline-block; margin: var(--base-size); }',
					'::slotted(*) { font-family: Roboto,arial,sans-serif; font-size: calc(var(--base-size) * 8); color: var(--front); }',
					':host([dark]) { --back: #4285f4; --front: #fff; }',
					':host > button { font-size: var(--base-size); border: none; background: var(--back); display: flex; padding: 1em; cursor: pointer; border-radius: var(--base-size); position: relative; overflow: hidden; }',
					':host(:hover) > button { box-shadow: 0 0 3px 3px rgb(66 133 244 / 30%); }',
					':host > button > div { height: 100%; pointer-events: none; user-select: none; align-self: center; }',
					':host > button > div:first-child { background: #fff; padding: 4em; border-radius: var(--base-size); }',
					':host([icon]) > button > div:last-child { display: none; }',
					':host(:not([icon])) > button > div:last-child { padding: 0 4em 0 6em; }',
					':host(:empty:not([icon])) > button > div:last-child::before { content: "Sign in with Google"; font-family: Roboto,arial,sans-serif; font-size: calc(var(--base-size) * 8); color: var(--front); }',
					':host > button > a { display: none; }',
					':host > button > a[href] { display: block; width: 100%; height: 100%; position: absolute; top: 0; left: 0; }',
					'svg { display: block; width: 9em; height: 9em; }',
				].join('');

				const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg.setAttributeNS(null, 'width', '18px');
				svg.setAttributeNS(null, 'height', '18px');
				svg.setAttributeNS(null, 'viewBox', '0 0 18 18');

				[
					{
						fill: '#4285f4',
						d: 'm17.64 9.2045c0-0.63818-0.05727-1.2518-0.16364-1.8409h-8.4764v3.4814h4.8436c-0.20864 1.125-0.84273 2.0782-1.7959 2.7164v2.2582h2.9086c1.7018-1.5668 2.6836-3.8741 2.6836-6.615z',
					},
					{
						fill: '#34a853',
						d: 'm9 18c2.43 0 4.4673-0.80591 5.9564-2.1805l-2.9086-2.2582c-0.80591 0.54-1.8368 0.85909-3.0477 0.85909-2.3441 0-4.3282-1.5832-5.0359-3.7105h-3.0068v2.3318c1.4809 2.9414 4.5245 4.9582 8.0427 4.9582z',
					},
					{
						fill: '#fbbc05',
						d: 'm3.9641 10.71c-0.18-0.54-0.28227-1.1168-0.28227-1.71s0.10227-1.17 0.28227-1.71v-2.3318h-3.0068c-0.60955 1.215-0.95727 2.5895-0.95727 4.0418 0 1.4523 0.34773 2.8268 0.95727 4.0418z',
					},
					{
						fill: '#ea4335',
						d: 'm9 3.5795c1.3214 0 2.5077 0.45409 3.4405 1.3459l2.5814-2.5814c-1.5586-1.4523-3.5959-2.3441-6.0218-2.3441-3.5182 0-6.5618 2.0168-8.0427 4.9582l3.0068 2.3318c0.70773-2.1273 2.6918-3.7105 5.0359-3.7105z',
					},
				].forEach((p) => {
					const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
					path.setAttributeNS(null, 'd', p.d);
					path.setAttributeNS(null, 'fill', p.fill);
					svg.appendChild(path);
				});
				const icon = document.createElement('div');
				icon.appendChild(svg);

				const text = document.createElement('div');
				text.appendChild(document.createElement('slot'));

				this.link = document.createElement('a');

				if (this.hasAttribute('href')) {
					this.link.href = this.getAttribute('href') || '';
				}

				const button = document.createElement('button');
				button.appendChild(icon);
				button.appendChild(this.link);
				button.appendChild(text);

				shadow.appendChild(style);
				shadow.appendChild(button);
			}

			get dark() {
				return this.hasAttribute('dark');
			}
			set dark(value) {
				if (!value) {
					this.removeAttribute('dark');
				} else {
					this.setAttribute('dark', '');
				}
			}

			get icon() {
				return this.hasAttribute('icon');
			}
			set icon(value) {
				if (!value) {
					this.removeAttribute('icon');
				} else {
					this.setAttribute('icon', '');
				}
			}

			get href() {
				return this.getAttribute('href') || '';
			}
			set href(value) {
				if (!value) {
					this.removeAttribute('href');
				} else {
					this.setAttribute('href', value);
				}
			}

			static get observedAttributes() {
				return ['href'];
			}

			public attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {
				if (oldVal === newVal) {
					return;
				}
				this.link.href = newVal;
			}
		},
		script.dataset.tagname,
	);
});
