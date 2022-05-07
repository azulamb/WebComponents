/* */

interface HorizontalAreaElement extends HTMLElement {
	noscrollbar: boolean;
	goTo(target: number | HTMLElement): void;
}

((script, init) => {
	if (document.readyState !== 'loading') {
		return init(script);
	}
	document.addEventListener('DOMContentLoaded', () => {
		init(script);
	});
})(<HTMLScriptElement> document.currentScript, (script: HTMLScriptElement) => {
	((component, tagname = 'horizontal-area') => {
		if (customElements.get(tagname)) {
			return;
		}
		customElements.define(tagname, component);
	})(
		class extends HTMLElement implements HorizontalAreaElement {
			private scrollbar: number;
			private wrapper: HTMLElement;
			private contents: HTMLElement;

			constructor() {
				super();

				// Get scrollbar size.
				this.scrollbar = (() => {
					const element = document.createElement('div');
					element.style.visibility = 'hidden';
					element.style.overflow = 'scroll';
					document.body.appendChild(element);
					const scrollbarWidth = element.offsetWidth - element.clientWidth;
					document.body.removeChild(element);
					return scrollbarWidth;
				})();

				const shadow = this.attachShadow({ mode: 'open' });

				const style = document.createElement('style');
				style.innerHTML = [
					':host { --item-width: ""; --default-direction: ltr; --reverse-direction: rtl; display: block; }',
					':host > div { width: 100%; height: 100%; overflow: hidden; }',
					':host > div > div { overflow-y: scroll; overflow-x: hidden; scroll-behavior: smooth; transform: translateX( -100% ) rotate( -90deg ); transform-origin: right top; }',
					':host( :not( [ noscrollbar ] ) ) > div > div { direction: var( --reverse-direction ); }',
					'::slotted( * ) { direction: var( --default-direction ); }',
					':host( [ noscrollbar ] ) > div > div { -ms-overflow-style: none; scrollbar-width: none; }',
					':host( [ noscrollbar ] ) > div > div::-webkit-scrollbar { display:none; }',
				].join('');

				this.wrapper = document.createElement('div');
				this.wrapper.appendChild(document.createElement('slot'));

				this.contents = document.createElement('div');
				this.contents.appendChild(this.wrapper);

				shadow.appendChild(style);
				shadow.appendChild(this.contents);

				const resizeObserver = new ResizeObserver(() => {
					this.update();
				});
				resizeObserver.observe(this.contents);
			}

			private update() {
				this.wrapper.style.width = `${Math.ceil(this.contents.clientHeight)}px`;
				this.wrapper.style.height = `${Math.ceil(this.contents.clientWidth)}px`;
				const s = this.noscrollbar ? 0 : this.scrollbar;
				this.style.setProperty('--item-height', `${Math.ceil(this.contents.clientHeight - s)}px`);
			}

			static get observedAttributes() {
				return ['noscrollbar'];
			}

			public attributeChangedCallback(name: string, oldValue: any, newValue: any) {
				if ((oldValue !== null) === (newValue !== null)) {
					return;
				}
				this.noscrollbar = newValue !== null;
			}

			get noscrollbar() {
				return this.hasAttribute('noscrollbar');
			}

			set noscrollbar(value) {
				value ? this.setAttribute('noscrollbar', 'noscrollbar') : this.removeAttribute('noscrollbar');
				this.update();
			}

			private searchTarget(target: number | HTMLElement): HTMLElement | null {
				if (this.children.length < 1) {
					return null;
				}

				if (typeof target !== 'number') {
					let index = -1;
					for (let i = this.children.length - 1; 0 <= i; --i) {
						if (this.children[i] === target) {
							index = i;
							break;
						}
					}

					if (index < 0) {
						return null;
					}

					return target;
				}

				if (target < 0) {
					return <HTMLElement> this.children[0];
				}

				if (this.children.length <= target) {
					return <HTMLElement> this.children[this.children.length - 1];
				}

				return <HTMLElement> this.children[target];
			}

			public goTo(target: number | HTMLElement) {
				const element = this.searchTarget(target);

				if (!element) {
					return;
				}

				for (let i = this.children.length - 1; 0 <= i; --i) {
					this.children[i].removeAttribute('selected');
				}

				element.setAttribute('selected', 'selected');
				//this.wrapper.scrollTo( { top: element.offsetTop, left: 0, behavior: 'smooth' } );
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		},
		script.dataset.tagname,
	);
});
