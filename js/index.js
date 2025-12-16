let APP = {}
// APP UTILS =======================================================================
APP.utils = {
   debounce: (func, delay) => {
      let timeoutId
      return function (...args) {
         const context = this
         clearTimeout(timeoutId)
         timeoutId = setTimeout(() => {
            func.apply(context, args)
         }, delay)
      }
   },
   throttle: (func, delay) => {
      let lastCall = 0
      return function (...args) {
         const context = this
         const now = Date.now()
         if (now - lastCall >= delay) {
            func.apply(context, args)
            lastCall = now
         }
      }
   },
   onWidthChange: (callback, debounceMs = 150) => {
      let lastWidth = window.innerWidth
      let timeoutId = null

      function handleResize() {
         if (timeoutId) {
            clearTimeout(timeoutId)
         }

         timeoutId = setTimeout(() => {
            const currentWidth = window.innerWidth

            if (currentWidth !== lastWidth) {
               lastWidth = currentWidth
               callback(currentWidth)
            }
         }, debounceMs)
      }

      window.addEventListener('resize', handleResize)

      return () => {
         if (timeoutId) {
            clearTimeout(timeoutId)
         }
         window.removeEventListener('resize', handleResize)
      }
   },
   inputMasks: () => {
      $('input[data-input-type]').each(function () {
         const inputType = $(this).data('input-type')

         switch (inputType) {
            case 'text':
               // Маска для текстового поля (дозволяє тільки літери та пробіли)
               $(this).inputmask({
                  mask: '*{1,50}',
                  definitions: {
                     '*': {
                        validator: '[A-Za-zА-Яа-яЁё\\s]',
                        cardinality: 1,
                     },
                  },
               })
               break

            case 'number':
               // Маска для числового поля (дозволяє тільки цифри)
               $(this).inputmask({
                  mask: '9{1,10}',
                  placeholder: '',
                  clearIncomplete: true,
                  showMaskOnHover: true,
                  showMaskOnFocus: true,
                  showMaskOnBlur: true,
               })
               break

            case 'email':
               // Маска для email
               $(this).inputmask({
                  mask: '*{1,64}@*{1,64}.*{1,10}',
                  greedy: false,
                  definitions: {
                     '*': {
                        validator: "[0-9A-Za-z!#$%&'*+/=?^_`{|}~-]",
                        cardinality: 1,
                     },
                  },
                  clearIncomplete: true,
                  showMaskOnHover: true,
                  showMaskOnFocus: true,
                  showMaskOnBlur: true,
               })
               break
         }
      })
   },
   copyToClipboard: stringToCopy => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
         navigator.clipboard
            .writeText(stringToCopy)
            .then(() => {})
            .catch(err => {
               console.error('Failed to copy with clipboard API', err)
               fallbackCopy(stringToCopy)
            })
      } else {
         fallbackCopy(stringToCopy)
      }

      function fallbackCopy(text) {
         const textarea = document.createElement('textarea')
         textarea.value = text
         textarea.style.position = 'fixed' // avoid scrolling to bottom
         textarea.style.opacity = '0'
         document.body.appendChild(textarea)
         textarea.focus()
         textarea.select()

         try {
            const successful = document.execCommand('copy')
            if (successful) {
               console.log('Link copied using fallback method!')
            } else {
               console.warn('Fallback copy failed')
            }
         } catch (err) {
            console.error('Fallback copy error', err)
         }
         document.body.removeChild(textarea)
      }
   },
   scrollToAnchor: () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
         anchor.addEventListener('click', function (e) {
            e.preventDefault()
            const target = this.getAttribute('href')
            let offset =
               $('.header__container').innerHeight() + $('.header__mobile-menu__navigation').innerHeight() + 16
            if (target === '#hero') {
               offset = 0 // Або будь-яке інше бажане значення
            }
            gsap.to(window, {
               duration: 2,
               scrollTo: {
                  y: target,
                  offsetY: offset,
               },
               ease: 'power3.inOut',
            })
         })
      })
   },
   getHeaderHeight: () => {
      return $('.header__container').innerHeight() + $('.header__mobile-menu__navigation').innerHeight()
   },
}

