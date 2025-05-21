class VariantSelect extends HTMLElement {
  constructor() {
    super()
    this.accessToken = '750df0cc7044703e0137f0290085e990'
    this.graphUrl =
      'https://quickstart-5f3da1d7.myshopify.com/api/2025-04/graphql.json'

    this.product = this.getAttribute('data-handle')
    this.variants = JSON.parse(document.querySelector('#variants').textContent)
    this.addEventListener('change', this.onVariantChange)

    this.productData = null
  }
  async connectedCallback() {
    try {
      const response = await fetch(this.graphUrl, {
        async: true,
        crossDomain: true,
        method: 'POST',
        headers: {
          'X-Shopify-Storefront-Access-Token': this.accessToken,
          'Content-Type': 'application/graphql',
        },
        body: this.productQuery(),
      })

      const res = await response.json()

      this.productData = res.data.productByHandle

      this.renderOptions()
    } catch (err) {
      console.error('Error fetching product data:', err)
    }
  }

  productQuery() {
    return `query {
                productByHandle(handle: "${this.product}") {
                  title
                  handle
                  featuredImage {
                    url
                    id
                  }
                  variants(first: 100) {
                    edges {
                      node {
                        id
                        price {
                          amount
                        }
                        title
                        availableForSale
                        quantityAvailable
                        image {
                          url
                          id
                        }
                      }
                    }
                  }
                  options {
                    name
                    values
                  }
                }
              }`
  }

  decodeId(id) {
    const shopifyId = id.split('/').pop()
    return parseInt(shopifyId)
  }

  renderOptions() {
    //get first available variant
    this.firstAvailableVariant = JSON.parse(
      document.querySelector('#first-available-variant').textContent
    )

    let html = `
      <div class="flex flex-col my-4">`

    //based on the first selected option, load the variants
    this.selectedVariants = this.variants.filter((variant) => {
      return variant.option1 == this.firstAvailableVariant[0].option1
    })

    console.log(this.productData)

    if (
      this.productData.options.length != 1 &&
      this.productData.options[0].values.length != 1
    ) {
      console.log(
        this.productData.options.length,
        this.productData.options[0].values.length
      )
      //render first drop down
      html += `<label for="select-option1" class="text-sm uppercase font-bold my-2">${this.productData.options[0].name}</label>`
      html += `<select id="select-option1" class="option">`
      //loop through each option value
      this.productData.options[0].values.forEach((value) => {
        html += `<option value="${value}">${value}</option>`
      })
      html += `</select>`
    }

    if (this.productData.options.length > 1) {
      //render second drop down
      html += `<label for="select-option2" class="text-sm uppercase font-bold my-2">${this.productData.options[1].name}</label>`
      html += `<select id="select-option2" class="option">`
      //loads the option based on the first selected variant
      this.selectedVariants.forEach((variant) => {
        if (variant.option2 != null) {
          if (variant.available == false) {
            html += `<option disabled value="${variant.option2}">${variant.option2} - Sold Out</option>`
          } else {
            html += `<option value="${variant.option2}">${variant.option2}</option>`
          }
        }
      })

      html += `</select>`
    }

    html += `</div>`

    this.insertAdjacentHTML('beforeend', html)
  }

  onVariantChange(e) {
    this.optionDropdowns = this.querySelectorAll('select')
    //based on first selected dropdown load the second one

    this.options = Array.from(
      this.querySelectorAll('select'),
      (select) => select.value
    )
    //if the change is on the first select dropdown
    if (e.target.id == 'select-option1') {
      //only works if variant.option2 is available
      let options = this.optionDropdowns[1] ? this.optionDropdowns[1] : null

      //reset options on update
      if (options != null) {
        options.innerHTML = ''
      }

      this.selectedVariants = this.variants.filter((variant) => {
        return variant.option1 == this.options[0]
      })
      //assign second set of options

      this.selectedVariants.forEach((variant) => {
        if (variant.option2 != null) {
          let newOption = document.createElement('option')
          newOption.value = variant.option2
          if (variant.available == false) {
            newOption.text = variant.option2 + ' - Sold Out'
            newOption.disabled = true
          } else {
            newOption.text = variant.option2
          }
          options.add(newOption)
        }
      })
    }

    //get current variant from selected options
    this.currentVariant = this.variants.find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option
        })
        .includes(false)
    })

    //bug function, if current variant doesn't exist, but both options are selected then rerun
    if (!this.currentVariant) {
      if (this.options[1] != '') {
        this.options[1] = this.querySelector('#select-option2').value
        this.currentVariant = this.variants.find((variant) => {
          return !variant.options
            .map((option, index) => {
              return this.options[index] === option
            })
            .includes(false)
        })
        document.querySelector('buy-button').id = this.currentVariant.id
      }
    }

    if (this.currentVariant) {
      //update price on variant change
      document.querySelector('buy-button').id = this.currentVariant.id
      if (this.currentVariant?.price) {
        document.querySelector('.price-item').innerText =
          '$' + (this.currentVariant?.price / 100).toFixed(2)
      }
      //update gallery image on variant change
      if (this.currentVariant.featured_image != null) {
        const changeSlider = new CustomEvent('changeSlider', {
          bubbles: true,
          cancelable: true,
          composed: true,
          detail: {
            media_id: this.currentVariant.featured_image,
          },
        })

        document.dispatchEvent(changeSlider)
      }
    }
  }

  decodeId(id) {
    const shopifyId = id.split('/').pop()
    return parseInt(shopifyId)
  }
}
customElements.define('variant-select', VariantSelect)
