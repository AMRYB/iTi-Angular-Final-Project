const center = document.querySelector('.center');
const lefty = document.querySelector('.lefty');
const righty = document.querySelector('.righty');
const start = () => center.classList.add('animate');
if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', start);
} else {
   start();
}
center.addEventListener('animationend', () => {
   lefty.classList.add('animate');
});
lefty.addEventListener('animationend', () => {
   righty.classList.add('animate');
});
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
if (mq.matches) {
   [center, righty, lefty].forEach(el => {
      el.style.transition = 'none';
      el.style.animation = 'none';
      el.style.opacity = 1;
      el.style.transform = 'none';
   });
}