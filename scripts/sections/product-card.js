class ProductCard extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    if (this.querySelector('.choose-option')) {
      this.querySelector('.choose-option').addEventListener('click', () => {
        this.querySelector('.variant-dropdown').classList.remove('hidden')
      })
    }
    if (this.querySelector('.variant-dropdown')) {
      this.querySelector('.variant-dropdown').addEventListener(
        'change',
        (e) => {
          if (
            e.target.options[e.target.selectedIndex].getAttribute('img-src')
          ) {
            this.querySelector('.product-image').srcset =
              e.target.options[e.target.selectedIndex].getAttribute('img-src')
          }
          this.querySelector('.product-price').innerHTML =
            e.target.options[e.target.selectedIndex].getAttribute('price')
          this.querySelector('.choose-option').classList.add('hidden')
          this.querySelector('.button-submit').classList.add('flex')
          this.querySelector('.button-submit').classList.remove('hidden')
        }
      )
    }
  }
}

customElements.define('product-card', ProductCard)
