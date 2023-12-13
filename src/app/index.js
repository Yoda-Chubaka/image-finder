import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { createMarkup } from './createMarkup';
import { PixabayAPI } from './PixabayAPI';
import { refs } from './refs';
import { notifyInit } from './notifyInit';
import { spinnerPlay, spinnerStop } from './spinner';

const modalLightboxGallery = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
});

spinnerPlay();

window.addEventListener('load', () => {
//   // console.log('All resources finished loading!');

  spinnerStop();
});

// refs.btnLoadMore.classList.add('is-hidden');

const pixaby = new PixabayAPI();

const options = {
  root: null,
  rootMargin: '100px',
  threshold: 1.0,
};

const loadMorePhotos = async function (entries, observer) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      pixaby.incrementPage();
      spinnerPlay();

      try {
        spinnerPlay();
        const { hits } = await pixaby.getPhotos();
        const markup = createMarkup(hits);
        refs.gallery.insertAdjacentHTML('beforeend', markup);

        if (pixaby.hasMorePhotos()) {
          // showMore();
          const lastItem = document.querySelector('.gallery a:last-child');
          observer.observe(lastItem);
        } else {
          // showMore();
          const lastItem = document.querySelector('.gallery a:last-child');
          observer.unobserve(lastItem);
          Notify.info(
            "We're sorry, but you've reached the end of search results.",
            notifyInit
          );
        };

        modalLightboxGallery.refresh();
        // scrollPage();
      } catch (error) {
        Notify.failure(error.message, 'Something went wrong!', notifyInit);
        clearPage();
      } finally {
        spinnerStop();
      }
    }
  });
};

const observer = new IntersectionObserver(loadMorePhotos, options);

const onSubmitClick = async event => {
  event.preventDefault();

  const {
    elements: { searchQuery },
  } = event.target;

  const search_query = searchQuery.value.trim().toLowerCase();

  if (!search_query) {
    clearPage();
    Notify.info('Enter data to search!', notifyInit);

    refs.searchInput.placeholder = 'What`re we looking for?';
    return;
  }

  pixaby.query = search_query;

  clearPage();

  try {
    spinnerPlay();
    const { hits, total } = await pixaby.getPhotos();

    if (hits.length === 0) {
      // showMore();
      Notify.failure(
        `Sorry, there are no images matching your ${search_query}. Please try again.`,
        notifyInit
      );

      return;
    }

    const markup = createMarkup(hits);
    refs.gallery.insertAdjacentHTML('beforeend', markup);

    pixaby.setTotal(total);
    Notify.success(`Hooray! We found ${total} images.`, notifyInit);
    
    if (pixaby.hasMorePhotos()) {
      const lastItem = document.querySelector('.gallery a:last-child');
      observer.observe(lastItem);
    } else {
      observer.unobserve(lastItem);
          Notify.info(
            "We're sorry, but you've reached the end of search results.",
            notifyInit
          )
    }

    modalLightboxGallery.refresh();
    // scrollPage();
  } catch (error) {
    Notify.failure(error.message, 'Something went wrong!', notifyInit);

    clearPage();
  } finally {
    spinnerStop();
  }
};

// const onLoadMore = async () => {
//   // pixaby.incrementPage();
//   pixaby.hasMorePhotos();

//   if (!pixaby.hasMorePhotos) {
//     // refs.btnLoadMore.classList.add('is-hidden');
//     // refs.hasMorePhotos.classList.remove('is-hidden');
//     observer.unobserve(lastItem);
//     Notify.info("We're sorry, but you've reached the end of search results.");
//     notifyInit;
//   }
//   try {
//     const { hits } = await pixaby.getPhotos();
//     const markup = createMarkup(hits);
//     refs.gallery.insertAdjacentHTML('beforeend', markup);

//     modalLightboxGallery.refresh();
//   } catch (error) {
//     Notify.failure(error.message, 'Something went wrong!', notifyInit);

//     clearPage();
//   }
// };

function clearPage() {
  pixaby.resetPage();
  refs.gallery.innerHTML = '';
  // refs.btnLoadMore.classList.add('is-hidden');
}

refs.form.addEventListener('submit', onSubmitClick);
refs.btnLoadMore.addEventListener('click', loadMorePhotos);
refs.footer.createElementById('#footer');

