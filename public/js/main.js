jQuery(function ($) {
  "use strict";

  /* ----------------------------------------------------------- */
  /*  Header Fixed on Scroll
  /* ----------------------------------------------------------- */
  $(window).on('scroll', function () {

    if ($(window).scrollTop() > 40) {

      $('.navbar').addClass('main-nav-fixed animated fadeInDown');
    }
    else {

      $('.navbar').removeClass('main-nav-fixed animated fadeInDown');

    }

  });
  /* -------------- End -------------------------------*/

  /* ----------------------------------------------------------- */
  /*  Scroll Top
  /* ----------------------------------------------------------- */
  $(window).scroll(function () {
    // scroll to top visible function
    if ($(window).scrollTop() > $(window).height() / 2) {
      $('.scroll_to_top').fadeIn();
    }
    else {
      $('.scroll_to_top').fadeOut();
    }
  });
  $('.scroll_to_top').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 800);
  });
  /* -------------- End -------------------------------*/

  // Initialize Swiper 
  var swiper = new Swiper(".mySwiper", {
    autoplay: false,
    pagination: {
      el: ".swiper-pagination",
    },
  });
  // End

  // Search Filter Initialization
  document.querySelectorAll('.liveToastBtn').forEach(button => {
    const toastEl = document.getElementById('liveToast');
    if (toastEl) {
      const toastInstance = bootstrap.Toast.getOrCreateInstance(toastEl, { autohide: false });
      button.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submit
        toastInstance.show();
      });
    }
  });
  // End

 
 
  document.addEventListener('DOMContentLoaded', function () {
      const toggleBtn = document.querySelector('.custom-dropdown-toggle');
      const dropdownMenu = document.querySelector('.custom-dropdown-menu');

      if (toggleBtn && dropdownMenu) {
          toggleBtn.addEventListener('click', function (e) {
              e.stopPropagation();
              dropdownMenu.classList.toggle('show');
          });

          document.addEventListener('click', function (e) {
              if (!dropdownMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
                  dropdownMenu.classList.remove('show');
              }
          });
      }
  });


});