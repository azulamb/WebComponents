((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => { init(script); });
})(document.currentScript, (script) => {
    ((component, tagname = 'swipe-area') => {
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
    })(class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.textContent =
                [
                    ':host { display: block; width: 100%; height: 100%; }',
                    ':host( [ disable ] ) > div { pointer-events: none; }',
                    ':host > div { width: 100%; height: 100%; }',
                ].join('');
            const contents = document.createElement('div');
            contents.appendChild(document.createElement('slot'));
            shadow.appendChild(style);
            shadow.appendChild(contents);
            this.cancel();
            let touched = false;
            contents.addEventListener('touchstart', (event) => { touched = true; this.begin(event.touches[0].clientX, event.touches[0].clientY); });
            contents.addEventListener('touchmove', (event) => { this.move(event.touches[0].clientX, event.touches[0].clientY); });
            contents.addEventListener('touchend', (event) => { this.end(); });
            contents.addEventListener('touchcancel', (event) => { this.cancel(); });
            let onmouse = false;
            contents.addEventListener('mousedown', (event) => { onmouse = true; if (touched) {
                return;
            } this.begin(event.clientX, event.clientY); });
            contents.addEventListener('mousemove', (event) => { if (!onmouse || touched) {
                return;
            } this.move(event.clientX, event.clientY); });
            contents.addEventListener('mouseup', (event) => { if (!touched) {
                this.end();
            } touched = onmouse = false; });
            contents.addEventListener('mouseleave', (event) => { if (!onmouse) {
                return;
            } console.log(event); this.cancel(); });
            contents.addEventListener('contextmenu', (event) => { event.stopPropagation(); });
        }
        begin(x, y) {
            this.sx = this.ex = x;
            this.sy = this.ey = y;
        }
        move(x, y) {
            this.ex = x;
            this.ey = y;
        }
        end() {
            if (Number.isNaN(this.sx) || Number.isNaN(this.sy) || Number.isNaN(this.ex) || Number.isNaN(this.ey)) {
                return;
            }
            if (this.sx === this.ex && this.sy === this.ey) {
                return;
            }
            if (Math.pow((this.ex - this.sx), 2) + Math.pow((this.ey - this.sy), 2) < Math.pow(this.distance, 2)) {
                return;
            }
            this.dispatchEvent(new CustomEvent('swipe', { detail: {
                    sx: this.sx,
                    sy: this.sy,
                    ex: this.ex,
                    ey: this.ey,
                    radian: Math.atan2(this.ey - this.sy, this.ex - this.sx),
                } }));
        }
        cancel() {
            this.sx = this.sy = this.ex = this.ey = NaN;
        }
        get disable() { return this.hasAttribute('disable'); }
        set disable(value) { if (value) {
            this.setAttribute('disable', 'disable');
        }
        else {
            this.removeAttribute('disable');
        } }
        get distance() { return parseInt(this.getAttribute('distance') || '') || 30; }
        set distance(value) { this.setAttribute('distance', value + ''); }
    }, script.dataset.tagname);
});
