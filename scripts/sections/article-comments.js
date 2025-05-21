class ArticleComments extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this.querySelector('.display-comment').addEventListener('click', () => {
      this.querySelector('.comment-form').classList.toggle('hidden')
    })
  }
}

customElements.define('article-comments', ArticleComments)
