/* */

interface HorizontaItemElement extends HTMLElement {
}

((script, init) => {
	if (document.readyState !== 'loading') {
		return init(script);
	}
	document.addEventListener('DOMContentLoaded', () => {
		init(script);
	});
})(<HTMLScriptElement> document.currentScript, (script: HTMLScriptElement) => {
	((component, tagname = 'horizontal-item') => {
		if (customElements.get(tagname)) {
			return;
		}
		customElements.define(tagname, component);
	})(
		class extends HTMLElement implements HorizontaItemElement {
			constructor() {
				super();

				const shadow = this.attachShadow({ mode: 'open' });

				const style = document.createElement('style');
				style.innerHTML = [
					':host { display: block; width: 100%; --width: var( --item-height ); height: var( --item-width ); overflow: hidden; }',
					':host > div { height: var( --width ); transform: rotate( 90deg ); }',
				].join('');

				const contents = document.createElement('div');
				contents.appendChild(document.createElement('slot'));

				shadow.appendChild(style);
				shadow.appendChild(contents);
			}
		},
		script.dataset.tagname,
	);
});
