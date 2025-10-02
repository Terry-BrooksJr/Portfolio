/* global gsap, ScrollTrigger, imagesLoaded, Flip, Power2, Power3, Power4, Linear, Elastic, ClapatSlider */
/* eslint-env browser, jquery */

jQuery(function ($) {
  'use strict';

  // Cache commonly used selectors
  const $body = $('body');
  const $ball = $('#ball');
  const $ballLoader = $('#ball-loader');
  const $headerContainer = $('#header-container');
  const $main = $('#main');
  const $footer = $('footer');

  // Store cleanup functions
  const cleanupFunctions = [];

  $(document).ready(function() {
    HeightTitles();
    PageLoad();
    ScrollEffects();
    Sliders();
    FirstLoad();
    PageLoadActions();
    FitThumbScreenGSAP();
    ShowcaseOverlapping();
    ShowcasePortfolio();
    ShowcaseGallery();
    FitThumbScreenWEBGL();
    Shortcodes();
    Core();
    JustifiedGrid();
    Lightbox();
    PlayVideo();
    UpdateCopyright();
  });

  /*--------------------------------------------------
  Function CustomFunction - Template
  ---------------------------------------------------*/
  const CustomFunction = () => {
    // Add here your custom js code
  };

  /*--------------------------------------------------
  Function Copyright Updater
  ---------------------------------------------------*/
  const UpdateCopyright = () => {
    const currentYear = new Date().getFullYear();
    const $copyrightYear = $('#copyright-year');
    $copyrightYear.text(currentYear);
  };

  /*--------------------------------------------------
  Function Cleanup Before Ajax
  ---------------------------------------------------*/
  const CleanupBeforeAjax = () => {
    // Reset all scroll triggers
    const triggers = ScrollTrigger.getAll();
    triggers.forEach(trigger => {
      trigger.kill();
    });

    // Cleanup sliders
    if (ClapatSlider?.instances) {
      ClapatSlider.instances.forEach(slider => slider.off());
      ClapatSlider.instances = [];
    }

    // Run all registered cleanup functions
    cleanupFunctions.forEach(cleanup => cleanup());
    cleanupFunctions.length = 0;
  };

  /*--------------------------------------------------
  Function Height Titles
  ---------------------------------------------------*/
  const HeightTitles = () => {
    function generateSpans(selector) {
      const elements = document.querySelectorAll(selector);

      elements.forEach((element) => {
        const text = element.textContent.trim();
        const words = text.split(' ');
        let finalHTML = '';

        words.forEach((word, index) => {
          finalHTML += '<div>';
          for (let i = 0; i < word.length; i++) {
            finalHTML += `<span>${word[i]}</span>`;
          }
          finalHTML += '</div>';

          if (index !== words.length - 1) {
            finalHTML += '<div><span></span></div>';
          }
        });

        element.innerHTML = finalHTML;
      });
    }

    generateSpans('.height-title .hero-title');
    generateSpans('.height-title .next-hero-title');
    generateSpans('.height-title .slide-hero-title');
    generateSpans('.fixed-title');

    function applyHoverEffect(selector) {
      const spans = document.querySelectorAll(selector);

      spans.forEach((span) => {
        span.originalScaleY = 1;
        
        const handleMouseMove = (e) => {
          const hoveredSpan = e.target;
          const rect = hoveredSpan.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const scaleFactor = 0.2;
          const center = rect.width / 2;
          
          let scale;
          if (mouseX < center) {
            scale = (scaleFactor + 1) + (scaleFactor * mouseX) / center;
          } else {
            scale = (scaleFactor + 1) + (scaleFactor * (rect.width - mouseX)) / center;
          }

          gsap.to(hoveredSpan, {
            scaleY: scale,
            duration: 0.5,
            ease: 'power4.out',
          });

          const spansArray = Array.from(spans);
          const hoveredIndex = spansArray.indexOf(hoveredSpan);
          const prevSpan = spansArray[hoveredIndex - 1];
          const nextSpan = spansArray[hoveredIndex + 1];

          if (prevSpan) {
            let distanceFromMouse = Math.abs(rect.left - e.clientX);
            distanceFromMouse = Math.min(distanceFromMouse, center);
            const scalePrev = 1 + (scaleFactor * (center - distanceFromMouse)) / center;
            gsap.to(prevSpan, {
              scaleY: scalePrev,
              duration: 0.5,
              ease: 'power4.out',
            });
          }

          if (nextSpan) {
            let distanceFromMouse = Math.abs(rect.right - e.clientX);
            distanceFromMouse = Math.min(distanceFromMouse, center);
            const scaleNext = 1 + (scaleFactor * (center - distanceFromMouse)) / center;
            gsap.to(nextSpan, {
              scaleY: scaleNext,
              duration: 0.5,
              ease: 'power4.out',
            });
          }
        };

        const handleMouseLeave = () => {
          spans.forEach((span) => {
            gsap.to(span, {
              scaleY: span.originalScaleY,
              duration: 0.5,
              ease: 'power4.out',
            });
          });
        };

        span.addEventListener('mousemove', handleMouseMove);
        span.addEventListener('mouseleave', handleMouseLeave);

        // Store cleanup
        cleanupFunctions.push(() => {
          span.removeEventListener('mousemove', handleMouseMove);
          span.removeEventListener('mouseleave', handleMouseLeave);
        });
      });
    }

    applyHoverEffect('.height-title .hero-title span');
    applyHoverEffect('.height-title .next-hero-title span');
  };

  /*--------------------------------------------------
  Function Page Load
  ---------------------------------------------------*/
  function PageLoad() {
    gsap.set($('.menu-timeline .before-span'), {y: 120, opacity: 0});

    // Page Navigation Events with proper cleanup
    const handlePreloaderEnter = function() {
      const $this = $(this);
      gsap.to($ball, {
        duration: 0.3, 
        borderWidth: '2px', 
        scale: 1.4, 
        borderColor: 'rgba(255,255,255,0)', 
        backgroundColor: 'rgba(255,255,255,0.1)'
      });
      gsap.to($ballLoader, {duration: 0.2, borderWidth: '2px', top: 2, left: 2});
      $ball.addClass('with-blur');
      $ball.append('<p class="center-first">' + $this.data('centerline') + '</p>');
    };

    const handlePreloaderLeave = function() {
      gsap.to($ball, {
        duration: 0.2, 
        borderWidth: '4px', 
        scale: 0.5, 
        borderColor: '#999999', 
        backgroundColor: 'transparent'
      });
      gsap.to($ballLoader, {duration: 0.2, borderWidth: '4px', top: 0, left: 0});
      $ball.removeClass('with-blur');
      $ball.find('p').remove();
    };

    const $preloaderWrap = $('.preloader-wrap');
    $preloaderWrap.on('mouseenter', handlePreloaderEnter);
    $preloaderWrap.on('mouseleave', handlePreloaderLeave);

    // Store cleanup
    cleanupFunctions.push(() => {
      $preloaderWrap.off('mouseenter', handlePreloaderEnter);
      $preloaderWrap.off('mouseleave', handlePreloaderLeave);
    });

    $body.removeClass('hidden hidden-ball');
    gsap.to($headerContainer, {duration: 0.5, opacity: 1, delay: 0.2, ease: Power2.easeOut});

    function initOnFirstLoad() {
      imagesLoaded('body', function() {
        gsap.to($ball, {
          duration: 0.2, 
          borderWidth: '4px', 
          scale: 0.5, 
          borderColor: '#999999', 
          backgroundColor: 'transparent'
        });
        gsap.to($ballLoader, {duration: 0.2, borderWidth: '4px', top: 0, left: 0});
        $ball.find('p').remove();
        
        const trackbarWidth = $('.trackbar').width();
        const percentageWidth = $('.percentage-wrapper').width();
        
        gsap.to($('.percentage-wrapper'), {
          duration: 0.7, 
          x: trackbarWidth * 0.5 - percentageWidth * 0.5, 
          delay: 0.3, 
          ease: Power4.easeOut
        });
        gsap.to($('.percentage'), {duration: 0.7, opacity: 0, y: -100, delay: 1, ease: Power4.easeInOut});
        gsap.to($('.percentage-intro'), {duration: 0.5, opacity: 0, delay: 0, ease: Power4.easeInOut});
        gsap.to($('.preloader-intro span'), {duration: 0.7, opacity: 0, xPercent: -101, delay: 0.3, ease: Power4.easeOut});
        gsap.to($('.trackbar'), {duration: 0.7, clipPath: 'inset(0% 0%)', delay: 0.3, ease: Power3.easeOut});
        gsap.to($('.preloader-wrap'), {duration: 0.3, opacity: 0, delay: 1, ease: Power2.easeOut});
        gsap.set($('.preloader-wrap'), {visibility: 'hidden', delay: 1.3, yPercent: -101});

        setTimeout(() => {
          $ball.removeClass('with-blur');
          gsap.to($('.header-middle, #footer-container'), {duration: 1, opacity: 1, delay: 0, ease: Power2.easeOut});

          // Safe video playback
          if ($('.hero-video-wrapper').length > 0) {
            $('#hero-image-wrapper').find('video').each(function() {
              try {
                this.play().catch(err => console.warn('Video autoplay failed:', err));
              } catch (e) {
                console.warn('Video playback error:', e);
              }
            });
            gsap.to($('.hero-video-wrapper'), {duration: 0.2, opacity: 1, delay: 0, ease: Power2.easeOut});
          }

          gsap.to($main, {duration: 0, opacity: 1, delay: 0, ease: Power2.easeOut});

          // Handle hero animations...
          if ($('#hero').hasClass('has-image')) {
            gsap.set($('#hero-bg-image'), {scale: 1.1, opacity: 0});
            gsap.set($('#hero-caption .hero-title span'), {y: 120, opacity: 0});
            gsap.set($('#hero-caption .hero-subtitle span'), {y: 30, opacity: 0});

            gsap.to($('#hero-bg-image'), {duration: 1, scale: 1, opacity: 1, delay: 0.2, ease: Power2.easeOut});

            if ($('#hero-caption').hasClass('height-title')) {
              const spanLetters = document.querySelectorAll('#hero-caption .hero-title.caption-timeline span');
              gsap.set(spanLetters, {scaleY: 0.3, opacity: 0, y: 0});
              
              const shuffledSpans = Array.from(spanLetters).sort(() => Math.random() - 0.5);
              const spanLettersPlay = gsap.timeline({delay: 0.8});

              shuffledSpans.forEach((span, index) => {
                spanLettersPlay.to(span, {
                  duration: 0.7,
                  scaleY: 1,
                  y: 0,
                  opacity: 1,
                  ease: Power3.easeOut,
                }, index * 0.05);
              });

              gsap.to('#hero-caption .hero-subtitle.caption-timeline span', {
                duration: 0.7, 
                y: 0, 
                opacity: 1, 
                stagger: 0.1, 
                delay: 1, 
                ease: Power3.easeOut, 
                onComplete: function() {
                  gsap.to($('.hero-footer-left, .hero-footer-right'), {
                    duration: 1, 
                    y: 0, 
                    opacity: 1, 
                    delay: 0, 
                    ease: Power2.easeOut
                  });
                  gsap.to($('#main-page-content, #page-nav'), {
                    duration: 0.4, 
                    opacity: 1, 
                    delay: 0, 
                    ease: Power2.easeOut
                  });
                }
              });
            } else {
              gsap.to($('#hero-caption .caption-timeline span'), {
                duration: 0.7, 
                y: 0, 
                opacity: 1, 
                stagger: 0.1, 
                delay: 0.7, 
                ease: Power3.easeOut, 
                onComplete: function() {
                  gsap.to($('.hero-footer-left, .hero-footer-right'), {
                    duration: 1, 
                    y: 0, 
                    opacity: 1, 
                    delay: 0, 
                    ease: Power2.easeOut
                  });
                  gsap.to($('#main-page-content, #page-nav'), {
                    duration: 0.4, 
                    opacity: 1, 
                    delay: 0, 
                    ease: Power2.easeOut
                  });
                }
              });
            }
          }

          $body.addClass('header-visible');
        }, 800);
      });
    }

    if (!$body.hasClass('disable-ajaxload')) {
      const width = 100;
      const time = 1000;

      $('.loadbar').animate({width: width + '%'}, time);

      const PercentageID = $('#precent');
      const start = 0;
      const end = 100;
      const duration = time;
      
      animateValue(PercentageID, start, end, duration);

      function animateValue(id, start, end, duration) {
        const range = end - start;
        let current = start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        const $obj = $(id);

        const timer = setInterval(() => {
          current += increment;
          $obj.text(current);
          if (current === end) {
            clearInterval(timer);
          }
        }, stepTime);
      }

      setTimeout(() => {
        initOnFirstLoad();
      }, time);
    } else {
      initOnFirstLoad();
    }
  }

  /*--------------------------------------------------
  Page Load Actions
  ---------------------------------------------------*/
  function PageLoadActions() {
    if (!isMobile()) {
      const handlePageTitleEnter = function() {
        const $this = $(this);
        gsap.to($ball, {
          duration: 0.3, 
          borderWidth: '2px', 
          scale: 1.4, 
          borderColor: 'rgba(255,255,255,0)', 
          backgroundColor: 'rgba(128,128,128,0.5)'
        });
        gsap.to($ballLoader, {duration: 0.2, borderWidth: '2px', top: 2, left: 2});
        $ball.addClass('with-blur');
        $ball.append('<p class="center-first">' + $this.data('centerline') + '</p>');
      };

      const handlePageTitleLeave = function() {
        gsap.to($ball, {
          duration: 0.2, 
          borderWidth: '4px', 
          scale: 0.5, 
          borderColor: '#999999', 
          backgroundColor: 'transparent'
        });
        gsap.to($ballLoader, {duration: 0.2, borderWidth: '4px', top: 0, left: 0});
        $ball.removeClass('with-blur');
        $ball.find('p').remove();
      };

      const $pageTitle = $('#page-nav .page-title');
      $pageTitle.on('mouseenter', handlePageTitleEnter);
      $pageTitle.on('mouseleave', handlePageTitleLeave);

      cleanupFunctions.push(() => {
        $pageTitle.off('mouseenter', handlePageTitleEnter);
        $pageTitle.off('mouseleave', handlePageTitleLeave);
      });
    }

    // Rest of PageLoadActions...
  }

  /*--------------------------------------------------
  Function Lazy Load
  ---------------------------------------------------*/
  function LazyLoad() {
    imagesLoaded('body', function() {
      $body.removeClass('loading hidden scale-up scale-none');
      gsap.to($('#header-container, .header-middle'), {duration: 1, opacity: 1, ease: Power2.easeOut});
    });

    gsap.to($main, {duration: 0.3, opacity: 1, delay: 0, ease: Power2.easeOut});
    gsap.to($('#footer-container'), {duration: 1, opacity: 1, delay: 0.2, ease: Power2.easeOut});

    // Safe video playback in load-project-thumb mode
    if ($('.load-project-thumb').length > 0) {
      imagesLoaded('#hero-image-wrapper', function() {
        if (isMobile()) {
          $('#hero-image-wrapper').find('video').each(function() {
            try {
              this.play().catch(err => console.warn('Video autoplay failed:', err));
            } catch (e) {
              console.warn('Video playback error:', e);
            }
          });
        }
        
        setTimeout(() => {
          $('#app.active').remove();
          $('.big-title-caption').remove();
          $('.thumb-wrapper').remove();
          gsap.to($('.next-project-image-wrapper.temporary'), {
            duration: 0.1, 
            opacity: 0, 
            ease: Power2.easeOut,
            onComplete: function() {
              $('.next-project-image-wrapper.temporary').remove();
              $('.temporary-hero').remove();
            }
          });
          
          if (!isMobile()) {
            $('#hero-image-wrapper').find('video').each(function() {
              try {
                this.play().catch(err => console.warn('Video autoplay failed:', err));
              } catch (e) {
                console.warn('Video playback error:', e);
              }
            });
            gsap.to($('.hero-video-wrapper'), {duration: 0.2, opacity: 1, delay: 0.1, ease: Power2.easeOut});
          } else {
            gsap.to($('.hero-video-wrapper'), {duration: 0.2, opacity: 1, delay: 0.5, ease: Power2.easeOut});
          }
        }, 450);
      });
    }

    setTimeout(() => {
      $('header').removeClass('white-header');
      $body.removeClass('load-project-thumb load-project-thumb-with-title load-next-page grid-open');
      
      setTimeout(() => {
        imagesLoaded('body', function() {
          $body.removeClass('show-loader disable-scroll');
        });
      }, 300);
    }, 800);
  }

  /*--------------------------------------------------
  Showcase Gallery - Refactored slider initialization
  ---------------------------------------------------*/
  function ShowcaseGallery() {
    if (!$('.showcase-gallery').length) return;

    $footer.addClass('showcase-footer');
    gsap.set($('.showcase-gallery .slide-hero-title span, .showcase-gallery .slide-hero-subtitle span'), {
      y: 120, 
      opacity: 0
    });
    gsap.set($('.showcase-gallery .clapat-slider .slide-inner'), {opacity: 0});

    // Properly declare slider variable
    const slider = new ClapatSlider('.showcase-gallery', {
      direction: 'horizontal',
      snap: false,
      navigation: {
        nextEl: '.cp-button-next',
        prevEl: '.cp-button-prev'
      },
      parallax: [{
        element: '.speed-50',
        margin: -80
      }],
      on: {
        init: function(slide) {
          if ($body.hasClass('show-loader')) {
            imagesLoaded('body', function() {
              // Animation code...
              gsap.to($('.showcase-gallery .clapat-slider .clapat-slide .slide-inner'), {
                duration: 0.7, 
                opacity: 1, 
                delay: 0.4, 
                ease: Power2.easeOut
              });
            });
          }
        },
        slideLeaveViewport: function(slide) {
          gsap.set($('.clapat-slider div:not(.clapat-slide-visible) .slide-events'), {x: ''});
        },
      },
    });

    slider.tl
      .fromTo('.progress-info-fill', {backgroundSize: '0% 100%'}, {backgroundSize: '100% 100%'}, 0)
      .fromTo('.progress-info-fill-2', {backgroundSize: '100% 100%'}, {backgroundSize: '0% 100%', duration: 0.3, ease: 'power3'}, 0);

    // Store slider for cleanup
    cleanupFunctions.push(() => {
      if (slider?.off) {
        slider.off();
      }
    });
  }

  // Export for Ajax loading
  window.LoadViaAjax = function() {
    HeightTitles();
    CleanupBeforeAjax();
    FirstLoad();
    ScrollEffects();
    Sliders();
    PageLoadActions();
    FitThumbScreenGSAP();
    ShowcaseOverlapping();
    ShowcasePortfolio();
    ShowcaseGallery();
    FitThumbScreenWEBGL();
    LazyLoad();
    Shortcodes();
    JustifiedGrid();
    Lightbox();
    PlayVideo();
    ContactForm();
    ContactMap();
    CustomFunction();
  };
});

document.addEventListener('DOMContentLoaded', () => {
  const LoadViaAjax = window.LoadViaAjax;
});
