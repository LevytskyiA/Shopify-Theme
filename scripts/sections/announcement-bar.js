import { Swiper } from 'swiper';
import 'swiper/css';

class AnnouncementBar extends HTMLElement {
    constructor() {
        super();
        console.log('Hello World');
    }
    connectedCallback() {
        const swiper = new Swiper(this, {
            // Optional parameters
            centeredSlides: true,
            autoplay: {
              delay: 5000,
            },
        });
    }
}
customElements.define('announcement-bar',  AnnouncementBar);
