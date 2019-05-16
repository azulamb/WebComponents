((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => { init(script); });
})(document.currentScript, (script) => {
    class HexBox extends HTMLElement {
        static Init(tagname = 'hex-box') {
            if (customElements.get(tagname)) {
                return;
            }
            customElements.define(tagname, this);
        }
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML =
                [
                    ':host { --fill: gray; display: block; width: 100px; height: 100px; }',
                    ':host > div { width: 100%; height: 100%; position: relative; }',
                    ':host > div > * { position: absolute; top: 0; left: 0; display: block; width: 100%; height: 100%; }',
                    'path { fill: var( --fill ); }',
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
            shadow.appendChild(style);
            shadow.appendChild(box);
        }
        drawHex() {
            const d = 20;
            const D = 100 - d;
            const path = this.hasAttribute('horizontal') ?
                ['0,50', d + ',0', D + ',0', '100,50', D + ',100', d + ',100'] :
                ['50,0', '100,' + d, '100,' + D, '50,100', '0,' + D, '0,' + d];
            this.hex.setAttribute('d', 'M' + path.join('L') + 'Z');
        }
    }
    HexBox.Init(script.dataset.tagname);
});
