/*
*/

interface MorseCodeElement extends HTMLElement {
}

interface AddMorseCode {
	(lang: string, table: { [keys: string]: string }): void;
}

((script, init) => {
	if (document.readyState !== 'loading') {
		return init(script);
	}
	document.addEventListener('DOMContentLoaded', () => {
		init(script);
	});
})(<HTMLScriptElement> document.currentScript, (script: HTMLScriptElement) => {
	const Table: { [keys: string]: { [keys: string]: string } } = {};

	function AddTable(lang: string, table: { [keys: string]: string }) {
		// TODO: merge
		Table[lang] = table;
	}

	AddTable('en', {
		A: '01',
		a: '01',
		B: '1000',
		b: '1000',
		C: '1010',
		c: '1010',
		D: '100',
		d: '100',
		E: '0',
		e: '0',
		F: '0010',
		f: '0010',
		G: '110',
		g: '110',
		H: '0000',
		h: '0000',
		I: '00',
		i: '00',
		J: '0111',
		j: '0111',
		K: '101',
		k: '101',
		L: '0100',
		l: '0100',
		M: '11',
		m: '11',
		N: '10',
		n: '10',
		O: '111',
		o: '111',
		P: '0110',
		p: '0110',
		Q: '1101',
		q: '1101',
		R: '010',
		r: '010',
		S: '000',
		s: '000',
		T: '1',
		t: '1',
		U: '001',
		u: '001',
		V: '0001',
		v: '0001',
		W: '011',
		w: '011',
		X: '1001',
		x: '1001',
		Y: '1011',
		y: '1011',
		Z: '1100',
		z: '1100',
	});

	(<any> window)[script.dataset.addfunc || 'AddMorseCode'] = AddTable;

	((component, tagname = 'morse-code') => {
		if (customElements.get(tagname)) {
			return;
		}
		customElements.define(tagname, component);
	})(
		class extends HTMLElement implements MorseCodeElement {
			private contents: HTMLElement;

			constructor() {
				super();

				const shadow = this.attachShadow({ mode: 'open' });

				const style = document.createElement('style');
				style.innerHTML = [
					':host { display: inline-block; --short: "・"; --long: "－"; }',
				].join('');

				this.contents = document.createElement('div');

				shadow.appendChild(style);
				shadow.appendChild(this.contents);

				const observer = new MutationObserver((mutations) => {
					this.update();
				});
				observer.observe(this, { childList: true });

				this.update();
			}

			private convert(code: string, s: string, l: string) {
				return code.replace(/0/g, s).replace(/1/g, l);
			}

			public update() {
				const lang = this.getAttribute('lang') || 'en';
				const table = Table[lang];
				if (!table) {
					this.contents.innerHTML = '';
					return;
				}
				const strings = Array.from(this.textContent || '');

				const s = this.getAttribute('short') || this.style.getPropertyValue('--short') || '・';
				const l = this.getAttribute('long') || this.style.getPropertyValue('--long') || '－';
				this.contents.innerHTML = strings.map((char) => {
					return '<span>' + this.convert(table[char] || '', s, l) + '</span>';
				}).join('');
			}

			static get observedAttributes() {
				return ['short', 'lang', 'style'];
			}

			public attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {
				if (oldVal === newVal) {
					return;
				}

				this.update();
			}
		},
		script.dataset.tagname,
	);
});