APP.gsapConfig = () => {
   // ScrollSmoother
   gsap.registerPlugin(ScrollTrigger, Flip, ScrollToPlugin, SplitText)

   let refreshTimeout
   const debouncedRefresh = () => {
      clearTimeout(refreshTimeout)
      refreshTimeout = setTimeout(() => {
         ScrollTrigger.refresh(true)
      }, 200)
   }

   const handleResize = APP.utils.debounce(() => {
      debouncedRefresh()
   }, 150)

   window.addEventListener('resize', handleResize)

   window.addEventListener('load', () => {
      setTimeout(() => ScrollTrigger.refresh(true), 100)
   })
}

APP.sliders = {
   testSlider: function (sliderSelector) {
      const node = document.querySelector(sliderSelector)
      if (!node) {
         return
      }
      const slider = new Swiper(node, {
         slidesPerView: 1,
         spaceBetween: 20,
         loop: true,
         navigation: {
            prevEl: `${sliderSelector}--prev`,
            nextEl: `${sliderSelector}--next`,
         },
      })
   },
   init: function () {
      this.testSlider('.test-swiper-slider')
   },
}

APP.sharePostIntoSoccials = {
   shareUrl: window.location.href,
   timeout: null,
   shareToFacebook: function () {
      const self = APP.sharePostIntoSoccials
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(self.shareUrl)}`
      window.open(facebookUrl, '_blank', 'width=600,height=400')
   },
   shareToLinkedIn: function () {
      const self = APP.sharePostIntoSoccials
      const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(self.shareUrl)}`
      window.open(linkedinUrl, '_blank', 'width=600,height=400')
   },
   copyLink: function () {
      const self = APP.sharePostIntoSoccials
      const textToCopy = self.shareUrl
      APP.utils.copyToClipboard(textToCopy)
      self.showMessage()
   },
   showMessage: function () {
      const self = APP.sharePostIntoSoccials
      $('.share .message').slideDown()

      if (self.timeout) {
         $('.share .message').slideUp().slideDown()
         clearTimeout(self.timeout)
      }
      self.timeout = setTimeout(() => {
         $('.share .message').slideUp()
      }, 5000)
   },
   shareToX: function () {
      const self = APP.sharePostIntoSoccials
      const text = encodeURIComponent('Переглянь це: ')
      const url = encodeURIComponent(self.shareUrl)
      const xUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
      window.open(xUrl, '_blank', 'width=600,height=400')
   },
   handlers: function () {
      $('.share-facebook').click(this.shareToFacebook)
      $('.share-linked-in').click(this.shareToLinkedIn)
      $('.share-x').click(this.shareToX)
      $('.share-inst').click(this.copyLink)
      $('.share-tiktok').click(this.copyLink)
      $('.share-copy').click(this.copyLink)
   },
   init: function () {
      this.handlers()
   },
}

APP.countrySelect = () => {
   const input = document.querySelector('#phone')
   const $input = $(input)
   const $errorMsg = $('.ui-input-phone-error')

   if (!input) {
      return
   }

   // 1. Ініціалізація intl-tel-input
   const iti = window.intlTelInput(input, {
      utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js',
      initialCountry: 'ca',
      separateDialCode: true,
      preferredCountries: ['ua', 'pl', 'us', 'de', 'ca'],
      autoPlaceholder: 'aggressive',
   })

   // 2. Функція оновлення маски
   function updateMask() {
      let placeholder = input.getAttribute('placeholder')

      if (!placeholder) {
         placeholder = '0000000000'
      }

      let exampleNumber = placeholder.replace(/\D/g, '')
      let length = exampleNumber.length

      let maskPattern = ''

      if (length === 9) {
         maskPattern = '999-999-999'
      } else if (length === 11) {
         maskPattern = '999-999-999-99'
      } else {
         maskPattern = '(999)-999-99-99'
      }

      // Застосовуємо маску
      $input.inputmask('remove')
      $input.inputmask({
         mask: maskPattern,
         placeholder: '_',
         showMaskOnHover: false,
         showMaskOnFocus: true,
         clearIncomplete: true,
      })
   }

   iti.promise.then(function () {
      updateMask()
   })

   // 4. Подія зміни країни
   input.addEventListener('countrychange', function () {
      $input.val('')
      updateMask()
   })

   // 5. Валідація
   $input.on('blur', function () {
      if ($input.inputmask('isComplete')) {
         $errorMsg.hide()
         $input.css('border-color', '#ccc')
      } else {
         if ($input.val().length > 0) {
            $errorMsg.show()
            $input.css('border-color', 'red')
         }
      }
   })
}

