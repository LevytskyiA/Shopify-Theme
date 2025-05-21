/**
 * Represents a custom HTML element for a variant button.
 * Initially loads the variant options based on the variant data passed in from the component
 * When the variant button is clicked, it updates the variant options based on the selected variant
 * It also updates the price, gallery image, and sets the data-variant attribute.
 * This is used in the product template.
 * @class VariantButton
 * @extends HTMLElement
 */

class VariantButton extends HTMLElement {
  /**
   * Constructs a new instance of the VariantButton class.
   */
  constructor() {
    super();

    /*-------------------------- INITIALIZE DATA -----------------------------------*/

    const parseAttribute = (attribute) => {
      return JSON.parse(
        attribute
          .replace(/\/quote\//g, '\\"')
          .replace(/\/apos\//g, "\\'")
          .replace(/'/g, '"')
      );
    };

    // Get the primary product info
    this.productInfo = parseAttribute(this.getAttribute("js-product"));
    // Get the variants
    this.variants = parseAttribute(this.getAttribute("js-variants"));
    this.cta = document.querySelector('.product__cta');

    // Get the first available variant, this is required to determine which option is selected on default load
    this.firstAvailableVariant = parseAttribute(
      this.getAttribute("js-first-available-variant")
    );

    //Initialize on variant change event when the variant button is clicked
    this.addEventListener("click", this.onVariantChange);
  }
  async connectedCallback() {
    try {
      //Render the variant options on load
      this.renderOptions();
    } catch (err) {
      console.error("Error fetching product data:", err);
    }
  }

  /**
   * Renders the options for the variant button.
   */
  renderOptions() {
    let html = `
        <div class="flex flex-col">`;

    //based on the first selected option, load the variants
    this.selectedVariants = this.variants.filter((variant) => {
      return variant.option1 == this.firstAvailableVariant[0].option1;
    });

    //If there's atleast 1 or more set of product options then execute the logic below
    if (
      this.productInfo.options.length >= 1 &&
      this.productInfo.options[0].values.length > 1
    ) {
      //render first drop down
      html += `<fieldset class="flex flex-wrap gap-5" id="${this.productInfo.options[0].name}">`;

      //if only one set of options, render the first level of variants directly, if variant is sold then disable option
      if (this.productInfo.options.length == 1) {
        this.variants.forEach((variant) => {
          //if first available variant is the same as the variant, then check it
          html += this.renderLabel(
            variant.title,
            "select-option1",
            variant.available,
            this.productInfo.options[0].name == "Color",
            this.firstAvailableVariant[0].option1 == variant.title
          );
        });
      } else {
        //if variant has more than one set of options, then don't disable the first level of options
        this.productInfo.options[0].values.forEach((value) => {
          html += this.renderLabel(
            value,
            "select-option1",
            true,
            this.productInfo.options[0].name == "Color",
            this.firstAvailableVariant[0].option1 == value
          );
        });
      }
      html += `</fieldset>`;
    }

    if (this.productInfo.options.length > 1) {
      //render second drop down
      html += `<label for="${this.productInfo.options[1].name}" class="text-sm font-bold pt-6 mr-[5px] mb-[5px] text-textPrimary">${this.productInfo.options[1].name}</label>`;
      html += `<fieldset class="flex flex-wrap" id="${this.productInfo.options[1].name}">`;
      //loads the option based on the first selected variant

      if (this.productInfo.options.length == 2) {
        // render only unique variants
        this.returnUniqueVariants(2).forEach((variant) => {
          if (variant.option2 != null) {
            // check if variant already exists in array
            html += this.renderLabel(
              variant.option2,
              "select-option2",
              variant.available,
              this.productInfo.options[1].name == "Color",
              this.firstAvailableVariant[1].option2 == variant.option2
            );
          }
        });
      } else {
        //if variant has more than two set of options, then don't disable the second level of options
        this.returnUniqueVariants(2).forEach((variant) => {
          if (variant.option2 != null) {
            // check if variant already exists in array
            html += this.renderLabel(
              variant.option2,
              "select-option2",
              true,
              this.productInfo.options[1].name == "Color",
              this.firstAvailableVariant[1].option2 == variant.option2
            );
          }
        });
      }

      html += `</fieldset>`;
    }

    if (this.productInfo.options.length > 2) {
      //render third drop down

      html += `<label for="${this.productInfo.options[2].name}" class="text-sm font-bold pt-6 mb-2 text-textPrimary">${this.productInfo.options[2].name}</label>`;
      html += `<fieldset class="flex flex-wrap" id="${this.productInfo.options[2].name}">`;
      //loads the option based on the second selected variant

      this.returnUniqueVariants(3).forEach((variant) => {
        if (variant.option3 != null) {
          html += this.renderLabel(
            variant.option3,
            "select-option3",
            variant.available,
            this.productInfo.options[2].name == "Color",
            this.firstAvailableVariant[2].option3 == variant.option3
          );
        }
      });
      html += `</fieldset>`;
    }

    html += `</div>`;
    if (this.productInfo.available == false && this.cta) {
      this.cta.disabled = true;
      this.cta.innerHTML = `Sold Out`;
    }

    this.insertAdjacentHTML("beforeend", html);
  }

  /**
   * Handles the change event for the variant selection.
   * @param {Event} e - The change event object.
   */
  onVariantChange(e) {
    this.fieldsets = Array.from(this.querySelectorAll("fieldset"));
    this.options = this.fieldsets.map((fieldset) => {
      const checkedRadio = Array.from(fieldset.querySelectorAll("input")).find(
        (radio) => radio.checked
      );
      return checkedRadio ? checkedRadio.value : null;
    });
    /*--------------------------Event ---------------------------------------*/
    //if the change is on the first set of options
    this.onFirstLevelOfOptionsChange(e);

    /*--------------------------Event ---------------------------------------*/
    //if the change is on the second set of options
    this.onSecondLevelOfOptionsChange(e);

    /*--------------------------Event ---------------------------------------*/
    //get current variant from option changes
    this.getCurrentVariant();
  }

  /**
   * Handles the change event on the first level of options.
   *
   * @param {Event} e - The event object.
   */
  onFirstLevelOfOptionsChange(e) {
    //if the change is on the first select dropdown
    if (e.target.name == "select-option1") {
      //only works if variant.option2 is available
      let options = this.fieldsets[1] ? this.fieldsets[1] : null;
      //reset options on update
      this.selectedVariants = this.variants.filter((variant) => {
        return variant.option1 == this.options[0];
      });

      if (this.productInfo.options.length > 1) {
        let html = "";
        //assign second set of options

        //if there are three levels of options, do not disable any of the second level options
        if (this.productInfo.options.length > 2) {
          this.returnUniqueVariants(2).forEach((variant) => {
            html += this.renderLabel(
              variant.option2,
              "select-option2",
              true,
              this.productInfo.options[1].name == "Color",
              this.options[1] == variant.option2
            );
          });
        } else {
          //otherwise, disable the second level options if the variant is not available
          this.returnUniqueVariants(2).forEach((variant) => {
            html += this.renderLabel(
              variant.option2,
              "select-option2",
              variant.available,
              this.productInfo.options[1].name == "Color",
              this.options[1] == variant.option2
            );
          });
        }

        options.innerHTML = "";

        options.insertAdjacentHTML("beforeend", html);
      }

      if (this.productInfo.options.length > 2) {
        //assign third set of options
        let options2 = this.fieldsets[2] ? this.fieldsets[2] : null;

        let html = "";
        this.selectedVariants = this.variants.filter((variant) => {
          return (
            variant.option2 == this.options[1] &&
            variant.option1 == this.options[0]
          );
        });
        this.returnUniqueVariants(3).forEach((variant) => {
          html += this.renderLabel(
            variant.option3,
            "select-option3",
            variant.available,
            this.productInfo.options[2].name == "Color",
            this.options[2] == variant.option3
          );

          options2.innerHTML = "";

          options2.insertAdjacentHTML("beforeend", html);
        });
      }
    }
  }

  /**
   * Handles the change event on the second level of options.
   * @param {Event} e - The event object.
   */
  onSecondLevelOfOptionsChange(e) {
    if (e.target.name == "select-option2") {
      //only works if variant.option2 is available
      let options = this.fieldsets[2] ? this.fieldsets[2] : null;
      //reset options on update
      this.selectedVariants = this.variants.filter((variant) => {
        return (
          variant.option2 == this.options[1] &&
          variant.option1 == this.options[0]
        );
      });

      //assign third set of options
      if (this.productInfo.options.length > 2) {
        let html = "";

        this.returnUniqueVariants(3).forEach((variant) => {
          if (variant.option3 != null) {
            html += this.renderLabel(
              variant.option3,
              "select-option3",
              variant.available,
              this.productInfo.options[2].name == "Color",
              this.options[2] == variant.option3
            );
          }
          options.innerHTML = "";

          options.insertAdjacentHTML("beforeend", html);
        });
      }
    }
  }

  /**
   * Retrieves the current variant based on the selected options.
   * If the current variant doesn't exist, it updates the product cta and disables it.
   * If the current variant is available, it updates the product cta and enables it.
   * It also updates the price, gallery image, and sets the data-variant attribute.
   */
  getCurrentVariant() {
    //get current variant from selected options
    this.currentVariant = this.variants.find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    });

    //bug function, if current variant doesn't exist, but both options are selected then rerun
    if (!this.currentVariant) {
      if (this.cta) {
        this.cta.innerHTML = `<span class="text-base font-medium font-poppinsMedium">Select Option</span>`;
        this.cta.classList.add("cursor-");
        this.cta.disabled = true;
      }
    }

    if (this.currentVariant) {
      if (this.currentVariant.available === false && this.cta) {
        this.cta.disabled = true;
        this.cta.innerHTML = `<span class="text-base font-medium">Sold Out
      </span>`;
      } else if (this.cta) {
        //update price on variant change
        this.cta.disabled = false;
        this.cta.innerHTML = `<span class="text-base font-medium">Add to cart
    </span>`;

        document.querySelector("buy-button").id = this.currentVariant.id;
        this.setAttribute("data-variant", this.currentVariant.id);
        if (this.currentVariant?.price) {
          document.querySelector(".product__main-price").innerText = `${
            this.currentVariant?.symbol
          }${(this.currentVariant?.price / 100).toFixed(2)} ${
            this.currentVariant?.currency
          }`;
        }
        //update gallery image on variant change
        if (this.currentVariant.featured_image != null) {
          const changeSlider = new CustomEvent("changeSlider", {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: {
              media_id: this.currentVariant.featured_image,
            },
          });

          document.dispatchEvent(changeSlider);
        }

        if (this.currentVariant.featured_image != null) {
          this.updateImage(this.currentVariant);
        }
      }
    }
  }

  /**
   * Update product card image depends on selected swatch
   * @param {Object} currentVariant - Variant object.
   */
  updateImage(currentVariant) {
    const card = this.closest('[js-product-card="card"]');
    const featuredImage = card.querySelector('[js-product-card="featured"]');
    const secondaryImage = card.querySelector('[js-product-card="secondary"]');
    featuredImage.style.transition = 'opacity 0.3s ease';
    secondaryImage.style.transition = 'opacity 0.3s ease';

    const onFadeOut = () => {
      featuredImage.removeEventListener('transitionend', onFadeOut);
      featuredImage.src = currentVariant.featured_image;
      featuredImage.setAttribute('srcset', '');
      featuredImage.setAttribute('data-media-id', currentVariant.featured_image.id);

      if (currentVariant.secondary_image) {
        secondaryImage.src = currentVariant.secondary_image;
        secondaryImage.setAttribute('srcset', '');
        secondaryImage.setAttribute('data-media-id', currentVariant.secondary_image.id);
      }
      featuredImage.style.opacity = 1;
      secondaryImage.style.opacity = 1;
    };

    featuredImage.addEventListener('transitionend', onFadeOut);
    featuredImage.style.opacity = 0;
    secondaryImage.style.opacity = 0;
  }

  /**
   * Returns an array of unique variants based on the specified option index.
   * @param {number} optionIndex - The index of the option to filter variants by.
   * @returns {Array} - An array of unique variants.
   */
  //This function is to return unique variant options, so that the options are not duplicated
  returnUniqueVariants(optionIndex) {
    const uniqueVariants = [];
    this.selectedVariants.forEach((variant) => {
      if (variant[`option${optionIndex}`] != null) {
        const exists = uniqueVariants.some(
          (v) => v[`option${optionIndex}`] === variant[`option${optionIndex}`]
        );
        if (!exists) {
          uniqueVariants.push(variant);
        }
      }
    });
    return uniqueVariants;
  }

  /**
   * Renders the label for a variant button.
   *
   * @param {string} variantOption - The variant option.
   * @param {string} selectOption - The select option.
   * @param {boolean} isInStock - Indicates if the variant is in stock.
   * @param {boolean} isColor - Indicates if the variant is a color.
   * @param {boolean} checked - Indicates if the variant is checked.
   * @returns {string} The rendered label HTML.
   */
  //This function renders the button input and label
  renderLabel(variantOption, selectOption, isInStock, isColor, checked) {
    let soldOutDisabled = isInStock == false ? "disabled" : "";
    let soldOutStyle = isInStock == false ? "sold-out" : "";
    let isChecked = checked == true ? "checked" : "";
    let color = variantOption.toLowerCase();
    let swatchStyle = isColor
      ? `swatch swatch-${variantOption}`
      : `button-primary button-swatch mr-2`;
    let labelContent = "";
    if (isColor && isInStock == false) {
      labelContent = `<div  class="absolute inset-0 flex items-center"><div class="w-full border-t-2 border-black transform rotate-45 h-[2px] bg-[#E6E6E6]" style="transform: rotate(135deg);"></div></div>`;
    } else if (isColor && isInStock == true) {
      labelContent = "";
    } else {
      labelContent = variantOption;
    }

    return `
      <li class="flex">
        <input ${isChecked} ${soldOutDisabled} class="product__variant--button hidden" name="${selectOption}" id="option-${variantOption}" type="radio" value="${variantOption}">
        <label
          class="${swatchStyle} ${soldOutStyle}"
          for="option-${variantOption}"
          style="--background-color: ${color};"
        >
          <span class="hidden">${variantOption}</span>
        </label>
      </li>
    `;
  }
}
customElements.define("variant-button", VariantButton);
