/**
 * @fileoverview Main application script for OMDB search app
 * @author Emma Cunningham (the.cunning.ham@gmail.com)
*/


/*
 * Global constants for container names.
 */
var RESULTS_CONTAINER = 'results-container';
var SEARCH_TERM_CONTAINER = 'search-term';
var DETAILS_CONTAINER = 'details-container';


/*
 * Handlebars helper to allow for inequality check in template.
 */
Handlebars.registerHelper('ifNotEq', function(term1, term2, options) {
  if (term1 != term2) {
    return options.fn(this);
  }
  return options.inverse(this);
});


/*
 * Get element by ID helper.
 * @params {string} id - element id.
 */
var getElementById = function(id) {
  return document.getElementById(id);
};


/*
 * Add class to element helper.
 * @params {Element} el - element to add class name to.
 * @params {string} className - class name to add.
 */
var addClass = function(el, className) {
  if (el.classList)
    el.classList.add(className);
  else
    el.className += ' ' + className;
};


/*
 * Remove class from element helper.
 * @params {Element} el - element to remove class name from.
 * @params {string} className - class name to remove.
 */
var removeClass = function(el, className) {
  if (el.classList)
    el.classList.remove(className);
  else
    el.className = el.className.replace(new RegExp('(^|\\b)' +
        className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
};


/*
 * Trigger event helper.
 * @params {Element} el - element to trigger event from.
 * @params {string} name - name of custom event.
 * @params {Object} params - any additional parameters to pass.
 * @params {string} identifier - used for name property on element.
 */
var triggerEvent = function(el, name, params, identifier) {

  if (window.CustomEvent) {
    var event = new CustomEvent(name, params);
  } else {
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent(name, true, true, params);
  }
  event.name = identifier;
  el.dispatchEvent(event);
}


/*
 * AJAX request helper.
 * @params {string} url - location of request.
 * @params {Object} params - any additional parameters to pass.
 */
var makeAjaxRequest = function(url, params) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = params['onload'] || function() {};

  request.onerror = params['onerror'] || function() {};

  request.send();
};


/*
 * Makes a search request to OMDb.
 * @params {string} searchTerm - term used for search query.
 */
var makeSearchRequest = function(searchTerm) {
  triggerEvent(window, 'loadStart', {}, 'searchRequest');

  var url = 'http://www.omdbapi.com/?s=' + searchTerm;
  var onLoad = function() {
    if (this.status >= 200 && this.status < 400) {
      var resp = this.response;
      handleSearchResults(JSON.parse(resp));
    } else {
      handleSearchError();
    }
  };

  var callbacks = {
    'onload': onLoad
  };

  makeAjaxRequest(url, callbacks);

};


/*
 * Makes a movie request to OMDb.
 * @params {string} searchTerm - term used for search query.
 */
var makeMovieRequest = function(id) {
  triggerEvent(window, 'loadStart', {}, 'movieRequest');

  var url = 'http://www.omdbapi.com/?i=' + id + '&plot=full&r=json';
  var onLoad = function() {
    if (this.status >= 200 && this.status < 400) {
      var resp = this.response;
      handleMovieResults(JSON.parse(resp));
    } else {
    }
  };

  var callbacks = {
    'onload': onLoad
  };

  makeAjaxRequest(url, callbacks);

};


/*
 * Handles search results from search request.
 * @params {Object} data - data from search request.
 */
var handleSearchResults = function(data) {
  renderMovies(data);
};


/*
 * Handles search input submission.
 * @params {string} searchTerm - term submitted for search query.
 */
var handleSearchInput = function(searchTerm) {
  var curPath = window.location.pathname;
  updateRoute(curPath + '?s=' + searchTerm);
  makeSearchRequest(searchTerm);
};


/*
 * Handles data results from movie request.
 * @params {Object} data - data from movie request.
 */
var handleMovieResults = function(data) {
  renderMovieDetails(data);
};


/*
 * Handles error in search request.
 */
var handleSearchError = function() {
  getElementById(RESULTS_CONTAINER).innerHTML =
      'Sorry, there was an error with the request. Try again?';
};


/*
 * Clear details container.
 */
var clearDetails = function() {
  removeClass(document.querySelector('html'), 'details-active');
};


/*
 * Clear search and results containers.
 */
var clearSearch = function() {
  getElementById(SEARCH_TERM_CONTAINER).value = '';
  getElementById(RESULTS_CONTAINER).innerHTML = '';
};


/*
 * Renders movie details by passing in data to Handlebars template.
 * Add listener to close element within newly rendered movie details container.
 * @params {Object} data - data from movie request.
 */
var renderMovieDetails = function(data) {
  getElementById(DETAILS_CONTAINER).innerHTML = '';
  var templateScript = getElementById('movie-details-template').innerHTML;
  var template = Handlebars.compile(templateScript);
  getElementById(DETAILS_CONTAINER).innerHTML = template(data);

  addClass(document.querySelector('html'), 'details-active');
  getElementById('overlay-close').addEventListener('click', function(e) {
    removeClass(document.querySelector('html'), 'details-active');
    var curPath = window.location.search;
    updateRoute(curPath.split('&id')[0]);
  });
};


/*
 * Renders movie search results by passing in data to Handlebars template.
 * Add listeners to newly created elements for each movie result.
 * @params {Object} data - data from search request.
 */
var renderMovies = function(data) {
  var templateScript = getElementById('movie-template').innerHTML;
  var template = Handlebars.compile(templateScript);
  getElementById(RESULTS_CONTAINER).innerHTML = template(data);

  // Attach click listeners to all new movie containers.
  var movieContainers = document.querySelectorAll('.movie-container');
  for (var i = 0, l = movieContainers.length; i < l; i++) {
    movieContainers[i].addEventListener('click', function(e) {
      var id = this.getAttribute('data-movieId');
      var curPath = window.location.search;
      updateRoute(curPath.split('/')[0] + '&id=' + id);
      makeMovieRequest(id);
    });
  }
}


/*
 * Attach click listener to search button.
 */
getElementById('search-button').addEventListener('click', function(e) {
  e.preventDefault();
  var searchTerm = encodeURIComponent(getElementById(SEARCH_TERM_CONTAINER).value);
  handleSearchInput(searchTerm);
});


/*
 * Attach keypress listener to search form to override default 'enter' functionality.
 */
getElementById('search-form').addEventListener('keypress', function(e) {
  if (e.which == 13) {
    e.preventDefault();
    var searchTerm = encodeURIComponent(getElementById(SEARCH_TERM_CONTAINER).value);
    handleSearchInput(searchTerm);
  }
});


/*
 * Attach loadStart listener to window.
 * Attaching load indicator depending on what kind of request we're loading.
 */
window.addEventListener('loadStart', function(e) {
  if (e.name == 'searchRequest') {
    getElementById(RESULTS_CONTAINER).innerHTML = '<div class="loading"></div>';
  }
  else if (e.name == 'movieRequest') {
    getElementById(DETAILS_CONTAINER).innerHTML = '<div class="loading"></div>';
  }
});


/*
 * Key-value look up for parameters within URL.
 * @params {string} val - name of parameter key to look up.
 */
var searchParameters = function(val) {
  var result,
      tmp = [];
  window.location.search
      .substr(1)
          .split('&')
          .forEach(function (item) {
          tmp = item.split('=');
          if (tmp[0] === val) result = tmp[1].split('/')[0];
      });
  return result;
};


/*
 * Updates HTML5 History if it's supported.
 * @params {string} slug - slug to update the URL with.
 */
var updateRoute = function(slug) {

  // Checks if HTML5 History is supported
  if (window.history && window.history.pushState) {
    window.history.pushState(null, null, slug);
  }

};


/*
 * Handles updates to route.
 */
var handleRoute = function() {
  var params = window.location.search;
  if (!!params) {
    var searchTerm = searchParameters('s');
    var id = searchParameters('id');
    if (!!id && !!searchTerm) {
      makeMovieRequest(id);
      makeSearchRequest(searchTerm);
      getElementById(SEARCH_TERM_CONTAINER).value = decodeURIComponent(searchTerm);
    }
    else if (!!searchTerm) {
      clearDetails();
      makeSearchRequest(searchTerm);
      getElementById(SEARCH_TERM_CONTAINER).value = decodeURIComponent(searchTerm);
    }
    else if (!!id) {
      makeMovieRequest(id);
    }
  }
  else {
    clearSearch();
  }
};


/*
 * Initializes router and sets up popstate listener
 */
var initRouter = function() {
  if (window.history && window.history.pushState) {
    handleRoute();
    window.addEventListener("popstate", function(e) {
      handleRoute();
    });
  }
  else {
    window.location = '/';
    clearSearch();
  }
}


/*
 * Make magic happen.
 */
window.onload = function() {
  initRouter();
};
