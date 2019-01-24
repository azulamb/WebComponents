/* ソースコードの表示と実行
中にあるHTMLのソースコードの実行結果をそのコードを同時に表示します。
あのサンプルページを動かすために作りました。

使い方：
<html-code>表示したいHTMLコード</html-code>
*/
class HTMLCode extends HTMLElement {
    static Init(tagname = 'html-code') { customElements.define(tagname, this); }
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.innerHTML = [
            ':host { display: block; width: 100%; height: fit-content; }',
            ':host > div { width: 100%; display: flex; justify-content: space-between; }',
            ':host > div > div { width: 49%; margin: 0; padding: 0.5em; box-sizing: border-box; border-radius: 0.5rem; border: 1px solid gray; }',
            'pre { margin: 0; }',
        ].join('');
        const contents = document.createElement('div');
        // 実行結果を置いておく場所
        const view = document.createElement('div');
        // このタグ内にあるタグをそのまま持ってきて表示する。
        const slot = document.createElement('slot');
        view.appendChild(slot);
        // ソースを置いておく場所
        const source = document.createElement('div');
        const pre = document.createElement('pre');
        this.code = document.createElement('code');
        pre.append(this.code);
        source.appendChild(pre);
        // コードを読み込む
        this.updateCode();
        contents.appendChild(view);
        contents.appendChild(source);
        shadow.appendChild(style);
        shadow.appendChild(contents);
    }
    updateCode() {
        // 設定されているコンテンツをそのままコードとして使います。
        this.code.textContent = this.innerHTML;
    }
}
document.addEventListener('DOMContentLoaded', () => { HTMLCode.Init(); });
