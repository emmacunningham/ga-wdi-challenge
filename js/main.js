var RESULTS_CONTAINER = 'results-container';
var SEARCH_TERM_CONTAINER = 'search-term';
var DETAILS_CONTAINER = 'details-container';

Handlebars.registerHelper('ifNotEq', function(term1, term2, options) {
  if (term1 != term2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

var getElementById = function(id) {
  return document.getElementById(id);
};

var addClass = function(el, className) {
  if (el.classList)
    el.classList.add(className);
  else
    el.className += ' ' + className;
};

var removeClass = function(el, className) {
  if (el.classList)
    el.classList.remove(className);
  else
    el.className = el.className.replace(new RegExp('(^|\\b)' +
        className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
};

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

var makeAjaxRequest = function(url, params) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = params['onload'] || function() {};

  request.onerror = params['onerror'] || function() {};

  request.send();
};

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

var handleSearchResults = function(results) {
  renderMovies(results);
};

var handleSearchInput = function(searchTerm) {
  var curPath = window.location.pathname;
  updateRoute(curPath + '?s=' + searchTerm);
  makeSearchRequest(searchTerm);
};

var handleMovieResults = function(data) {
  renderMovieDetails(data);
};

var handleSearchError = function() {
  getElementById(RESULTS_CONTAINER).innerHTML =
      'Sorry, there was an error with the request. Try again?';
};

var clearDetails = function() {
  removeClass(document.querySelector('html'), 'details-active');
};

var clearSearch = function() {
  getElementById(SEARCH_TERM_CONTAINER).value = '';
  getElementById(RESULTS_CONTAINER).innerHTML = '';
};

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

getElementById('search-button').addEventListener('click', function(e) {
  e.preventDefault();
  var searchTerm = encodeURIComponent(getElementById(SEARCH_TERM_CONTAINER).value);
  handleSearchInput(searchTerm);
});

getElementById('search-form').addEventListener('keypress', function(e) {
  if (e.which == 13) {
    e.preventDefault();
    var searchTerm = encodeURIComponent(getElementById(SEARCH_TERM_CONTAINER).value);
    handleSearchInput(searchTerm);
  }
});

window.addEventListener('loadStart', function(e) {
  console.log(e);
  if (e.name == 'searchRequest') {
    getElementById(RESULTS_CONTAINER).innerHTML = '<div class="loading"></div>';
  }
  else if (e.name == 'movieRequest') {
    getElementById(DETAILS_CONTAINER).innerHTML = '<div class="loading"></div>';
  }
});

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

var updateRoute = function(slug) {

  // Checks if HTML5 History is supported
  if (window.history && window.history.pushState) {
    window.history.pushState(null, null, slug);
  }

};

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

// Initializes router and sets up popstate listener
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

window.onload = function() {
  initRouter();
};