APP.header = {
   scrolled: function () {
      const header = document.querySelector('header')
      const heroSection = document.querySelector('section.hero')

      if (!header || !heroSection) return

      gsap.to(header, {
         scrollTrigger: {
            trigger: heroSection,
            start: 'bottom top', // коли низ hero торкається верху viewport
            end: 'bottom top',
            invalidateOnRefresh: true,
            onEnter: () => header.classList.add('scrolled'),
            onLeaveBack: () => header.classList.remove('scrolled'),
         },
      })
   },
   mobileMenu: function () {
      const duration = 0.8
      const ease = 'power2.inOut'
      let resizeTimeout

      const calculateHeight = () => {
         return window.innerHeight - APP.utils.getHeaderHeight()
      }

      const openMenu = () => {
         const dropdownHeight = calculateHeight()
         gsap.to('.header__mobile-menu__dropdown', {
            height: dropdownHeight,
            duration,
            ease,
         })
      }

      const closeMenu = () => {
         gsap.to('.header__mobile-menu__dropdown', {
            height: 0,
            duration,
            ease,
         })

         $('.header__mobile-menu .open-mobile-menu').removeClass('active')
      }

      const updateHeight = () => {
         // Оновлюємо висоту тільки якщо меню відкрите
         if ($('.open-mobile-menu').hasClass('active')) {
            const dropdownHeight = calculateHeight()
            gsap.to('.header__mobile-menu__dropdown', {
               height: dropdownHeight,
               duration: 0.3,
               ease: 'none',
            })
         }
      }

      // Обробник зміни розміру вікна з debounce
      $(window).on('resize', function () {
         clearTimeout(resizeTimeout)
         resizeTimeout = setTimeout(updateHeight, 100)
      })

      // Обробник для iOS Safari (коли шторка з'являється/зникає)
      window.visualViewport?.addEventListener('resize', updateHeight)

      $('.open-mobile-menu').click(function () {
         $(this).toggleClass('active')
         openMenu()
      })

      $('.close-mobile-menu').click(function () {
         closeMenu()
      })

      const INTERACTIVE_ELEMENTS = '.open-mobile-menu, .header__mobile-menu__navigation, .close-mobile-menu'
      $(document).click(function (e) {
         if (!$(e.target).closest(INTERACTIVE_ELEMENTS).length) {
            closeMenu()
         }
      })
   },
   init: function () {
      this.scrolled()
      this.mobileMenu()
   },
}

