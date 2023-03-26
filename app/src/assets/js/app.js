// first commit
const dd = document.querySelector('.dropdown-wrapper');
const links = document.querySelectorAll('.dropdown-wrapper__list a');
const span = document.querySelector('.dropdown-wrapper__header');

dd.addEventListener('click', function() {
  this.classList.toggle('is-active');
});

links.forEach((element) => {
  element.addEventListener('click', function(evt) {
    span.innerHTML = evt.currentTarget.textContent;
  })
})
