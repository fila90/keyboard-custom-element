const rows = [{
  keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
}, {
  keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']
}, {
  keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm']
}, {
  keys: ['SHIFT', ' ', ]
}];

const css = `
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

  .ck__key--shift {
    text-transform: uppercase;
  }
`;

class CustomKeyboard extends HTMLElement {
  constructor() {
    super()

    this.shift = false
    this.alt = false

    const shadow = this.attachShadow({
      mode: 'open'
    })

    const wrapper = document.createElement('section')
    wrapper.setAttribute('class', 'ck')

    this._handleRows(wrapper)
    this._handleCss(shadow)
    shadow.appendChild(wrapper)
  }

  _handleRows(wrapper) {
    // populate rows
    rows.forEach(row => {
      const rowNode = document.createElement('div')
      rowNode.setAttribute('class', 'ck__row')

      // populate keys
      row.keys.forEach(key => {
        const keyNode = document.createElement('button')
        keyNode.setAttribute('class', 'ck__key')
        // keyNode.setAttribute('value', key)
        keyNode.textContent = key
        // dispatch custom event on click
        keyNode.addEventListener('click', e => {
          const customEvent = new CustomEvent('ck-click', {
            detail: this.shift ? key.toUpperCase() : key
          })
          this.dispatchEvent(customEvent)
          if (key === 'SHIFT') this._handleShift(wrapper)
        })
        rowNode.appendChild(keyNode)
      })
      wrapper.appendChild(rowNode)
    })
  }

  _handleCss(shadow) {
    const style = document.createElement('style')
    const propCss = this.getAttribute('css')
    style.textContent = css
    style.textContent += propCss ? propCss : ''

    shadow.appendChild(style)
  }

  _handleShift(wrapper) {
    const keys = wrapper.querySelectorAll('.ck__key')
    this.shift = !this.shift
    keys.forEach(key => key.classList.toggle('ck__key--shift'))
  }
};

customElements.define('custom-keyboard', CustomKeyboard);
