import _ from 'lodash'

class SearchTemplate extends HTMLElement {
  constructor() {
    super()
    this.query = ''
    this.pageResults = []
    this.articleResults = []
    this.results = []
    this.loading = true
  }

  connectedCallback() {
    const searchBar = this.querySelector('.search-input')
    this.querySelector('.search-input').addEventListener('input', () => {
      const query = searchBar.value.trim()
      this.search(query)
    })
  }

  fetchProducts(query) {
    const debouncedFetch = _.debounce(() => {
      console.log(query, 'debounced')

      fetch(
        `https://quickstart-5f3da1d7.myshopify.com/search/suggest.json?q=${query}&resources[type]=product,page,article&resources[limit]=4`
      )
        .then((response) => response.json())
        .then((suggestions) => {
          this.querySelector('.search-results').classList.remove('hidden')
          if (Object.keys(suggestions.resources.results).length != 0) {
            this.querySelector('.suggested-results').innerHTML = ''
            if (suggestions.resources.results.pages.length > 0) {
              this.pageResults = suggestions.resources.results.pages
              let html = ''
              this.pageResults.forEach((result) => {
                html += `<li class='flow-root'>
                <a
                  href='${result.url}'
                  class='-m-3 rounded-md p-3 text-sm font-medium text-gray-light hover:text-black transition duration-150 ease-in-out hover:bg-gray-50'
                  ><span class='text-black'>${result.title}</a>
              </li>`
              })
              this.querySelector('.suggested-results').insertAdjacentHTML(
                'beforeend',
                html
              )
            }

            if (suggestions.resources.results.articles.length > 0) {
              this.articleResults = suggestions.resources.results.articles
              let html = ''
              this.articleResults.forEach((result) => {
                html += `<li class='flow-root'>
                <a
                  href='${result.url}'
                  class='-m-3 rounded-md p-3 text-sm font-medium text-gray-light hover:text-black transition duration-150 ease-in-out hover:bg-gray-50'
                  ><span class='text-black'>${result.title}</a>
              </li>`
              })
              this.querySelector('.suggested-results').insertAdjacentHTML(
                'beforeend',
                html
              )
            }

            if (suggestions.resources.results.products.length > 0) {
              this.results = suggestions.resources.results.products
              let html = ''
              this.results.forEach((result) => {
                html += `
                <div class='bg-gray-media'>
                  <a href='/products/${result.handle}' class='group relative h-80'>
                    <div class='h-40 1000:h-56 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75'>
                      <img
                        src='${result.image}'
                        class='h-full w-full object-cover object-center opacity-100'
                      >
                    </div>
                    <h3 class='mt-2 md:mt-4 text-base font-bold mb-0.5 text-black text-center'>${result.title}</h3>
                    <p class='text-sm text-gray-dark font-normal text-center mb-2'>${result.price}</p>
                  </a>
                </div>
                `
              })
              this.querySelector('.search-results-grid').innerHTML = html
            }
            this.loading = false
          } else {
            this.loading = false
            this.results = 0
          }
        })
    }, 1000)

    debouncedFetch()
  }

  search(query) {
    console.log(query)
    this.fetchProducts(query)
  }
}

customElements.define('search-template', SearchTemplate)
