((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => {
        init(script);
    });
})(document.currentScript, (script) => {
    const startag = script.dataset.star || 'favorite-button';
    ((component, tagname = 'rating-stars') => {
        if (customElements.get(tagname)) {
            return;
        }
        customElements.whenDefined(startag).then(() => {
            customElements.define(tagname, component);
        });
    })(class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML = [
                ':host { display: block; overflow: hidden; width: fit-content; height: fit-content; }',
                ':host > div { display: flex; }',
            ].join('');
            this.stars = document.createElement('div');
            if (!this.hasAttribute('length')) {
                this.length = 5;
            }
            this.updateStars();
            shadow.appendChild(style);
            shadow.appendChild(this.stars);
        }
        updateStars() {
            const stars = this.stars.children;
            const max = this.length;
            for (let i = stars.length - 1; max <= i; --i) {
                this.stars.removeChild(stars[i]);
            }
            for (let i = stars.length; i < max; ++i) {
                const star = this.createStar();
                star.dataset.rating = (i + 1) + '';
                star.addEventListener('click', (event) => {
                    this.rating = parseInt(event.target.dataset.rating);
                });
                this.stars.appendChild(star);
            }
            if (this.length < this.rating) {
                this.rating = this.length;
            }
        }
        createStar() {
            return new (customElements.get(startag))();
        }
        convertPositiveNumber(value) {
            if (typeof value !== 'number') {
                value = parseInt(value);
            }
            if (20 < value) {
                return 20;
            }
            if (0 <= value) {
                return value;
            }
            return 0;
        }
        get length() {
            return this.convertPositiveNumber(this.getAttribute('length') || '');
        }
        set length(value) {
            this.setAttribute('length', this.convertPositiveNumber(value) + '');
        }
        onUpdateLength(value) {
            this.length = value;
            this.updateStars();
        }
        get rating() {
            return this.convertPositiveNumber(this.getAttribute('rating') || '');
        }
        set rating(value) {
            const max = this.length;
            const rating = Math.min(this.convertPositiveNumber(value), max);
            const stars = this.stars.children;
            let i = 0;
            for (; i < rating; ++i) {
                stars[i].setAttribute('on', 'on');
            }
            for (; i < max; ++i) {
                stars[i].removeAttribute('on');
            }
            this.setAttribute('rating', rating + '');
        }
        onUpdateRating(value) {
            this.rating = value;
            this.dispatchEvent(new Event('change'));
        }
        static get observedAttributes() {
            return ['length', 'rating'];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            switch (attrName) {
                case 'length':
                    this.onUpdateLength(newVal);
                    break;
                case 'rating':
                    this.onUpdateRating(newVal);
                    break;
            }
        }
    }, script.dataset.tagname);
});
