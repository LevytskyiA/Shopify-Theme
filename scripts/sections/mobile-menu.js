class MobileMenu extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    document
      .querySelector('#mobile-menu-button')
      .addEventListener('click', () => {
        this.classList.add('left-0')
        this.classList.remove('-left-full')
        this.querySelector('.mobile-menu-inner').classList.add('block')
        this.querySelector('.mobile-menu-inner').classList.remove('hidden')
        document.querySelector('body').classList.add('overflow-hidden')
        document.querySelector('#mobile-menu-overlay').classList.add('flex')
        document
          .querySelector('#mobile-menu-overlay')
          .classList.remove('hidden')
      })

    this.addEventListener('click', (e) => {
      if (
        e.target.classList == this.classList ||
        e.target.id == 'mobile-menu-button-close'
      ) {
        this.classList.remove('left-0')
        this.classList.add('-left-full')
        document.querySelector('body').classList.remove('overflow-hidden')
        setTimeout(() => {
          this.querySelector('.mobile-menu-inner').classList.add('hidden')
          this.querySelector('.mobile-menu-inner').classList.remove('block')
        }, 200)
        document.querySelector('#mobile-menu-overlay').classList.remove('flex')
        document.querySelector('#mobile-menu-overlay').classList.add('hidden')
      }
    })
  }
}

customElements.define('mobile-menu', MobileMenu)
