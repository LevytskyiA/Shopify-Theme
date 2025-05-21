import LazyLoad from 'vanilla-lazyload'

const lazyInstance = new LazyLoad()

class BlogFilters extends HTMLElement {
  constructor() {
    super()
    this.filterData = []

    this.triggerFilter()
    this.resetFilter()
    this.triggerMore()
  }

  setActiveState(event) {
    document.querySelectorAll('.js-blog-filter-tag').forEach((element) => {
      element.classList.remove(
        'text-secondary',
        'border-b-2',
        'border-secondary'
      )
      element.classList.add('hover:underline')
    })

    document
      .querySelectorAll('.js-blog-filter-tag-reset')
      .forEach((element) => {
        element.classList.remove(
          'text-secondary',
          'border-b-2',
          'border-secondary'
        )
        element.classList.add('hover:underline')
      })

    event.target.classList.add(
      'text-secondary',
      'border-b-2',
      'border-secondary'
    )
    event.target.classList.remove('hover:underline')
  }

  triggerFilter() {
    const _this = this

    document.addEventListener('click', function (e) {
      if (e.target && e.target.classList.contains('js-blog-filter-tag')) {
        e.preventDefault()

        _this.renderPage(e.target.href)
        _this.setActiveState(e)
      }
    })
  }

  resetFilter() {
    const _this = this

    document.addEventListener('click', function (e) {
      if (e.target && e.target.classList.contains('js-blog-filter-tag-reset')) {
        e.preventDefault()

        _this.renderAll()
        _this.setActiveState(e)
      }
    })
  }

  triggerMore() {
    const _this = this

    document.addEventListener('click', function (e) {
      if (e.target && e.target.classList.contains('js-blog-listing-more')) {
        e.preventDefault()

        _this.renderMore(e.target.href)
      }
    })
  }

  renderMore(searchParams) {
    const sections = this.getSections()
    document
      .querySelector('.js-blog-paginate-loading')
      .classList.remove('hidden')

    sections.forEach((section) => {
      const url = `${searchParams}`
      const filterDataUrl = (element) => element.url === url

      this.filterData.some(filterDataUrl)
        ? this.renderSectionFromCache(filterDataUrl)
        : this.renderSectionFromFetch(url)
    })
  }

  renderAll() {
    const sections = this.getSections()
    document.querySelector('.js-blog-loading').classList.remove('hidden')

    sections.forEach((section) => {
      const url = `${window.location.pathname}`
      const filterDataUrl = (element) => element.url === url

      this.filterData.some(filterDataUrl)
        ? this.renderSectionFromCache(filterDataUrl)
        : this.renderSectionFromFetch(url)
    })
  }

  renderPage(searchParams) {
    const sections = this.getSections()
    document.querySelector('.js-blog-loading').classList.remove('hidden')

    sections.forEach((section) => {
      const url = `${searchParams}`
      const filterDataUrl = (element) => element.url === url

      this.filterData.some(filterDataUrl)
        ? this.renderSectionFromCache(filterDataUrl)
        : this.renderSectionFromFetch(url)
    })
  }

  renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText
        this.filterData = [...this.filterData, { html, url }]
        this.renderArticleGrid(html)
      })
      .then(() => {
        lazyInstance.update()
        document
          .querySelector('.js-blog-listing-top')
          .scrollIntoView({ behavior: 'smooth' })
      })
  }

  renderSectionFromCache(filterDataUrl, event) {
    const html = this.filterData.find(filterDataUrl).html
    this.renderArticleGrid(html)
    lazyInstance.update()
  }

  renderArticleGrid(html) {
    const innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('BlogArticleGrid').innerHTML

    document.getElementById('BlogArticleGrid').innerHTML = innerHTML

    document.querySelector('.js-blog-loading').classList.add('hidden')
  }

  getSections() {
    return [
      {
        id: 'main-blog-article-grid',
        section: document.getElementById('main-blog-article-grid').dataset.id,
      },
    ]
  }
}

customElements.define('blog-filters', BlogFilters)
