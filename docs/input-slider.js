((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => {
        init(script);
    });
})(document.currentScript, (script) => {
    ((component, tagname = 'input-slider') => {
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
    })(class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML = [
                ':host { display: inline-block; --input-size: 3rem; }',
                ':host > div { display: grid; grid-template-columns: 1fr var(--input-size); width: 100%; height: 100%; }',
                ':host > div > input { font-size: 1em; }',
            ].join('');
            this.slider = document.createElement('input');
            this.slider.type = 'range';
            this.input = document.createElement('input');
            this.input.type = 'number';
            if (this.hasAttribute('min')) {
                this.input.min = this.getAttribute('min');
                this.slider.min = this.input.min;
            }
            if (this.hasAttribute('max')) {
                this.input.max = this.getAttribute('max');
                this.slider.max = this.input.max;
            }
            if (this.hasAttribute('step')) {
                this.input.step = this.getAttribute('step');
                this.slider.step = this.input.step;
            }
            if (this.hasAttribute('value')) {
                this.input.value = this.getAttribute('value');
                this.slider.value = this.input.value;
            }
            else {
                this.input.value = this.slider.value;
            }
            if (this.hasAttribute('disabled')) {
                this.input.disabled = true;
                this.slider.disabled = true;
            }
            (() => {
                let timer = 0;
                const onChange = () => {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(() => {
                        this.onChange();
                        timer = 0;
                        this.dispatchEvent(new CustomEvent('change'));
                    }, 0);
                };
                this.slider.addEventListener('change', () => {
                    this.value = this.slider.value;
                    onChange();
                });
                this.input.addEventListener('change', () => {
                    this.value = this.input.value;
                    onChange();
                });
            })();
            const contents = document.createElement('div');
            contents.appendChild(this.slider);
            contents.appendChild(this.input);
            shadow.appendChild(style);
            shadow.appendChild(contents);
        }
        onChange() { }
        get min() {
            return parseFloat(this.input.min || '') || 1;
        }
        set min(value) {
            const setValue = value + '';
            let change = false;
            if (this.input.min !== setValue) {
                this.input.min = setValue;
                change = true;
            }
            if (this.slider.min !== setValue) {
                this.slider.min = setValue;
                change = true;
            }
            if (change) {
                this.setAttribute('min', setValue);
            }
        }
        get max() {
            return parseFloat(this.input.max || '') || 1;
        }
        set max(value) {
            const setValue = value + '';
            let change = false;
            if (this.input.max !== setValue) {
                this.input.max = setValue;
                change = true;
            }
            if (this.slider.max !== setValue) {
                this.slider.max = setValue;
                change = true;
            }
            if (change) {
                this.setAttribute('min', setValue);
            }
        }
        get step() {
            return parseFloat(this.input.value || '') || 1;
        }
        set step(value) {
            const setValue = value + '';
            let change = false;
            if (this.input.step !== setValue) {
                this.input.step = setValue;
                change = true;
            }
            if (this.slider.step !== setValue) {
                this.slider.step = setValue;
                change = true;
            }
            if (change) {
                this.setAttribute('step', setValue);
            }
        }
        get value() {
            return parseFloat(this.input.value || '') || 1;
        }
        set value(value) {
            const setValue = value + '';
            let change = false;
            if (this.input.value !== setValue) {
                this.input.value = setValue;
                change = true;
            }
            if (this.slider.value !== setValue) {
                this.slider.value = setValue;
                change = true;
            }
            if (change) {
                this.setAttribute('value', setValue);
            }
        }
        get disabled() {
            return this.hasAttribute('disabled');
        }
        set disabled(value) {
            if (!value) {
                this.input.disabled = false;
                this.slider.disabled = false;
                this.removeAttribute('disabled');
            }
            else {
                this.input.disabled = true;
                this.slider.disabled = true;
                this.setAttribute('disabled', '');
            }
        }
        static get observedAttributes() {
            return ['min', 'max', 'step', 'disabled', 'value'];
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === newValue) {
                return;
            }
            switch (name) {
                case 'min':
                    this.min = newValue;
                    break;
                case 'max':
                    this.max = newValue;
                    break;
                case 'step':
                    this.step = newValue;
                    break;
                case 'value':
                    this.value = newValue;
                    break;
                case 'disabled':
                    this.disabled = this.hasAttribute('disabled');
                    break;
            }
        }
    }, script.dataset.tagname);
});
