class MobileFilters extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {

      if (document.querySelector('#mobile-filter-open')) {
        document.querySelector('#mobile-filter-open').addEventListener('click', () => {
          this.classList.add('flex');
          this.classList.remove('hidden');
          document.querySelector('#mobile-filter-overlay').classList.add('flex');
          document.querySelector('#mobile-filter-overlay').classList.remove('hidden');
        });
      }
  
      this.addEventListener('click', (e) => {

        if (e.target.classList == this.classList || e.target.id == "mobile-filter-close") {
          this.classList.remove('flex');
          this.classList.add('hidden');
          document.querySelector('#mobile-filter-overlay').classList.remove('flex');
          document.querySelector('#mobile-filter-overlay').classList.add('hidden');

        }
    
      })
    
    }
  

  }
  
  customElements.define('mobile-filters', MobileFilters);
  