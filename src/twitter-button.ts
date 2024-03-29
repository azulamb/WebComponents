interface TwitterButtonElement extends HTMLElement {
}

((script, init) => {
	if (document.readyState !== 'loading') {
		return init(script);
	}
	document.addEventListener('DOMContentLoaded', () => {
		init(script);
	});
})(<HTMLScriptElement> document.currentScript, (script: HTMLScriptElement) => {
	((component, tagname = 'twitter-button') => {
		if (customElements.get(tagname)) {
			return;
		}
		customElements.define(tagname, component);
	})(
		class extends HTMLElement implements TwitterButtonElement {
			constructor() {
				super();

				const shadow = this.attachShadow({ mode: 'open' });

				const style = document.createElement('style');
				style.innerHTML = [
					':host { --padding: 0.6em 1.8em; --icon-size: 80%; --color: white; font-size: 2rem; display: inline-block; background-color: #1da1f2; color: var( --color ); box-sizing: border-box; border-radius: 0.2em; overflow: hidden; transition: background-color 0.2s; user-select: none; cursor: pointer; }',
					':host( :not( [ disabled ] ):hover ) { background-color: #1a91da; }',
					':host > button { pointer-events: none; border: 0; background: transparent; display: flex; justify-content: center; align-items: center; box-sizing: border-box; text-decoration: none; color: inherit; width: 100%; height: 100%; padding: var( --padding ); }',
					':host( [ disabled ] ) { background-color: #8fabbd; pointer-events: none; }',
					'svg{ width: auto; height: var( --icon-size ); }',
					':host( :not( :empty ) ) svg { margin-right: 0.4em; }',
				].join('');

				const button = document.createElement('button');

				const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				path.setAttributeNS(
					null,
					'd',
					'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z',
				);
				path.style.fill = 'var( --color )';
				const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg.setAttributeNS(null, 'width', '24px');
				svg.setAttributeNS(null, 'height', '24px');
				svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
				svg.appendChild(path);

				button.appendChild(svg);

				button.appendChild(document.createElement('slot'));

				shadow.appendChild(style);
				shadow.appendChild(button);
			}
		},
		script.dataset.tagname,
	);
});