APP.heroPadding = () => {
   let headerHeight = 0

   const setPadding = () => {
      headerHeight = APP.utils.getHeaderHeight()
      $('section.hero .hero__content__wrapper').css({
         paddingTop: headerHeight,
      })

      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`)
   }

   const handleResize = APP.utils.debounce(() => {
      setPadding()
   }, 150)
   setPadding()

   window.addEventListener('resize', handleResize)
}

APP.gsapFestivalAnimation = () => {
   // Перевірка розміру екрану
   const mm = gsap.matchMedia()

   mm.add('(min-width: 881px)', () => {
      // 1. Setup - Select Elements and Calculate Initial Values
      const section = document.querySelector('.festival-events')
      if (!section) return
      const titleH2 = section.querySelector('.section-name')
      const tabsContainer = section.querySelector('.posts-tabs')
      const posts = section.querySelectorAll('.festival-events--list')
      const stickyContainer1 = section.querySelector('.col:first-child .sticky')
      const stickyContainer2 = section.querySelector('.col:last-child .sticky')
      const initialContainer = section.querySelector('.content__title')

      // Calculate the end position (in pixels) for the ScrollTrigger
      const header = document.querySelector('header')
      const headerHeight = header ? header.offsetHeight : 0
      const endPosition = headerHeight + 32

      // 2. FLIP Setup: Create the Initial State
      const state = Flip.getState([titleH2, tabsContainer])

      // 3. FLIP Setup: Move the elements to their new parent containers (Final State)
      stickyContainer1.appendChild(titleH2)
      stickyContainer2.appendChild(tabsContainer)

      Flip.from(state, {
         ease: 'none',
         scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: `top ${endPosition}`,
            scrub: true,
            absolute: true,
            invalidateOnRefresh: true,
         },
         onComplete: () => {
            stickyContainer1.classList.add('is-stuck')
            stickyContainer2.classList.add('is-stuck')
         },
         onLeaveBack: () => {
            stickyContainer1.classList.remove('is-stuck')
            stickyContainer2.classList.remove('is-stuck')
         },
      })

      let findBiggest = Math.max(titleH2.clientHeight, tabsContainer.clientHeight)

      gsap.set(posts, {
         y: findBiggest + 32,
      })

      gsap.to(posts, {
         y: 0,
         duration: 1,
         ease: 'none',
         scrollTrigger: {
            trigger: section,
            start: 'top center',
            end: `top ${endPosition}`,
            scrub: true,
            invalidateOnRefresh: true,
         },
      })

      // Функція очищення при виході з медіа-запиту
      return () => {
         ScrollTrigger.getAll().forEach(st => {
            if (st.vars.trigger === section) {
               st.kill()
            }
         })

         // Повернути елементи назад
         initialContainer.appendChild(titleH2)
         initialContainer.appendChild(tabsContainer)

         // Очистити стилі
         gsap.set([titleH2, tabsContainer, posts], { clearProps: 'all' })
         stickyContainer1.classList.remove('is-stuck')
         stickyContainer2.classList.remove('is-stuck')
      }
   })
}

APP.switchEventsTab = () => {
   // 1. Отримуємо всі кнопки вкладок та контейнери подій
   const $tabs = $('.posts-tabs .tab-button')
   const $postsContainers = $('.festival-events--list')
   const activeClass = 'active'

   $tabs.on('click', function () {
      const $this = $(this)

      if ($this.hasClass(activeClass)) {
         return
      }

      const newTabId = $this.data('active-tab')
      const $currentActiveTab = $tabs.filter(`.${activeClass}`)
      const currentTabId = $currentActiveTab.data('active-tab')

      const $currentPostsContainer = $postsContainers.filter(`[data-date="${currentTabId}"]`)
      const $newPostsContainer = $postsContainers.filter(`[data-date="${newTabId}"]`)

      const $currentPosts = $currentPostsContainer.find('.festival-event')

      const tl = gsap.timeline({
         onComplete: () => {
            $currentPostsContainer.hide()
            $newPostsContainer.show()
            $currentActiveTab.removeClass(activeClass)
            $this.addClass(activeClass)

            const $newPosts = $newPostsContainer.find('.festival-event')
            gsap.set($newPosts, { x: '100%' })

            gsap.to($newPosts, {
               duration: 0.6,
               x: 0,
               opacity: 1,
               ease: 'power3.inOut',
               stagger: {
                  amount: 0.4,
                  from: 'start',
               },
            })

            // ScrollTrigger.refresh(true)
         },
      })

      // 1.1. Анімуємо приховування старих блоків:
      tl.to($currentPosts, {
         duration: 0.5,
         x: '-100%',
         ease: 'power3.inOut',
         stagger: {
            amount: 0.4,
            from: 'start',
            grid: 'auto',
         },
      })
   })

   // Ініціалізація: ховаємо всі контейнери, крім активного
   $postsContainers.not(`[data-date="${$tabs.filter(`.${activeClass}`).data('active-tab')}"]`).hide()
}
APP.horizontalSlider = {
   exampleGrid: null,
   slideSize: null,
   slider: null,
   slides: null,
   desktopContainer: null,
   titleContainer: null,
   timeline: null,
   totalSliderWidth: 0,
   gapSize: 20,
   marginTopPattern: [200, 0, 400, 90],
   maxAllowedOffset: 0,
   sliderContainerHeight: 0,
   isInitialized: false,
   resizeHandler: null,
   matchMedia: null,

   EXTRA_SCROLL_OFFSET: 200,

   getNodes: function () {
      if (!this.slider) {
         this.slider = $('.our-performers-desktop__slider')
         this.slides = $('.our-performers-desktop .performers-dektop-slide')
         this.desktopContainer = $('.our-performers-desktop')
         this.titleContainer = $('.our-performers-desktop__title')
      }
   },

   calculateMaxOffset: function () {
      const headerHeight = APP.utils.getHeaderHeight()
      const titleHeight = this.titleContainer.outerHeight(true)
      const availableViewportHeight = window.innerHeight - headerHeight
      const gapTitleToSlider = 40

      this.sliderContainerHeight = availableViewportHeight - titleHeight - gapTitleToSlider

      document.documentElement.style.setProperty('--performer-container-height', `${availableViewportHeight}px`)

      document.documentElement.style.setProperty('--performer-slider-height', `${this.sliderContainerHeight}px`)

      const maxRequiredOffset = Math.max(...this.marginTopPattern) || 0
      const slideHeight = this.slides.first().outerHeight() || 100
      const maxOffsetBasedOnCenter = this.sliderContainerHeight / 2 - slideHeight / 2

      this.maxAllowedOffset = Math.min(maxRequiredOffset, Math.max(0, maxOffsetBasedOnCenter))
   },

   calcSizes: function () {
      this.slideSize = $('.our-performers-desktop .performers-dektop-slide').innerWidth()
      const numSlides = this.slides.length

      if (numSlides > 0) {
         this.totalSliderWidth = numSlides * this.slideSize + (numSlides - 1) * this.gapSize
      } else {
         this.totalSliderWidth = 0
      }

      this.calculateMaxOffset()
   },

   setSizes: function () {
      const self = this

      this.slides.each(function (index) {
         const slide = $(this)

         const patternIndex = index % self.marginTopPattern.length
         let originalOffset = self.marginTopPattern[patternIndex]
         let finalOffset = Math.min(originalOffset, self.maxAllowedOffset)

         slide.css({ 'margin-top': finalOffset + 'px' })
         //  console.log(':', slide[0].style.marginTop)
      })
   },

   initHorizontalScroll: function () {
      if (!this.slider || this.slides.length === 0) return

      // ⭐ Kill і timeline, і ScrollTrigger
      if (this.timeline) {
         if (this.timeline.scrollTrigger) {
            this.timeline.scrollTrigger.kill()
         }
         this.timeline.kill()
         this.timeline = null
      }

      const headerHeight = APP.utils.getHeaderHeight()
      const contentWidth = this.totalSliderWidth + 2 * 40
      const viewportWidth = this.slider.innerWidth()
      const maxScrollDistance = contentWidth - viewportWidth

      if (maxScrollDistance <= 0) {
         console.log('Контенту недостатньо для горизонтального скролу.')
         return
      }

      const startPosition = headerHeight + 32
      const maxScrollDistanceWithOffset = maxScrollDistance + this.EXTRA_SCROLL_OFFSET

      // ⭐ Зберігаємо timeline
      this.timeline = gsap.timeline({
         scrollTrigger: {
            id: 'horizontal-pin',
            trigger: '.our-performers-desktop',
            start: 'top top+=' + startPosition,
            end: () => '+=' + maxScrollDistance,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            invalidateOnRefresh: true,
         },
      })

      this.timeline.to(this.slider, {
         scrollLeft: maxScrollDistanceWithOffset,
         ease: 'none',
      })
   },

   recalculateAll: function () {
      this.calcSizes()
      this.setSizes()
      this.initHorizontalScroll()
      // ⭐ Один refresh в кінці
      //   ScrollTrigger.refresh(true)
   },

   cleanup: function () {
      // Видаляємо обробник resize
      if (this.resizeHandler) {
         window.removeEventListener('resize', this.resizeHandler)
         this.resizeHandler = null
      }

      // ⭐ Kill timeline (він убє і ScrollTrigger)
      if (this.timeline) {
         if (this.timeline.scrollTrigger) {
            this.timeline.scrollTrigger.kill()
         }
         this.timeline.kill()
         this.timeline = null
      }

      // Скидаємо інлайн стилі
      if (this.slider && this.slider.length) {
         this.slider.removeAttr('style')
      }
      if (this.slides && this.slides.length) {
         this.slides.removeAttr('style')
      }
      if (this.desktopContainer && this.desktopContainer.length) {
         this.desktopContainer.removeAttr('style')
      }

      // Очищаємо посилання на елементи
      this.slider = null
      this.slides = null
      this.desktopContainer = null
      this.titleContainer = null

      this.isInitialized = false
   },

   checkDeviceSize: function () {
      // ⭐ Зберігаємо matchMedia
      this.matchMedia = gsap.matchMedia()

      this.matchMedia.add('(min-width: 767px)', () => {
         if (this.isInitialized) return

         this.getNodes()
         this.recalculateAll()

         const self = this

         this.resizeHandler = APP.utils.debounce(() => {
            self.recalculateAll()
         }, 300)

         window.addEventListener('resize', this.resizeHandler)
         this.isInitialized = true

         // ⭐ Cleanup викликається автоматично matchMedia
         return () => {
            self.cleanup()
         }
      })
   },

   init: function () {
      this.checkDeviceSize()
   },
}

APP.pulseSvgAnimation = () => {
   const whichGroup = [1, 2, 3, 7, 8, 4, 10, 11, 20]

   // Отримуємо всі <g> елементи
   const allGroups = document.querySelectorAll('#dektop-performers-svg g')

   // Фільтруємо тільки потрібні групи за індексами
   const selectedGroups = allGroups

   // Створюємо timeline для кожного елемента
   selectedGroups.forEach(group => {
      const tl = gsap.timeline({
         repeat: -1, // Нескінченне повторення
         repeatDelay: Math.random() * 2, // Рандомна пауза між циклами
      })

      tl.fromTo(
         group,
         { opacity: 0 },
         {
            opacity: 1,
            duration: 1.2, // 0.6s на появу
            delay: Math.random() * 8, // Рандомна початкова затримка 0-3s
            ease: 'power2.inOut',
         },
      ).to(group, {
         opacity: 0,
         delay: 1,
         duration: 0.6, // 0.6s на зникнення (разом 1.2s)
         ease: 'power2.inOut',
      })
   })
}

APP.performersSwiper = () => {
   const node = document.querySelector('.performers-mobile-swiper')
   if (!node) {
      return
   }
   const slider = new Swiper(node, {
      slidesPerView: 'auto',
      spaceBetween: 8,
      slidesOffsetBefore: 16,
      slidesOffsetAfter: 16,
      loop: false,
      pagination: {
         el: '.performers-mobile-swiper-pag',
         clickable: true,
      },
   })
}

APP.aboutUs = {
   timeline: null,
   split: null,
   scrollTriggerInstance: null,

   splitText: function () {
      const textElement = document.querySelector('.about-us__text h2')

      // Очищаємо попередній ScrollTrigger
      if (this.scrollTriggerInstance) {
         this.scrollTriggerInstance.kill()
      }

      // Очищаємо попередній timeline
      if (this.timeline) {
         this.timeline.kill()
      }

      // Очищаємо SplitText
      if (this.split) {
         this.split.revert()
      }

      this.split = new SplitText(textElement, { type: 'chars' })
      const getStartOffset = () => APP.utils.getHeaderHeight() + 32

      this.timeline = gsap.timeline({
         scrollTrigger: {
            trigger: '#about',
            start: () => 'top top+=' + getStartOffset(),
            end: '+=150%',
            pin: true,
            pinSpacing: true,
            scrub: 1,
            markers: false,
            invalidateOnRefresh: true,
         },
      })

      // Зберігаємо посилання на ScrollTrigger
      this.scrollTriggerInstance = this.timeline.scrollTrigger

      this.timeline.fromTo(
         this.split.chars,
         { color: '#F7F7F7' },
         {
            color: '#0D0D0D',
            stagger: 0.1,
            ease: 'power3.inOut',
         },
      )
   },

   init: function () {
      this.splitText()

      this.matchMedia = gsap.matchMedia()

      this.matchMedia.add('(min-width: 767px)', () => {
         this.resizeHandler = APP.utils.debounce(() => {
            ScrollTrigger.getAll().forEach(st => st.refresh())
            this.splitText()
         }, 300)

         window.addEventListener('resize', this.resizeHandler)
         return () => {
            self.cleanup()
         }
      })
   },
}

APP.videos = {
   slider: function (sliderSelector) {
      const node = document.querySelector(sliderSelector)
      if (!node) {
         return
      }
      const slider = new Swiper(node, {
         loop: false,
         breakpoints: {
            0: {
               spaceBetween: 8,
               slidesPerView: 'auto',
               slidesOffsetBefore: 16,
               slidesOffsetAfter: 16,
            },
            768: {
               spaceBetween: 20,
               slidesPerView: 3,
               slidesOffsetBefore: 0,
               slidesOffsetAfter: 0,
            },
         },
         scrollbar: {
            el: '.scrollbar-container .swiper-scrollbar',
            hide: false,
            draggable: true,
            dragSize: 'auto',
            snapOnRelease: true,
         },
      })
      setTimeout(() => {
         slider.update()
         slider.scrollbar.updateSize()
      }, 100)
   },

   plyr: function () {
      const players = []
      $('.initVideo').each(function (id, el) {
         const player = new Plyr(el, {
            controls: ['progress'],
            clickToPlay: true,
            hideControls: true,
            fullscreen: { enabled: false },
         })
         players.push(player)

         // Слухаємо подію play
         player.on('play', () => {
            // Проходимось по всіх інших і ставимо на паузу
            players.forEach(p => {
               if (p !== player) p.pause()
            })
         })
         player.on('ready', () => {
            el.load()
         })
      })
   },
   init: function () {
      this.slider('.videos-slider')
      this.plyr()
   },
}
APP.sponsors = {
   dragZone: function () {
      let mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
         Draggable.create('.draggable-card', {
            bounds: '.sponsors-drag-and-drop-container',
            inertia: true,
         })
      })
   },
   showAll: function () {
      const button = document.querySelector('.show-all')
      const allCards = document.querySelectorAll('.sponsors-drag-and-drop-container .draggable-card:nth-child(n + 7)')
      const hiddenCards = Array.from(allCards).filter(card => !card.classList.contains('be-sponsore'))

      if (!button || hiddenCards.length === 0) return

      button.addEventListener('click', () => {
         hiddenCards.forEach(card => {
            // Встановлюємо display block та opacity 0
            gsap.set(card, { display: 'block', opacity: 0 })

            // Анімуємо появу
            gsap.to(card, {
               opacity: 1,
               duration: 0.6,
               ease: 'power2.out',
            })
         })

         // Ховаємо кнопку після натискання
         gsap.to(button, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
               button.style.display = 'none'
            },
         })
      })
   },
   init: function () {
      this.dragZone()
      this.showAll()
   },
}

document.addEventListener('DOMContentLoaded', event => {
   APP.gsapConfig()
   APP.utils.inputMasks()
   APP.utils.scrollToAnchor()

   APP.horizontalSlider.init()
   //    logic
   APP.countrySelect()
   APP.sliders.init()
   APP.header.init()
   APP.heroPadding()
   APP.gsapFestivalAnimation()
   APP.switchEventsTab()
   APP.pulseSvgAnimation()
   APP.performersSwiper()

   APP.aboutUs.init()

   APP.videos.init()
   APP.sponsors.init()

   ScrollTrigger.sort()
   //    ScrollTrigger.refresh(true)
})
