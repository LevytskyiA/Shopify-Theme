class CollectionFacets extends HTMLElement {
  constructor() {
    super()
    this.params = null
    this.page = 1
    this.sortKey = null
    this.hasNextPage = true
  }

  connectedCallback() {
    this.toggleFilters()
    this.filtering()
    this.filteredBy()
    this.sorting()
    this.pagination()
    this.variantChange()
  }

  toggleFilters() {
    this.querySelectorAll('.open-filters').forEach(function (filter) {
      filter.addEventListener('click', () => {
        document.querySelector('.filters-wrap').classList.toggle('hidden')
        document.querySelector('body').classList.add('overflow-hidden')

        setTimeout(() => {
          document
            .querySelector('.filters-wrap-inner')
            .classList.toggle('active')
        })
      })
    })

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('close-filters')) {
        document.querySelector('body').classList.remove('overflow-hidden')

        setTimeout(() => {
          this.querySelector('.filters-wrap').classList.add('hidden')
        }, 500)

        this.querySelector('.filters-wrap-inner').classList.remove('active')
      }
    })
  }

  variantChange() {
    document
      .querySelectorAll('.product-grid-item__variants span')
      .forEach(function (variant) {
        variant.addEventListener('click', function () {
          let parent = variant.closest('.product-grid-item')
          let image = variant.dataset.img
          let price = variant.dataset.price

          parent
            .querySelectorAll('span')
            .forEach((span) => span.classList.remove('active'))
          parent.querySelector('img').src = image
          parent.querySelector('.product-grid-item__price').innerText = price
          variant.classList.add('active')
        })
      })
  }

  pagination() {
    const self = this

    function isElementBottomVisible(element) {
      const elementRect = element.getBoundingClientRect()
      const windowHeight =
        window.innerHeight || document.documentElement.clientHeight

      return elementRect.bottom <= windowHeight
    }

    let showResults = document
      .querySelector('.collection-show-results')
      .innerText.trim()
    let totalResults = document
      .querySelector('.collection-total-results')
      .innerText.trim()

    self.hasNextPage = !(showResults == totalResults)

    window.addEventListener('scroll', function () {
      if (
        isElementBottomVisible(document.getElementById('products-grid')) &&
        self.hasNextPage
      ) {
        self.page++
        self.hasNextPage = false

        let page = window.location.href.includes('?') ? '&page=' : '?page='

        fetch(window.location.href + page + self.page)
          .then((response) => response.text())
          .then((data) => {
            let html = document.createElement('div')
            html.innerHTML = data

            let grid = html.querySelector('#products-grid')

            document.querySelector('#products-grid').innerHTML += grid.innerHTML

            self.variantChange()

            document.querySelector('.collection-show-results').innerText =
              document.querySelectorAll('.product-grid-item').length

            let showResults = document
              .querySelector('.collection-show-results')
              .innerText.trim()
            let totalResults = document
              .querySelector('.collection-total-results')
              .innerText.trim()

            self.hasNextPage = !(showResults == totalResults)
          })
          .catch((error) => console.log('Error:', error))
      }
    })
  }

  sorting() {
    const self = this
    this.querySelector('#SortBy').addEventListener('change', () => {
      self.sortKey = self.querySelector('#SortBy').value
      self.renderParams()
    })
  }

  filteredBy() {
    let url = window.location.href

    if (url.includes('filter.p.tag') || url.includes('filter.v.option')) {
      document.querySelector('.filtered-by-wrap').classList.remove('hidden')

      document
        .querySelectorAll('.selected-filter-remove')
        .forEach(function (item) {
          item.addEventListener('click', function () {
            document
              .querySelector(
                `.filters-wrap input[value="${item.getAttribute('value')}"]`
              )
              .click()
          })
        })

      return
    }

    document.querySelector('.filtered-by-wrap').classList.add('hidden')
  }

  renderGrid() {
    const self = this
    let openedFilters = []

    document.querySelectorAll('details').forEach(function (filter) {
      if (filter.hasAttribute('open')) {
        openedFilters.push(filter.id)
      }
    })
    let scrollPos = document.getElementById('filters-wrap').scrollTop

    fetch(window.location.href)
      .then((response) => response.text())
      .then((data) => {
        let html = document.createElement('div')
        html.innerHTML = data

        let grid = html.querySelector('#products-grid')
        let filters = html.querySelector('.filters-wrap-inner')
        let results = html.querySelector('.collection-results')

        document.querySelector('#products-grid').innerHTML = grid.innerHTML
        document.querySelector('.filters-wrap-inner').innerHTML =
          filters.innerHTML
        document.querySelector('.collection-results').innerHTML =
          results.innerHTML

        openedFilters.forEach(function (id) {
          document.querySelector(`#${id}`).open = true
        })

        document.getElementById('filters-wrap').scrollTop = scrollPos

        self.filtering()
        self.filteredBy()
        self.variantChange()
        self.page = 1

        let showResults = document
          .querySelector('.collection-show-results')
          .innerText.trim()
        let totalResults = document
          .querySelector('.collection-total-results')
          .innerText.trim()

        self.hasNextPage = !(showResults == totalResults)
      })
      .catch((error) => console.log('Error:', error))
  }

  renderParams() {
    const self = this
    let url = window.location.href.split('?')[0]
    let minPrice = Number(document.getElementById('Filter-Price-GTE').value)
    let maxPrice = Number(document.getElementById('Filter-Price-LTE').value)

    self.params = `?filter.v.price.gte=${minPrice}&filter.v.price.lte=${maxPrice}`

    const checkedInputs = self.querySelectorAll(
      '.filters-wrap input[type="checkbox"]:checked'
    )

    checkedInputs.forEach(function (item) {
      self.params +=
        '&' + item.dataset.param + '=' + encodeURIComponent(item.value)
    })

    if (self.sortKey) {
      self.params += '&sort_by=' + self.sortKey
    }

    history.pushState({}, null, url + self.params)

    self.renderGrid()
  }

  filtering() {
    const self = this

    this.querySelectorAll('.filters-wrap input').forEach(function (filter) {
      filter.addEventListener('change', () => {
        self.renderParams()
      })
    })
  }
}
customElements.define('collection-template-facets', CollectionFacets)
