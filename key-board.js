class CustomKeyboard extends HTMLElement {
  static get observedAttributes() {
    return ['css', 'kbd', 'kbd-replace']
  }

  constructor() {
    super()

    // defaults
    this.shift = false
    this.alt = false
    this.altDuration = 350
    this._wrapper = document.createElement('section')
    this._wrapper.setAttribute('class', 'ck')

    // handle custom properties
    // this._handleCustomPropKbd()
    // this._handleCustomPropCSS()

    const shadow = this.attachShadow({
      mode: 'open'
    })
    shadow.appendChild(this._initStyle())
    shadow.appendChild(this._wrapper)
    this._initKbd()
  }

  connectedCallback() {}

  attributeChangedCallback(name, oldval, newval) {
    console.log(`the ${name} attribute has changed from ${oldval} to ${newval}!!`);

    switch (name) {
      case 'alt':
        this.altDuration = this.propAlt
        break;
      case 'css':

        break;
      default:
        break;
    }
  }

  get _defaultKbd() {
    /* beautify preserve:start */
    return [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
      [
        {main: 'q', shift: 'Q', alt: '%'},
        {main: 'w', shift: 'W', alt: '\\'},
        {main: 'e', shift: 'E', alt: '|'},
        {main: 'r', shift: 'R', alt: '='},
        {main: 't', shift: 'T', alt: '['},
        {main: 'y', shift: 'Y', alt: ']'},
        {main: 'u', shift: 'U', alt: '<'},
        {main: 'i', shift: 'I', alt: '>'},
        {main: 'o', shift: 'O', alt: '{'},
        {main: 'p', shift: 'P', alt: '}'},
      ],
      [
        {main: 'a', shift: 'A', alt: '@'},
        {main: 's', shift: 'S', alt: '#'},
        {main: 'd', shift: 'D', alt: '$'},
        {main: 'f', shift: 'F', alt: '_'},
        {main: 'g', shift: 'G', alt: '&'},
        {main: 'h', shift: 'H', alt: '-'},
        {main: 'j', shift: 'J', alt: '+'},
        {main: 'k', shift: 'K', alt: '('},
        {main: 'l', shift: 'L', alt: ')'},
      ],
      [
        {display: '^', main: 'SHIFT'},
        {main: 'z', shift: 'Z', alt: '*'},
        {main: 'x', shift: 'X', alt: '"'},
        {main: 'c', shift: 'C', alt: '\''},
        {main: 'v', shift: 'V', alt: ':' },
        {main: 'b', shift: 'B', alt: ';'},
        {main: 'n', shift: 'N', alt: '!'},
        {main: 'm', shift: 'M', alt: '?'},
        {display: '<', main: 'BACKSPACE',},
      ],
      [
        {display: '?123', main: 'ALT'},
        '/',
        {main: 'SPACE'},
        '.',
        {display: '->', main: 'ENTER'},
      ]
    ];
    /* beautify preserve:end */
  }

  get _defaultCSS() {
    return `
    .ck {
      position: absolute;
      left: 0;
      right: 0;
    }

    .ck__row {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ck__key {
      position: relative
    }

    .ck__alt-key {
      position: absolute;
      font-size: 6px;
      right: 0.15em;
      top: 0.15em;
    }`
  }

  get propCSS() {
    return this.getAttribute('css')
  }

  get propKbd() {
    return this.getAttribute('kbd')
  }

  get propKbdReplace() {
    return this.getAttribute('kbd-replace')
  }

  get propAlt() {
    return this.getAttribute('alt')
  }

  /**
   * @name _initStyle
   * @desc add default styles
   */
  _initStyle() {
    const style = document.createElement('style')
    style.textContent = this._defaultCSS

    return style
  }

  /**
   * @name _initKbd
   * @desc render default keyboard if nothing is passed in
   */
  _initKbd() {
    // skip rendering if kbd is passed as prop
    if (this.propKbd) return

    this._createKbd(this._defaultKbd)
  }

  /**
   * @name _createKbd
   * @desc populate wrapper with rows and keys
   * @param {Array} kbd
   */
  _createKbd(kbd = this._defaultKbd) {
    console.log(kbd);

    // remove all rows before adding new ones
    while (this._wrapper.firstChild) {
      this._wrapper.removeChild(this._wrapper.firstChild)
    }

    kbd.forEach(row => {
      const rowNode = document.createElement('div')
      rowNode.setAttribute('class', 'ck__row')

      row.forEach(key => {
        const keyNode = document.createElement('button')
        keyNode.setAttribute('class', 'ck__key')
        keyNode.textContent = key.display || key.main || key

        keyNode.dataset.main = key.main || key
        keyNode.dataset.display = key.display || ''
        keyNode.dataset.shift = key.shift || ''
        keyNode.dataset.alt = key.alt || ''

        if (key.alt || key.shift) {
          const altNode = document.createElement('span')
          altNode.setAttribute('class', 'ck__alt-key')
          altNode.textContent = key.alt || key.shift
          keyNode.appendChild(altNode)
        }

        keyNode.addEventListener('mousedown', e => {
          keyNode.dataset.clickStart = Date.now()
        })

        keyNode.addEventListener('mouseup', e => {
          const clickStart = keyNode.dataset.clickStart
          const clickEnd = Date.now()
          const clickDuration = clickEnd - (clickStart * 1)
          /* beautify preserve:start */
          const customEvent = new CustomEvent('ck-click', {
            detail: clickDuration >= this.altDuration
              ? this.alt
                ? key.main || key
                : key.alt || key.shift || key.main || key
              : this.alt
                ? key.alt || key.shift || key.main || key
                : this.shift
                  ? key.shift || key.main || key
                  : key.main || key
            })
          /* beautify preserve:end */

          this.dispatchEvent(customEvent)
          if (key.main === 'SHIFT') this._toggleShift()
          if (key.main === 'ALT') this._toggleAlt()
        })
        rowNode.appendChild(keyNode)
      })
      this._wrapper.appendChild(rowNode)
    })
  }

  /**
   * @name _toggleAlt
   * @desc toggle internal value of alt, loop all keys and replace alt key with main
   */
  _toggleAlt() {
    this.alt = !this.alt
    this.shift = false

    const keys = this._wrapper.querySelectorAll('.ck__key')
    keys.forEach(key => {

      key.childNodes[0].textContent = this.alt
        ? key.dataset.alt || key.dataset.display || key.dataset.main
        : key.dataset.display || key.dataset.main

      if (key.childNodes[1]) {
        key.childNodes[1].textContent = this.alt
          ? key.dataset.display || key.dataset.main
          : key.dataset.alt || key.dataset.display || key.dataset.main
      }
    })
  }

  /**
   * @name _toggleShift
   * @desc toggle internal value of shift key, loop all keys and replace just the text in each key
   */
  _toggleShift() {
    this.shift = !this.shift
    this.alt = false

    const keys = this._wrapper.querySelectorAll('.ck__key')
    keys.forEach(key => {
      key.childNodes[0].textContent = this.shift
        ? key.dataset.shift || key.dataset.display || key.dataset.main
        : key.dataset.display || key.dataset.main

      if (key.childNodes[1]) {
        key.childNodes[1].textContent = key.dataset.alt || key.dataset.shift
      }
    })
  }

  /**
   * @name _handleCustomPropCSS
   * @desc append custom CSS to the end of default one, overiding overlaping classes
   */
  _handleCustomPropCSS() {
    const style = document.querySelector('style') || document.createElement('style')
    style.textContent = this._defaultCSS
    style.textContent += this.propCSS ? this.propCSS : ''

    return style
  }

  /**
   * @name _handleCustomPropKbd
   * @desc map custom keyboard over default one
   */
  _handleCustomPropKbd() {
    let kbd = JSON.parse(this.propKbd)
    let kbdReplace = JSON.parse(this.propKbdReplace)

    if (!kbd) return this._createKbd()
    if (kbdReplace) return this._createKbd(kbd)

    let newKbd = [...this._defaultKbd]
    kbd.forEach((row, i) => {
      if (!row) return
      row.forEach((key, j) => {
        if (!key) return
        newKbd[i][j] = key
        return key
      })
    })

    return this._createKbd(newKbd)
  }
};

customElements.define('key-board', CustomKeyboard);
