class CollectionCard extends HTMLElement {
  constructor() {
    super()
    this.accessToken = '750df0cc7044703e0137f0290085e990'
    this.graphUrl =
      'https://quickstart-5f3da1d7.myshopify.com/api/2025-04/graphql.json'
    this.product = this.getAttribute('data-handle')
    this.productData = null
  }
  connectedCallback() {
    this.querySelector('.product-cta').addEventListener('click', () => {
      this.addToCart()
    })
    this.querySelector('.quick-view').addEventListener('click', () => {
      this.quickView()
    })
  }

  quickView() {
    fetch(this.graphUrl, {
      async: true,
      crossDomain: true,
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': this.accessToken,
        'Content-Type': 'application/graphql',
      },
      body: this.productQuery(),
    })
      .then((res) => res.json())
      .then((res) => {
        this.productData = res.data.productByHandle
        this.querySelector('.quick-view-title').innerHTML =
          this.productData.title
        this.renderOptions()
        this.querySelector('.variant-buttons').addEventListener(
          'click',
          this.onVariantChange(this.productData.variants.edges)
        )
      })
      .catch((err) => console.log(err))
  }

  getFirstAvailableProduct(jsonData) {
    // Parse the JSON data
    const data = jsonData

    // Iterate through the objects in the data
    for (const obj of data) {
      // Check if the object's availableForSale property is true
      if (obj.node.availableForSale === true) {
        return obj
      }
    }

    // If no object with availableForSale=true is found, return null or handle the case as per your requirement
    return null
  }

  renderOptions() {
    //get first available variant
    this.firstAvailableVariant = this.getFirstAvailableProduct(
      this.productData.variants.edges
    )

    this.variants = this.productData.variants.edges

    let html = `
    <div class="flex flex-col my-4">`

    //based on the first selected option, load the variants
    this.selectedVariants = this.variants.filter((variant) => {
      return (
        variant.node.selectedOptions[0].value ==
        this.firstAvailableVariant.node.selectedOptions[0].value
      )
    })

    if (
      this.productData.options.length >= 1 &&
      this.productData.options[0].values.length > 1
    ) {
      //render first drop down
      html += `<label for="${this.productData.options[0].name}" class="text-sm uppercase font-bold my-2">${this.productData.options[0].name}</label>`
      html += `<fieldset class="flex" id="${this.productData.options[0].name}">`
      //if only one set of options, render the first level of variants directly, if variant is sold then disable option
      if (this.productData.options.length == 1) {
        this.productData.variants.edges.forEach((variant) => {
          if (variant.node.availableForSale == false) {
            html += `<input class="product__variant--button hidden" disabled name="select-option1" id="option-${variant.node.title}" type="radio" value="${variant.node.title}"><label class="button-primary block mr-2" for="option-${variant.node.title}">${variant.node.title} - Sold Out</label>`
          } else {
            //if first available variant is the same as the variant, then check it
            if (
              this.firstAvailableVariant.node.selectedOptions[0].value ==
              variant.node.title
            ) {
              html += `<input class="product__variant--button hidden" name="select-option1" checked id="option-${variant.node.title}" type="radio" value="${variant.node.title}"><label class="button-primary block mr-2" for="option-${variant.node.title}">${variant.node.title}</label>`
            } else {
              html += `<input class="product__variant--button hidden" name="select-option1" id="option-${variant.node.title}" type="radio" value="${variant.node.title}"><label class="button-primary block mr-2" for="option-${variant.node.title}">${variant.node.title}</label>`
            }
          }
        })
      } else {
        //if variant has more than one set of options, then don't disable the first level of options
        this.productData.options[0].values.forEach((value) => {
          if (
            this.firstAvailableVariant.node.selectedOptions[0].value == value
          ) {
            html += `<input class="product__variant--button hidden" name="select-option1" checked id="option-${value}" type="radio" value="${value}"><label class="button-primary block mr-2" for="option-${value}">${value}</label>`
          } else {
            html += `<input class="product__variant--button hidden" name="select-option1" id="option-${value}" type="radio" value="${value}"><label class="button-primary block mr-2" for="option-${value}">${value}</label>`
          }
        })
      }
      html += `</fieldset>`
    }

    if (this.productData.options.length > 1) {
      //render second drop down
      html += `<label for="${this.productData.options[1].name}" class="text-sm uppercase font-bold my-2">${this.productData.options[1].name}</label>`
      html += `<fieldset class="flex" id="${this.productData.options[1].name}">`
      //loads the option based on the first selected variant
      console.log(this.selectedVariants)

      this.selectedVariants.forEach((variant) => {
        if (variant.node.selectedOptions[1] != null) {
          if (variant.node.availableForSale == false) {
            html += `<input class="product__variant--button hidden" disabled name="select-option2" id="option-${variant.node.selectedOptions[1].value}" type="radio" value="${variant.node.selectedOptions[1].value}"><label class="button-primary block mr-2" for="option-${variant.node.selectedOptions[1].value}">${variant.node.selectedOptions[1].value} - sold out</label>`
          } else {
            if (
              this.firstAvailableVariant.node.selectedOptions[1].value ==
              variant.node.selectedOptions[1]
            ) {
              html += `<input class="product__variant--button hidden" name="select-option2" checked id="option-${variant.node.selectedOptions[1].value}" type="radio" value="${variant.node.selectedOptions[1].value}"><label class="button-primary block mr-2" for="option-${variant.node.selectedOptions[1].value}">${variant.node.selectedOptions[1].value}</label>`
            } else {
              html += `<input class="product__variant--button hidden" name="select-option2" id="option-${variant.node.selectedOptions[1].value}" type="radio" value="${variant.node.selectedOptions[1].value}"><label class="button-primary block mr-2" for="option-${variant.node.selectedOptions[1].value}">${variant.node.selectedOptions[1].value}</label>`
            }
          }
        }
      })

      html += `</fieldset>`
    }

    html += `</div>`

    this.querySelector('.variant-buttons').insertAdjacentHTML('beforeend', html)
  }

  onVariantChange(variants) {
    this.variants = variants
    this.fieldsets = Array.from(this.querySelectorAll('fieldset'))
    this.options = this.fieldsets.map((fieldset) => {
      const checkedRadio = Array.from(fieldset.querySelectorAll('input')).find(
        (radio) => radio.checked
      )
      return checkedRadio ? checkedRadio.value : null
    })

    //if the change is on the first select dropdown
    if (e.target.name == 'select-option1') {
      //only works if variant.option2 is available
      let options = this.fieldsets[1] ? this.fieldsets[1] : null
      //reset options on update
      this.selectedVariants = this.variants.filter((variant) => {
        return variant.node.selectedOptions[0].value == this.options[0]
      })

      this.selectedVariants = this.variants.filter((variant) => {
        return variant.node.selectedOptions[0].value == this.options[0]
      })
      //assign second set of options
      if (this.productData.options.length > 1) {
        let html = ''
        this.selectedVariants.forEach((variant) => {
          if (variant.node.selectedOptions[1].value != null) {
            if (variant.available == false) {
              html += `<input class="product__variant--button hidden" disabled name="select-option2" id="option-${variant.node.selectedOptions[1].value}" type="radio" value="${variant.node.selectedOptions[1].value}"><label class="button-primary block mr-2" for="option-${variant.node.selectedOptions[1].value}">${variant.node.selectedOptions[1].value} - sold out</label>`
            } else {
              if (this.options[1] == variant.node.selectedOptions[1].value) {
                html += `<input class="product__variant--button hidden" checked name="select-option2" id="option-${variant.node.selectedOptions[1].value}" type="radio" value="${variant.node.selectedOptions[1].value}"><label class="button-primary block mr-2" for="option-${variant.node.selectedOptions[1].value}">${variant.node.selectedOptions[1].value}</label>`
              } else {
                html += `<input class="product__variant--button hidden" name="select-option2" id="option-${variant.node.selectedOptions[1].value}" type="radio" value="${variant.node.selectedOptions[1].value}"><label class="button-primary block mr-2" for="option-${variant.node.selectedOptions[1].value}">${variant.node.selectedOptions[1].value}</label>`
              }
            }
          }
          options.innerHTML = ''

          options.insertAdjacentHTML('beforeend', html)
        })
      }
    }

    //get current variant from selected options
    this.currentVariant = this.variants.find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option
        })
        .includes(false)
    })
  }

  addToCart() {
    let formData = {
      items: [
        {
          id: this.getAttribute('variant-id'),
          quantity: 1,
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
                          availableForSale
                          barcode
                          compareAtPrice {
                            amount
                          }
                          selectedOptions {
                            name
                            value
                          }
                          image {
                            src
                          }
                          id
                          title
                          selectedOptions {
                            name
                            value
                          }
                          sku
                          weight
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
}
customElements.define('collection-card', CollectionCard)
