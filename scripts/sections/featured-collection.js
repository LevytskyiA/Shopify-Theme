import { Swiper } from 'swiper'
import { Navigation, Pagination } from 'swiper/modules'

import 'swiper/css'

class FeaturedCollection extends HTMLElement {
  constructor() {
    super()
  }
  connectedCallback() {
    const swiper = new Swiper(this, {
      // Optional parameters
      slidesPerView: 1,
      freeMode: true,
      spaceBetween: 16,
      modules: [Pagination, Navigation],
      loop: false,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        768: {
          slidesPerView: 4,
          spaceBetween: 0,
          loop: true,
        },
      },
    })
  }
}
customElements.define('featured-collection', FeaturedCollection)
