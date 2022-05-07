((script, init) => {
    if (document.readyState !== 'loading') {
        return init(script);
    }
    document.addEventListener('DOMContentLoaded', () => {
        init(script);
    });
})(document.currentScript, (script) => {
    const Pieces = [
        { print: '玉', enemy: '王', names: ['king', 'k', '玉'] },
        { print: '飛', reverse: '竜', names: ['rook', 'r', '飛'] },
        { print: '角', reverse: '馬', names: ['bishop', 'b', '角'] },
        { print: '金', names: ['gold', 'g', '金'] },
        { print: '銀', reverse: '全', names: ['silver', 's', '銀'] },
        { print: '桂', reverse: '圭', names: ['knight', 'n', '桂'] },
        { print: '香', reverse: '仝', names: ['lance', 'l', '香'] },
        { print: '歩', reverse: 'と', names: ['pawn', 'p', '歩'] },
    ];
    ((component, tagname = 'shogi-piece') => {
        if (customElements.get(tagname)) {
            return;
        }
        customElements.define(tagname, component);
    })(class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const styles = [
                ':host { display: block; width: 2rem; }',
                ':host > div { position: relative; text-align: center; width: 100%; height: 100%; }',
                ':host > div > svg { display: block; width: 100%; height: 100%; }',
                ':host > div > svg .c { display: none; }',
                ':host( [ enemy ] ) > div { transform: rotate( 180deg ); }',
            ];
            const frame = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            frame.setAttribute('x', '50%');
            frame.setAttribute('y', '50%');
            frame.setAttribute('text-anchor', 'middle');
            frame.setAttribute('dominant-baseline', 'central');
            frame.setAttribute('fill', 'var( --color )');
            frame.textContent = '☖';
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttributeNS(null, 'width', '20px');
            svg.setAttributeNS(null, 'height', '20px');
            svg.setAttributeNS(null, 'viewBox', '0 0 20 20');
            svg.setAttributeNS(null, 'preserveAspectRatio', 'none');
            svg.appendChild(frame);
            const create = (text, name) => {
                const piece = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                piece.classList.add('c', name);
                piece.textContent = text;
                piece.setAttribute('x', '50%');
                piece.setAttribute('y', '45%');
                piece.setAttribute('text-anchor', 'middle');
                piece.setAttribute('dominant-baseline', 'central');
                piece.setAttribute('font-size', '8');
                piece.setAttribute('fill', 'var( --color )');
                return piece;
            };
            Pieces.forEach((data) => {
                const basename = data.names[0];
                styles.push(data.names.map((name) => {
                    return ':host( [ piece = "' + name + '" ] ) .c.' + basename;
                }).join(',') +
                    ' { display: block; }');
                svg.appendChild(create(data.print, basename));
                if (data.enemy) {
                    styles.push(data.names.map((name) => {
                        return ':host( [ piece = "' + name + '" ][ enemy ] ) .c.' + basename;
                    }).join(',') +
                        ' { display: none; }', data.names.map((name) => {
                        return ':host( [ piece = "' + name + '" ][ enemy ] ) .c.e_' + basename;
                    }).join(',') +
                        ' { display: block; }');
                    svg.appendChild(create(data.enemy, 'e_' + basename));
                }
                if (data.reverse) {
                    styles.push(data.names.map((name) => {
                        return ':host( [ piece = "' + name + '" ][ reverse ] ) .c.' + basename;
                    }).join(',') +
                        ' { display: none; }', data.names.map((name) => {
                        return ':host( [ piece = "' + name + '" ][ reverse ] ) .c.r_' + basename;
                    }).join(',') +
                        ' { display: block; }');
                    svg.appendChild(create(data.reverse, 'r_' + basename));
                }
            });
            const style = document.createElement('style');
            style.innerHTML = styles.join('');
            const contents = document.createElement('div');
            contents.appendChild(svg);
            shadow.appendChild(style);
            shadow.appendChild(contents);
        }
        get piece() {
            return this.getAttribute('piece') || '';
        }
        set piece(value) {
            this.setAttribute('piece', value);
        }
        get enemy() {
            return this.hasAttribute('enemy');
        }
        set enemy(value) {
            if (value) {
                this.setAttribute('enemy', 'true');
            }
            else {
                this.removeAttribute('enemy');
            }
        }
        get reverse() {
            return this.hasAttribute('reverse');
        }
        set reverse(value) {
            if (value) {
                this.setAttribute('reverse', 'true');
            }
            else {
                this.removeAttribute('reverse');
            }
        }
    }, script.dataset.tagname);
});
