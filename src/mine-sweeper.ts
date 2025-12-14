interface MineSweeperElement extends HTMLElement {
  reset(): void;
  play(x: number, y: number): void;
  open(x: number, y: number): void;
  flag(x: number, y: number): void;
  gameover(): void;
  gameclear(): void;
}

interface MineBlockElement extends HTMLElement {
  getX(): number;
  getY(): number;
  setBomb(): void;
  isBomb(): boolean;
  isOpen(): boolean;
  hasFlag(): boolean;
  open(bombs?: number): void;
  flag(): void;
}

((script, init) => {
  if (document.readyState !== 'loading') {
    return init(script);
  }
  document.addEventListener('DOMContentLoaded', () => {
    init(script);
  });
})(<HTMLScriptElement> document.currentScript, (script: HTMLScriptElement) => {
  class MineSweeper extends HTMLElement implements MineSweeperElement {
    private boardStyle: HTMLStyleElement;
    private width: HTMLInputElement;
    private height: HTMLInputElement;
    private bombs: HTMLInputElement;
    private board: HTMLElement;
    private maxbombs: number;

    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'open' });

      const style = document.createElement('style');
      style.innerHTML = [
        ':host { display: block; width: 100%; height: fit-content; --mine-flag: "🚩"; }',
        'input { width: 4em; }',
        ':host > div { display: grid; }',
        // プレイ中は設定に触れないようにします。
        ':host( [ play ] ) > header > input { pointer-events: none; }',
        // ゲームが終了した場合はブロックのクリック判定を消します。
        ':host( [ game ] ) > div > * { pointer-events: none; }',
      ].join('');

      this.boardStyle = document.createElement('style');

      const width = parseInt(this.getAttribute('width') || '');
      const height = parseInt(this.getAttribute('height') || '');
      const bombs = parseInt(this.getAttribute('bombs') || '');

      shadow.appendChild(style);
      shadow.appendChild(this.boardStyle);
      shadow.appendChild(
        this.initHeader(
          0 < width ? width : 9,
          0 < height ? height : 9,
          0 < bombs ? bombs : 0,
        ),
      );
      shadow.appendChild(this.initBoard());

      this.reset();
    }

    private initHeader(width: number, height: number, bombs: number) {
      // ヘッダー部分です。
      const header = document.createElement('header');

      this.maxbombs = bombs;

      // 要素を生成する一時的な関数を作っておきます。
      function createNumInput(value: number) {
        const input = document.createElement('input');
        input.type = 'number';
        input.value = value + '';
        return input;
      }
      function createTextElement(text: string) {
        const span = document.createElement('span');
        span.textContent = text;
        return span;
      }

      // 爆弾の数の初期化をします。
      if (bombs <= 0) bombs = this.calcBombs(width, height);

      // 盤面サイズなどの設定を行います。プレイ中これらに触れることはできません。
      // また、盤面の情報などはここに入っている情報を元に生成することにします。
      this.width = createNumInput(width);
      this.height = createNumInput(height);
      this.bombs = createNumInput(bombs);

      // 内容を追加していきます。
      header.appendChild(createTextElement('Size:'));
      header.appendChild(this.width);
      header.appendChild(createTextElement('x'));
      header.appendChild(this.height);
      header.appendChild(createTextElement('💣'));
      header.appendChild(this.bombs);

      return header;
    }

    private initBoard() {
      // 盤面です。
      this.board = document.createElement('div');

      return this.board;
    }

    private calcBombs(width: number, height: number) {
      const bombs = Math.floor(width * height * 0.5);
      return bombs <= 0 ? 1 : bombs;
    }

    private createBlock(x: number, y: number) {
      const block: MineBlock = new MineBlock(x, y);
      block.addEventListener('open', (event: MineEvent) => {
        this.open(event.detail.x, event.detail.y);
      });
      block.addEventListener('flag', (event: MineEvent) => {
        this.flag(event.detail.x, event.detail.y);
      });
      return block;
    }

    private updateBoard() {
      const width = parseInt(this.width.value);
      const height = parseInt(this.height.value);

      // 今あるブロックを全て削除します。
      for (let i = this.board.children.length - 1; 0 <= i; --i) {
        this.board.removeChild(this.board.children[i]);
      }

      const styles: string[] = [
        'div.board { ' +
        'grid-template-columns: ' + Array(width).fill('1fr').join(' ') + '; ' +
        'grid-template-rows: ' + Array(height).fill('1fr').join(' ') + ';' +
        ' }',
      ];

      for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
          this.board.appendChild(this.createBlock(x, y));
        }
      }

      this.boardStyle.innerHTML = styles.join('');
    }

    public reset() {
      this.removeAttribute('play');

      this.updateBoard();
    }

    public play(x: number, y: number) {
      // ボムをセットします。

      this.setAttribute('play', '');

      // 開いていないブロックの一覧を作ります。
      const blocks = <MineBlock[]> Array.from(this.board.children).filter(
        (block: MineBlock) => {
          return !block.isOpen();
        },
      );

      // 上から順番に爆弾を置いていきます。
      // ランダムに座標を作ってそこに爆弾が置かれていなければ爆弾を置くという手法に比べて、
      // 並び替えてから順番に爆弾を置いた方が諸々の管理が楽です。

      // ランダムに並び替えます。
      for (let i = blocks.length - 1; 0 < i; --i) {
        const r = Math.floor(Math.random() * (i + 1));
        [blocks[i], blocks[r]] = [blocks[r], blocks[i]];
      }

      // 爆弾は設定数もしくは最大数までにしておきます。
      this.maxbombs = Math.min(parseInt(this.bombs.value), blocks.length);

      // 爆弾を設置します。
      for (let b = 0; b < this.maxbombs; ++b) {
        blocks[b].setBomb();
      }
    }

    public open(x: number, y: number) {
      if (!this.hasAttribute('play')) {
        this.play(x, y);
      }

      const width = parseInt(this.width.value);
      const height = parseInt(this.height.value);
      const blocks = <MineBlock[]> Array.from(this.board.children);

      // 開いた場所に爆弾があるかチェックします。
      if (blocks[y * width + x].isBomb()) {
        // ゲームオーバー処理をします。
        return this.gameover();
      }

      // 残っているブロックと爆弾の数を比較します。
      if (this.countBlock(blocks) === this.maxbombs) {
        // ゲームクリア処理をします。
        return this.gameclear();
      }

      // 開いた場所に連なる爆弾なしブロックを列挙します。
      const nobombs = this.getCanOpenBlocks(blocks, x, y, width, height);
      // 開いた場所に数値があるかもしれないので、nobombsに追加しておきます。
      nobombs.push(blocks[y * width + x]);

      // 開くと同時に周囲の爆弾の数をカウントします。
      nobombs.forEach((block) => {
        // ブロックを周囲の爆弾数を渡して開きます。
        block.open(
          this.countBombs(blocks, block.getX(), block.getY(), width, height),
        );
      });
    }

    public flag(x: number, y: number) {
      if (!this.hasAttribute('play')) {
        return;
      }
      // 旗が立っている＋開いていないブロックの数を数えます。
      const flags =
        this.board.querySelectorAll('[ flag ]:not([ open ])').length;
      const bombs = this.maxbombs - flags;
      // TODO:
      this.bombs.value = bombs + '';
    }

    public gameover() {
      this.setAttribute('game', 'over');
    }

    public gameclear() {
      this.setAttribute('game', 'clear');
    }

    private getCanOpenBlocks(
      blocks: MineBlock[],
      x: number,
      y: number,
      width: number,
      height: number,
    ) {
      // 塗りつぶし
      // ある場所を起点に、条件を満たす連なる部分を抽出して処理を行う塗りつぶしがあります。
      // 色の塗りつぶしやぷよぷよのくっついてる数を調べる等様々なところで使われます。
      // 面積が小さければ再帰関数でも良いですが、再帰関数は関数を深く呼び出しすぎてエラーになることもあります。
      // そこで、ループを使って塗りつぶしを行います。
      // 大雑把には、調べるべきブロックの配列が空になるまでブロックを調べます。
      // ブロックは対象が条件を満たすならの上下左右のブロックを調べるべきブロックの配列に追加します。
      // そうでない場合は何もしません。
      // このようにブロックを調べながら配列を追加しますが、重複ブロックが追加されなければいつか終わります。

      // 爆弾が配置されていない開けるブロックの配列です。
      const nobombs: MineBlock[] = [];
      // 調べるべきブロックです。
      const search: MineBlock[] = [blocks[y * width + x]];

      // 調べるべきブロックの配列がなくなるまで延々と調査します。
      do {
        const block = <MineBlock> search.shift();

        const x = block.getX();
        const y = block.getY();

        // ブロックの上下左右のうち、すでに調べていない爆弾があるもしくは開いているブロック以外を調べるべきブロックに追加します。
        // また旗を立てているブロックも爆弾と同じ扱いにします。
        // 上のブロックを調べます。
        let b = blocks[(y - 1) * width + x];
        if (
          0 < y && nobombs.indexOf(b) < 0 && !b.isBomb() && !b.isOpen() &&
          !b.hasFlag()
        ) {
          search.push(b);
          nobombs.push(b);
        }
        // 下のブロックを調べます。
        b = blocks[(y + 1) * width + x];
        if (
          y + 1 < height && nobombs.indexOf(b) < 0 && !b.isBomb() &&
          !b.isOpen() && !b.hasFlag()
        ) {
          search.push(b);
          nobombs.push(b);
        }
        // 左のブロックを調べます。
        b = blocks[y * width + x - 1];
        if (
          0 < x && nobombs.indexOf(b) < 0 && !b.isBomb() && !b.isOpen() &&
          !b.hasFlag()
        ) {
          search.push(b);
          nobombs.push(b);
        }
        // 右のブロックを調べます。
        b = blocks[y * width + x + 1];
        if (
          x + 1 < width && nobombs.indexOf(b) < 0 && !b.isBomb() &&
          !b.isOpen() && !b.hasFlag()
        ) {
          search.push(b);
          nobombs.push(b);
        }
      } while (0 < search.length);

      return nobombs;
    }

    private countBombs(
      blocks: MineBlock[],
      x: number,
      y: number,
      width: number,
      height: number,
    ) {
      // 周囲の爆弾の数を数えます。
      // 範囲は自分のいるところの-1～+1に加え、横幅や高さの範囲内であることが必要です。
      // そこで、開始点-1と0のより大きい方～開始点+1と横幅や高さのより小さい方の間でを探します。
      let count = 0;
      // 大きい方の比較は < を使うので、正確には+1ではなく+2します。
      const w = Math.min(x + 2, width);
      const h = Math.min(y + 2, height);

      // 小さい方の開始点はそこから始まるので現在の座標-1と0を比較します。
      for (let b = Math.max(y - 1, 0); b < h; ++b) {
        for (let a = Math.max(x - 1, 0); a < w; ++a) {
          if (a === x && b === y) {
            continue;
          }
          if (blocks[b * width + a].isBomb()) ++count;
        }
      }

      return count;
    }

    private countBlock(blocks: MineBlock[]) {
      let count = 0;
      blocks.forEach((block) => {
        if (!block.isOpen()) ++count;
      });
      return count;
    }
  }

  interface MineEvent extends Event {
    detail: MineValue;
  }

  interface MineValue {
    x: number;
    y: number;
  }

  class MineBlock extends HTMLElement implements MineBlockElement {
    public static LONGTIME = 500;
    private x: number;
    private y: number;
    private bomb: boolean;

    constructor(x: number, y: number) {
      super();

      this.bomb = false;
      this.x = x;
      this.y = y;

      this.style.gridColumn = (x + 1) + '/' + (x + 2);
      this.style.gridRow = (y + 1) + '/' + (y + 2);

      const shadow = this.attachShadow({ mode: 'open' });

      const style = document.createElement('style');
      style.innerHTML = [
        ':host { display: block; width: 100%; height: fit-content; --m-flag: var( --mine-flag, "🚩" ); --m-bomb: var( --mine-bomb, "💣" ); --f-size: 1rem; }',
        ':host > div { display: block; width: 100%; padding-top: 100%; position: relative; box-sizing: border-box; overflow: hidden; }',
        ':host > div > button { display: block; cursor: pointer; width: 100%; height: 100%; position: absolute; top: 0; left: 0; }',
        ':host([ flag ]) button::before { content: var( --m-flag ); }',
        ':host([ open ]) > div > button { display: none; }',
        ':host([ bombs ]) > div::after { display: block; position: absolute; width: var( --f-size ); height: var( --f-size ); top: 0; bottom: 0; left: 0; right: 0; margin: auto; }',
        ':host([ bombs = "1" ]) > div::after { content: "1"; }',
        ':host([ bombs = "2" ]) > div::after { content: "2"; }',
        ':host([ bombs = "3" ]) > div::after { content: "3"; }',
        ':host([ bombs = "4" ]) > div::after { content: "4"; }',
        ':host([ bombs = "5" ]) > div::after { content: "5"; }',
        ':host([ bombs = "6" ]) > div::after { content: "6"; }',
        ':host([ bombs = "7" ]) > div::after { content: "7"; }',
        ':host([ bombs = "8" ]) > div::after { content: "8"; }',
      ].join('');

      const block = document.createElement('button');
      let timer: number = 0;
      // クリックとタップどちらにも対応するため、以下のようにします。
      // * クリック/タップで開く。
      // * 右クリック/ロングタップで旗を立てる。

      block.addEventListener('mousedown', (event) => {
        // 右クリックされたら旗を立てます。
        if (event.button === 2) {
          clearTimeout(timer);
          timer = 0;
          return this.flag();
        }
        // そうじゃない場合はタイマーを仕掛けます。
        // 一定時間経ったら旗を立てます。
        timer = setTimeout(() => {
          timer = 0;
          this.flag();
        }, MineBlock.LONGTIME);
      });

      block.addEventListener('mouseup', (event) => {
        event.preventDefault();

        // すでに旗を立てていた場合には何もしません。
        if (timer === 0) {
          return;
        }
        // 旗を立てない場合は開きます。
        this.open();
        // 旗を立てるタイマーを解除します。
        clearTimeout(timer);
        timer = 0;
      });

      // 右クリック時に出てくるメニューを無効化します。
      block.addEventListener('contextmenu', (event) => {
        event.preventDefault();
      });

      const panel = document.createElement('div');
      panel.appendChild(block);

      shadow.appendChild(style);
      shadow.appendChild(panel);
    }

    public getX() {
      return this.x;
    }

    public getY() {
      return this.y;
    }

    public setBomb() {
      this.bomb = true;
    }

    public isBomb() {
      return this.bomb;
    }

    public isOpen() {
      return this.hasAttribute('open');
    }

    public hasFlag() {
      return this.hasAttribute('flag');
    }

    public open(bombs?: number) {
      this.setAttribute('open', '');
      if (this.isBomb()) {
        this.setAttribute('bombs', 'B');
      }
      if (bombs !== undefined) {
        // プログラムによって開かれました。
        this.setAttribute('bombs', bombs + '');
      } else {
        // ユーザーによって開かれました。
        const event = new CustomEvent<MineValue>('open', {
          detail: { x: this.x, y: this.y },
        });
        this.dispatchEvent(event);
      }
    }

    public flag() {
      if (this.hasAttribute('flag')) {
        // 旗を立てている場合は下ろします。
        this.removeAttribute('flag');
      } else {
        // 旗を立てていない場合は立てます。
        this.setAttribute('flag', '');
      }
      const event = new CustomEvent<MineValue>('flag', {
        detail: { x: this.x, y: this.y },
      });
      this.dispatchEvent(event);
    }
  }

  ((tagname = 'mine-sweeper', blocktag = 'mine-block') => {
    if (customElements.get(tagname)) {
      return;
    }
    customElements.define(blocktag, MineBlock);
    customElements.whenDefined(blocktag).then(() => {
      customElements.define(tagname, MineSweeper);
    });
  })(script.dataset.tagname, script.dataset.blockname);
});
