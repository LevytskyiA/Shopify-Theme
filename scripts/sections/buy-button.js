class BuyButton extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('click', this.addToCart)
  }

  addToCart() {
    let formData = {
      items: [
        {
          id: this.id,
          quantity: document.querySelector('quantity-input input').value,
        },
      ],
    }

    fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        let sidecart = document.querySelector('side-cart')
        sidecart?.openCart()
        console.log('success')
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  }
}

customElements.define('buy-button', BuyButton)
