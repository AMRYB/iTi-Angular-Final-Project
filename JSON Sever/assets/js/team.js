const cards = document.querySelectorAll('.card')
const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
if (!mq.matches && 'IntersectionObserver' in window) {
   const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
         if (e.isIntersecting) {
            e.target.classList.add('in');
            obs.unobserve(e.target)
         }
      })
   }, {
      threshold: .2
   })
   cards.forEach(c => io.observe(c))
} else {
   cards.forEach(c => c.classList.add('in'))
}