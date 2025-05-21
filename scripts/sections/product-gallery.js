import { Swiper } from 'swiper'
import { Thumbs, Pagination } from 'swiper/modules'

import 'swiper/css/bundle'

class ProductGallery extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    var ThumbnailSlider = new Swiper(
      document.querySelector('thumbnail-slider'),
      {
        loop: false,
        spaceBetween: 10,
        slidesPerView: 6,
        freeMode: true,
        direction: 'vertical',
      }
    )

    var ProductGallery = new Swiper(this, {
      loop: false,
      autoHeight: true,
      spaceBetween: 10,
      slidesPerView: 1,
      modules: [Thumbs, Pagination],
      thumbs: {
        swiper: ThumbnailSlider,
      },
      pagination: {
        el: '.swiper-pagination',
      },
    })

    document.addEventListener('changeSlider', function (e) {
      let mediaIDs = []
      ProductGallery.slides.forEach((slider) => {
        mediaIDs.push(slider.getAttribute('data-media-id'))
      })
      const url = e.detail.media_id.toString()

      const protocolRelativeUrl = url.replace(/^https?:/, '')
      //get index of slide
      ThumbnailSlider.slideTo(
        mediaIDs.indexOf(protocolRelativeUrl),
        1000,
        false
      )
      ProductGallery.slideTo(mediaIDs.indexOf(protocolRelativeUrl), 1000, false)
    })
  }
}

customElements.define('product-gallery', ProductGallery)
