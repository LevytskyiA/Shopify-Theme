class SearchForm extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this.addEventListener('click', (e) => {
      e.preventDefault()

      if (e.target.classList.contains('bg-slate-900/25')) {
        this.classList.add('hidden')
      }
    })
  }
}

customElements.define('search-form', SearchForm)
