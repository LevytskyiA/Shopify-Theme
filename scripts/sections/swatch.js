class ColorSwatches extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const card = this.closest('[js-product-card="card"]');
    if (!card) return;

    const script = card.querySelector('script[type="application/ld+json"]');
    if (!script) return;

    let variants = [];
    try {
      const jsonText = script.textContent
        .replace(/&quot;/g, '"')
        .replace(/'/g, '"');

      variants = JSON.parse(`[${jsonText}]`);
    } catch (err) {
      console.warn('Failed to parse variant JSON:', err);
      return;
    }

    this.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener('change', () => {
        const selectedColor = input.value;
        const selectedVariant = variants.find((variant) =>
          variant.options.includes(selectedColor)
        );
        if (selectedVariant) {
          this.updateImage(card, selectedVariant);
        }
      });
    });
  }

  /**
   * Update product card image based on colour swatch select
   * @param {Object} card - Card object
   * @param {Object} currentVariant - Current variant data.
   */
  updateImage(card, currentVariant) {
    const featuredImage = card.querySelector('[js-product-card="featured"]');
    const secondaryImage = card.querySelector('[js-product-card="secondary"]');

    if (!featuredImage || !secondaryImage) return;

    [featuredImage, secondaryImage].forEach(img => {
      img.style.transition = 'opacity 0.3s ease';
    });

    const onFadeOut = () => {
      featuredImage.removeEventListener('transitionend', onFadeOut);
      featuredImage.src = currentVariant.featured_image;
      featuredImage.setAttribute('srcset', '');
      featuredImage.setAttribute('data-media-id', currentVariant.featured_image);

      if (currentVariant.secondary_image) {
        secondaryImage.src = currentVariant.secondary_image;
        secondaryImage.setAttribute('srcset', '');
        secondaryImage.setAttribute('data-media-id', currentVariant.secondary_image);
      }

      featuredImage.style.opacity = 1;
      secondaryImage.style.opacity = 1;
    };

    featuredImage.addEventListener('transitionend', onFadeOut);
    [featuredImage, secondaryImage].forEach(img => {
      img.style.opacity = 0;
    });
  }
}

customElements.define('color-swatches', ColorSwatches);
