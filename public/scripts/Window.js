// Next: create a system which lists the focused window (last touched window)

export default class Window extends HTMLElement {
  constructor() {
    super();

    Window.windows.push(this);

    this.setAttribute('data-past-coords', '0,0');
    this.setAttribute('data-coords', '0,0');
  }

  connectedCallback() {
    const template = document.createElement('template');
    template.innerHTML = Window.template;

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.append(template.content.cloneNode(true));

    this.classList.add('windowed');

    this.dragToResize();
  }

  dragToResize() {
    const resizer = this.shadowRoot.querySelector('.resizer.app');

    let mouseIsDown = false;
    resizer.addEventListener('mousedown', () => mouseIsDown = true);
    addEventListener('mouseup', () => mouseIsDown = false);
    
    addEventListener('mousemove', () => {
      if (!mouseIsDown) return;

      const [pmouseX, pmouseY] = this.getAttribute('data-past-coords').split(',');
      const [mouseX, mouseY] = this.getAttribute('data-coords').split(',');

      this.resizeWindow(
        this.clientLeft + mouseX,
        this.clientTop + mouseY
      );
    });
  }

  resizeWindow(width, height) {
    this.setAttribute('style', `
      width: ${width}px;
      height: ${height}px
    `);
  }
}

Window.windows = [];

Window.template = `
  <header class="app"></header>
  <main class="app"></main>
  <span class="app resizer"></span>
  <style>
    header.app {
      min-height: 2em;
      background-color: #AAA;
    }

    main.app {
      flex: 1;
      background-color: #EEE;
    }

    .resizer.app {
      position: absolute;
      background-color: #888;
      z-index: 2;
      width: 0.75em;
      height: 0.75em;
      right: 0;
      bottom: 0;
      cursor: se-resize;
      border-top-left-radius: 50%;
    }
  </style>
`;

customElements.define(
  'app-window',
  Window
);
