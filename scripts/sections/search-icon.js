class SearchIcon extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this.addEventListener('click', (e) => {
      console.log('opened')
      e.preventDefault()
      if (document.querySelector('search-form').classList.contains('hidden')) {
        document.querySelector('search-form').classList.remove('hidden')
      } else {
        document.querySelector('search-form').classList.add('hidden')
      }
    })
  }
}

customElements.define('search-icon', SearchIcon)
