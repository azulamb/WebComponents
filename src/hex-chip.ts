interface HexChipElement extends HTMLElement {
	horizontal: boolean;
	disabled: boolean;
}

((script, init) => {
	if (document.readyState !== 'loading') {
		return init(script);
	}
	document.addEventListener('DOMContentLoaded', () => {
		init(script);
	});
})(<HTMLScriptElement> document.currentScript, (script: HTMLScriptElement) => {
	((component, tagname = 'hex-chip') => {
		if (customElements.get(tagname)) {
			return;
		}
		customElements.define(tagname, component);
	})(
		class extends HTMLElement implements HexChipElement {
			private hex: SVGPathElement;

			constructor() {
				super();

				const shadow = this.attachShadow({ mode: 'open' });

				const style = document.createElement('style');
				style.innerHTML = [
					':host { --fill: gray; display: block; width: 100px; height: 100px; pointer-events: none; }',
					':host > div { width: 100%; height: 100%; position: relative; }',
					':host > div > * { position: absolute; top: 0; left: 0; display: block; width: 100%; height: 100%; }',
					'path { fill: var( --fill ); pointer-events: all; }',
					':host( [ disabled ] ) path { fill: none; }',
				].join('');

				const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg.setAttributeNS(null, 'width', '100');
				svg.setAttributeNS(null, 'height', '100');
				svg.setAttributeNS(null, 'viewBox', '0 0 100 100');
				svg.setAttributeNS(null, 'preserveAspectRatio', 'none');
				this.hex = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				this.drawHex();
				svg.appendChild(this.hex);

				const contents = document.createElement('div');
				contents.appendChild(document.createElement('slot'));

				const box = document.createElement('div');
				box.appendChild(svg);
				box.appendChild(contents);

				this.initEvents();

				shadow.appendChild(style);
				shadow.appendChild(box);
			}

			private initEvents() {
				const TIME = 1000;
				let touch = false;
				let timer: number;

				const clear = () => {
					if (!timer) {
						return;
					}
					clearTimeout(timer);
					timer = 0;
				};
				const start = () => {
					this.tapStartEvent();
				};
				const end = () => {
					this.tapEndEvent();
				};
				const tap = () => {
					if (!timer) {
						return;
					}
					this.tapEvent();
					clear();
				};
				const longtap = () => {
					start();
					timer = setTimeout(() => {
						this.longTapEvent();
						timer = 0;
					}, TIME);
				};

				this.hex.addEventListener('contextmenu', (event) => {
					event.preventDefault();
				});
				this.hex.addEventListener('touchstart', (event) => {
					longtap();
					touch = true;
				});
				this.hex.addEventListener('touchend', (event) => {
					tap();
					end();
				});
				this.hex.addEventListener('mousedown', (event) => {
					if (touch) {
						return;
					}
					longtap();
				});
				this.hex.addEventListener('mouseup', (event) => {
					if (touch) {
						touch = false;
						return;
					}
					tap();
					end();
				});
				this.hex.addEventListener('mouseleave', (event) => {
					if (!touch && !timer) {
						return;
					}
					clear();
					touch = false;
				});
			}

			private tapStartEvent() {
				const event = new CustomEvent('tapstart');
				this.dispatchEvent(event);
			}

			private tapEndEvent() {
				const event = new CustomEvent('tapend');
				this.dispatchEvent(event);
			}

			private tapEvent() {
				const event = new CustomEvent('tap');
				this.dispatchEvent(event);
			}

			private longTapEvent() {
				const event = new CustomEvent('longtap');
				this.dispatchEvent(event);
			}

			private drawHex() {
				const d = 20;
				const D = 100 - d;
				const path = this.hasAttribute('horizontal')
					? ['0,50', d + ',0', D + ',0', '100,50', D + ',100', d + ',100']
					: ['50,0', '100,' + d, '100,' + D, '50,100', '0,' + D, '0,' + d];
				this.hex.setAttribute('d', 'M' + path.join('L') + 'Z');
			}

			get horizontal() {
				return this.hasAttribute('horizontal');
			}
			set horizontal(value) {
				value ? this.setAttribute('horizontal', '') : this.removeAttribute('horizontal');
			}

			get disabled() {
				return this.hasAttribute('disabled');
			}
			set disabled(value) {
				value ? this.setAttribute('disabled', '') : this.removeAttribute('horizontal');
			}

			static get observedAttributes() {
				return ['horizontal', 'style'];
			}

			public attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {
				if (oldVal === newVal) {
					return;
				}
				this.drawHex();
			}
		},
		script.dataset.tagname,
	);
});
