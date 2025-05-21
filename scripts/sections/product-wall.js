import Flickity from 'flickity';
import 'flickity/css/flickity.css';

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('[js-product-wall="slider"]');
  const enableFlickity = () => {
    if (innerWidth < 1440 && slider && !slider.classList.contains('flickity-enabled')) {
      new Flickity(slider, {
        contain: true,
        prevNextButtons: false,
        pageDots: false,
        percentPosition: false,
      });
    }
  };

  enableFlickity();
  window.addEventListener('resize', enableFlickity);
});
