// Next: create a system which lists the focused window (last touched window)

export default class Window extends HTMLElement {
  constructor() {
    super();

    this.setAttribute('data-past-coords', '0,0');
    this.setAttribute('data-coords', '0,0');
  }

  attributeChangedCallback() {
    const windowTitle = this.shadowRoot.getElementById('window-title'); 
    windowTitle.innerText = this.getAttribute('data-title') || windowTitle.innerText;
  }

  static get observedAttributes() {
    return ['data-title'];
  }

  connectedCallback() {
    const template = document.createElement('template');
    template.innerHTML = Window.template;

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.append(template.content.cloneNode(true));

    this.classList.add('windowed');

    const windowTitle = shadow.getElementById('window-title'); 
    windowTitle.innerText = this.getAttribute('data-title') || windowTitle.innerText;

    this.dragToResize();
    this.dragToMove();
  }

  dragToResize() {
    const resizer = this.shadowRoot.querySelector('.resizer.app');

    let mouseIsDown = false;
    resizer.addEventListener('mousedown', () => mouseIsDown = true);
    addEventListener('mouseup', () => mouseIsDown = false);
    
    addEventListener('mousemove', () => {
      if (!mouseIsDown) return;

      const [mouseX, mouseY] = this.getAttribute('data-coords').split(',');

      this.resizeWindow(
        mouseX - this.offsetLeft,
        mouseY - this.offsetTop,
      );
    });
  }

  resizeWindow(width, height) {
    this.style.width = `${width}px`;
    this.style.height = `${height}px`;
  }

  dragToMove() {
    const header = this.shadowRoot.querySelector('header.app');

    let mouseIsDown = false;
    header.addEventListener('mousedown', event => {
      mouseIsDown = true;
      event.preventDefault();
    });
    Array.prototype.forEach.call(header.children, child => {
      child.addEventListener('mousedown', event => {
        event.stopPropagation();
      });
    });

    addEventListener('mouseup', () => mouseIsDown = false);
    
    addEventListener('mousemove', () => {
      if (!mouseIsDown) return;

      const [pmouseX, pmouseY] = this.getAttribute('data-past-coords').split(',');
      const [mouseX, mouseY] = this.getAttribute('data-coords').split(',');

      this.moveWindow(
        this.offsetLeft + (mouseX - pmouseX),
        this.offsetTop + (mouseY - pmouseY)
      );
    });
  }

  moveWindow(x, y) {
    const header = document.querySelector('main.main-doc');
    const taskbar = document.querySelector('nav.main-doc');
    const docWidth = header.offsetWidth;
    const docHeight = header.offsetHeight + taskbar.offsetHeight;

    this.style.left = `${x < 0 ? 0 : x > docWidth ? docWidth - 10 : x}px`;
    this.style.top = `${y < 0 ? 0 : y > docHeight ? docHeight - 10 : y}px`;
  }
}

Window.template = `
  <header class="app">
    <span id="window-title">Window<span>
  </header>
  <main class="app"></main>
  <span class="app resizer"></span>
  <style>
    header.app {
      min-height: 2em;
      background-color: #111;
      cursor: grab;
    }

    #window-title {
      display: inline-block;
      padding: 0.5em;
      font-weight: 700;
      font-family: sans-serif;
      color: white;
// Next: create a system which lists the focused window (last touched window)
    }

    main.app {
      flex: 1;
      background-color: #222;
    }

    .resizer.app {
      position: absolute;
      background-color: #111;
      border-left: 2px solid #FF0;
      border-top: 2px solid #FF0;
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
