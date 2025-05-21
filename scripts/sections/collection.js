class Collection extends HTMLElement {
  constructor() {
    super()
    this.accessToken = '750df0cc7044703e0137f0290085e990'
    this.graphUrl =
      'https://quickstart-5f3da1d7.myshopify.com/api/2025-04/graphql.json'
    this.cursor = null
    this.hasNextPage = false
    this.numProducts = 32
    this.collection = this.getAttribute('data-handle')
    this.grid = this.querySelector('#products-grid')
    this.page = 1
    this.filters = null
    this.sortKey = null
  }
  connectedCallback() {
    this.fetchProducts()
    this.toggleFilters()
    this.filtering()
    this.sorting()
  }

  toggleFilters() {
    this.querySelector('.open-filters').addEventListener('click', () => {
      this.querySelector('.filters-wrap').classList.toggle('hidden')
      this.querySelector('.filters-wrap-inner').classList.toggle('active')
    })

    this.querySelectorAll('.close-filters').forEach((button) => {
      button.addEventListener('click', () => {
        this.querySelector('.filters-wrap').classList.add('hidden')
        this.querySelector('.filters-wrap-inner').classList.remove('active')
      })
    })
  }

  productQuery() {
    let arg = this.cursor
      ? `first: ${this.numProducts} after: "${this.cursor}"`
      : `first: ${this.numProducts}`
    return `query {
                collectionByHandle(handle: "${this.collection}") {
                    products(${arg}, filters: ${this.filters} , sortKey:${this.sortKey}) {
                        edges {
                            cursor
                            node{
                                handle
                                title
                                featuredImage {
                                    url
                                }
                                tags
                                variants(first: 100) {
                                    edges {
                                        node {
                                          availableForSale
                                          barcode
                                          compareAtPrice {
                                            amount
                                          }
                                          price {
                                            amount
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
                        }
                        pageInfo {
                            hasNextPage
                        }
                    }
                }
            }`
  }

  renderGrid(products) {
    this.cursor = `${products[products.length - 1]?.cursor}`

    products.forEach((product, i) => {
      let image = product.node.featuredImage.url
      let productHandle = `data-product-handle="${product.node.handle}"`
      let price = Number(
        product.node.variants.edges[0].node.price.amount
      ).toFixed(2)
      let variants = product.node.variants.edges
      let available = product.node.variants.edges.filter(
        (variant) => variant.node.availableForSale
      )
      let firstAvailableVariant
      if (available.length > 0) {
        firstAvailableVariant = available[0].node.id.split('/').pop()
      } else {
        firstAvailableVariant = 'sold-out'
      }

      let html = `
        <collection-card data-handle="${product.node.handle}" variant-id="${firstAvailableVariant}" class="product-grid-item flex flex-col h-full ${product.node.handle}">
            <div class="relative">
              <a href="/products/${product.node.handle}" class="block">
                <img src="${image}" alt="${product.node.title}" />
              </a>
            </div>
            <div class="variant-buttons"></div>
            <a href="/products/${product.node.handle}" class="block">
              <h3 class="text-dark product-grid-item__title block font-bold text-base">${product.node.title}</h3>
            </a>
            <div class="text-dark block text-sm product-grid-item__price">$${price}</div>
      `

      html += `<span class="product-cta text-dark uppercase cursor-pointer text-sm font-display mt-auto">add to cart</span>`
      html += `<dialog class="mx-auto max-w-medium p-0 border-0" id="d${i}">
   
    <div class="relative z-10" role="dialog" aria-modal="true">
      <!--
        Background backdrop, show/hide based on modal state.
    
        Entering: "ease-out duration-300"
          From: "opacity-0"
          To: "opacity-100"
        Leaving: "ease-in duration-200"
          From: "opacity-100"
          To: "opacity-0"
      -->
    
      <div >
        <div class="flex min-h-full items-stretch justify-center text-center md:items-center md:px-2 lg:px-4">
          <!--
            Modal panel, show/hide based on modal state.
    
            Entering: "ease-out duration-300"
              From: "opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
              To: "opacity-100 translate-y-0 md:scale-100"
            Leaving: "ease-in duration-200"
              From: "opacity-100 translate-y-0 md:scale-100"
              To: "opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
          -->
          <div class="flex w-full transform text-left text-base transition md:my-8 md:max-w-2xl md:px-4 lg:max-w-4xl">
            <div class="relative flex w-full items-center overflow-hidden bg-white px-4 pb-8 pt-14 shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8">
              <button onclick="d${i}.close()" type="button" class="border-0 absolute right-4 top-4 text-gray-400 hover:text-gray-500 sm:right-6 sm:top-8 md:right-6 md:top-6 lg:right-8 lg:top-8">
                <span class="sr-only">Close</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
    
              <div class="grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-12 lg:gap-x-8">
                <div class="sm:col-span-4 lg:col-span-5">
                  <div class="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-100">
                    <img src="https://tailwindui.com/img/ecommerce-images/product-quick-preview-03-detail.jpg" alt="Interior of light green canvas bag with padded laptop sleeve and internal organization pouch." class="object-cover object-center">
                  </div>
                  <p class="absolute left-4 top-4 text-center sm:static sm:mt-6">
                    <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">View full details</a>
                  </p>
                </div>
                <div class="sm:col-span-8 lg:col-span-7">
                  <h2 class="quick-view-title text-2xl font-bold text-gray-900 sm:pr-12">${product.node.title}</h2>
    
                  <section aria-labelledby="information-heading" class="mt-4">
                    <h3 id="information-heading" class="sr-only">Product information</h3>
    
                    <div class="flex items-center">
                      <p class="text-lg text-gray-900 sm:text-xl">$${price}</p>
    
                    
                    </div>
    
                    <div class="mt-6 flex items-center">
                      <svg class="h-5 w-5 flex-shrink-0 text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                      </svg>
                      <p class="ml-2 font-medium text-gray-500">In stock and ready to ship</p>
                    </div>
                  </section>
    
                  <section aria-labelledby="options-heading" class="mt-6">
                    <h3 id="options-heading" class="sr-only">Product options</h3>
    
                    <form>
                      <div class="mt-4 flex">
                        <a href="#" class="group flex text-sm text-gray-500 hover:text-gray-700">
                          <span>What size should I buy?</span>
                          <svg class="ml-2 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                          </svg>
                        </a>
                      </div>
                      <div class="mt-6">
                        <button type="submit" class="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50">Add to bag</button>
                      </div>
                      <div class="mt-6 text-center">
                        <a href="#" class="group inline-flex text-base font-medium">
                          <svg class="mr-2 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                          </svg>
                          <span class="text-gray-500 group-hover:text-gray-700">Lifetime Guarantee</span>
                        </a>
                      </div>
                    </form>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
              </dialog>
              <button class="quick-view" onclick="d${i}.showModal()">Quick View</button>`

      html += `</collection-card>`
      this.grid.insertAdjacentHTML('beforeend', html)
    })
  }

  fetchProducts() {
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
        let response = res.data.collectionByHandle.products
        if (response.edges == 0) {
          $('#products-grid').html(
            "<p class='p-6 col-span-2'>Sorry, we couldn't find any products that match your search criteria.</p>"
          )
        } else {
          this.renderGrid(response.edges)
        }

        this.hasNextPage = response.pageInfo.hasNextPage
      })
  }

  pagination() {
    const self = this

    $('.load-more').on('click', function () {
      self.page++
      if (self.hasNextPage) {
        self.hasNextPage = false
        self.fetchProducts()
      }

      //on iphone the load more button scrolls up for some reason, fix that bug here, give me suggsetions if you have a better way to do this - thanks
      if ($(window).width() < 1024) {
        $('html, body').animate({ scrollTop: $(this).offset().top - 100 }, 1000) //scroll to top of load more button on mobile devices after loading more products - thanks  - thanks
      }
      $('.product-grid-item').last().find('a')[0].focus()
    })
  }

  sorting() {
    this.querySelector('#SortBy').addEventListener('change', () => {
      this.sortKey = this.querySelector('#SortBy').value
      this.cursor = null
      this.hasNextPage = false
      this.grid.innerHTML = ''
      this.fetchProducts()
    })
  }

  filtering() {
    const self = this
    let filtersArr = []

    this.querySelector('.apply-filters').addEventListener('click', () => {
      filtersArr = []
      const checkedInputs = this.querySelectorAll(
        '.filters-wrap input[type="checkbox"]:checked'
      )
      const filterSortInputs = document.querySelectorAll(
        '.filter-sort input:checked'
      )
      if (filterSortInputs.length > 0) {
        this.sortKey = filterSortInputs[0].value
      }

      checkedInputs.forEach(function (input) {
        let obj
        const dataKey = input.dataset.key
        const valueType = input.dataset.type
        const value = input.value

        if (dataKey === 'productMetafield') {
          obj = {
            [dataKey]: {
              key: 'category',
              namespace: 'custom',
              value: value,
            },
          }
        } else if (dataKey === 'tag') {
          obj = { tag: value }
        } else {
          obj = {
            [dataKey]: {
              name: valueType,
              value: value,
            },
          }
        }
        filtersArr.push(obj)
      })

      filtersArr.push({
        price: {
          min: document.getElementById('fromSlider').value / 100,
          max: document.getElementById('toSlider').value / 100,
        },
      })

      let unquoted = JSON.stringify(filtersArr).replace(/"([^"]+)":/g, '$1:')

      this.filters = unquoted
      this.cursor = null
      this.hasNextPage = false
      this.grid.innerHTML = ''
      this.fetchProducts()
    })

    this.querySelector('.reset-filters').addEventListener('click', () => {
      this.filters = null
      this.cursor = null
      this.querySelector('.filters-wrap')
        .querySelectorAll('input')
        .forEach((input) => {
          input.checked = false
        })
      this.querySelector('#fromSlider').value = 0
      this.querySelector('#fromInput').value = '$0.00'
      this.querySelector('#toInput').value =
        this.querySelector('#toInput').dataset.initValue
      this.querySelector('#toSlider').value =
        this.querySelector('#toSlider').dataset.max
      this.sortKey = null
      this.hasNextPage = false
      this.grid.innerHTML = ''
      this.fetchProducts()
    })

    // $('.reset-filters').on('click', function () {
    //   $('.filters-wrap input').prop('checked', false)
    //   self.filters = null
    //   self.cursor = null
    //   $('#fromSlider').val(0)
    //   $('#fromInput').val('$0.00')
    //   $('#toInput').val($('#toInput').data('init-value'))
    //   $('#toSlider').val($('#toSlider').data('max'))
    //   this.sortKey = null
    //   self.hasNextPage = false
    //   self.grid.empty()
    //   self.fetchProducts()
    // })
  }

  mobileGridView() {
    $('.grid-view-1').on('click', function () {
      $(this).addClass('hidden')
      $('.grid-view-2').removeClass('hidden')
      $('#products-grid').addClass('grid-cols-1')
      $('#products-grid').removeClass('grid-cols-2')
    })
    $('.grid-view-2').on('click', function () {
      $(this).addClass('hidden')
      $('.grid-view-1').removeClass('hidden')
      $('#products-grid').addClass('grid-cols-2')
      $('#products-grid').removeClass('grid-cols-1')
    })
  }
}
customElements.define('collection-template', Collection)
