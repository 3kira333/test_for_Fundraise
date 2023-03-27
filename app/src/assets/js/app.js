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
$(function() {
  $('.donation-id__value').click(function() {
    var $textIcon = $(this).find(".donation-id__text");
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($($textIcon).text()).select();
    document.execCommand("copy");
    $temp.remove();
    event.preventDefault();
    
    $textIcon.html();    
    $(this).append('<span class="hint">Тест скопирован!<span>');  
    if (document.execCommand('copy')) {
      $(this).find('.hint').fadeOut(1000);
    }  
  });

});

