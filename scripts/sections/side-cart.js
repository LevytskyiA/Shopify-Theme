class SideCart extends HTMLElement {
  constructor() {
    super();
    this.removeId = null;
  }

  connectedCallback() {
    this.addToCart();
    this.addTriggers();
    this.checkParams();

    const self = this;
    document.querySelectorAll(".open-sidecart").forEach((el) => {
      el.addEventListener("click", () => {
        self.openCart();
      });
    });
  }

  openCart() {
    this.classList.remove("translate-x-full"); // Slide the cart in

    setTimeout(() => {
      this.querySelector(".side-cart-overlay").classList.remove("hidden");
    }, 300);
    this.renderCart();
  }

  renderCart() {
    fetch(window.Shopify.routes.root + "?sections=sidecart")
      .then((res) => res.json())
      .then((data) => {
        let html = document.createElement("div");
        html.innerHTML = data.sidecart;

        this.querySelector(".sidecart__subtotal").innerHTML =
          html.querySelector("side-cart").dataset.subtotal;

        document.getElementById("cart-count").innerText =
          html.querySelector("side-cart").dataset.count;
        if (html.querySelector("side-cart").dataset.count > 0) {
          this.querySelector(".side-cart__total--container").classList.remove(
            "hidden"
          );
          document.getElementById("cart-count").classList.remove("hidden");
        } else {
          this.querySelector(".side-cart__total--container").classList.add(
            "hidden"
          );

          document.getElementById("cart-count").classList.add("hidden");
        }

        document.getElementById("sidecart-inner").innerHTML =
          html.querySelector("#sidecart-inner").innerHTML;
        document
          .querySelector(".sidecart-items")
          ?.classList.remove("opacity-80");

        document.querySelectorAll(".sidecart__close-cart").forEach((close) => {
          close.addEventListener("click", () => {
            this.querySelector(".side-cart-overlay").classList.add("hidden");

            this.classList.add("translate-x-full");
          });
        });

        if (document.querySelector(".empty-cart-item")) {
          document
            .querySelectorAll(".empty-cart-item")
            .forEach((item) => item.classList.add("!hidden"));
          document
            .querySelectorAll(
              `.empty-cart-${localStorage.getItem("market")}-products`
            )
            .forEach((item) => item.classList.remove("!hidden"));
        }
      });
  }

  addToCart() {
    const self = this;

    this.addEventListener("click", function (e) {
      let target = e.target;

      if (target.classList.contains("sidecart__add")) {
        let productData = {
          id: target.dataset.id,
          quantity: target.dataset.quantity,
        };

        if (target.dataset.sellingPlan) {
          productData.selling_plan = target.dataset.sellingPlan;
        }

        if (
          target.classList.contains("sidecart__upsell") &&
          !target.classList.contains("sidecart__undo")
        ) {
          productData.properties = {
            _prevId: target.closest(".sidecart-item").dataset.id,
          };
          if (target.closest(".sidecart-item").dataset.sellingPlan) {
            productData.properties._selling_plan =
              target.closest(".sidecart-item").dataset.sellingPlan;
          }
        }

        document.querySelector(".sidecart-items")?.classList.add("opacity-80");

        fetch(window.Shopify.routes.root + "cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        })
          .then((response) => response.json())
          .then((data) => {
            if (target.classList.contains("sidecart__upsell")) {
              self.removeId = target.closest(".sidecart-item").dataset.id;
              self.removeItem();
            } else {
              self.renderCart();
            }
          })
          .catch((error) => {
            console.error("Error adding product to cart:", error);
          });
      }
    });
  }

  addTriggers() {
    const self = this;

    this.addEventListener("click", function (e) {
      let target = e.target;

      if (target.classList.contains("sidecart__checkout")) {
        window.location.href = "/checkout";
      }

      if (target.classList.contains("sidecart__remove")) {
        self.removeId = target.dataset.id;
        self.removeItem();
      }
      if (target.classList.contains("quantity_btn")) {
        const action = target.dataset.action;
        const productId = target.closest(".sidecart-item").dataset.id;
        const quantity = parseInt(
          target.closest(".sidecart-item").querySelector(".quantity_input")
            .value
        );

        let newQuantity;
        if (action === "increment") {
          newQuantity = quantity + 1;
        } else if (action === "decrement") {
          newQuantity = quantity - 1;
        }

        fetch(window.Shopify.routes.root + "cart/change.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: productId,
            quantity: newQuantity,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            self.renderCart();
          })
          .catch((error) => {
            console.error("Error updating cart:", error);
          });
      }
    });
  }

  removeItem() {
    const self = this;

    document.querySelector(".sidecart-items")?.classList.add("opacity-80");

    const cartItems = document.querySelectorAll(".sidecart-item");
    const remainingItems = Array.from(cartItems).filter(
      (item) => item.dataset.id !== self.removeId
    );

    if (remainingItems.length > 0) {
      fetch(window.Shopify.routes.root + "cart/change.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: self.removeId,
          quantity: 0,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          self.renderCart();
        })
        .catch((error) => {
          console.error("Error removing product from cart:", error);
        });
    } else {
      fetch(window.Shopify.routes.root + "cart/clear.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          self.renderCart();
        })
        .catch((error) => {
          console.error("Error clearing cart:", error);
        });
    }
  }

  checkParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const cart = urlParams.get("cart");

    if (cart === "open") {
      this.openCart();
    }
  }
}

customElements.define("side-cart", SideCart);
