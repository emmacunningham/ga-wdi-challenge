var RESULTS_CONTAINER = 'results-container';
var SEARCH_TERM_CONTAINER = 'search-term';
var DETAILS_CONTAINER = 'details-container';

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

var makeAjaxRequest = function(url, params) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = params['onload'] || function() {};

  request.onerror = params['onerror'] || function() {};

  request.send();
};

var makeSearchRequest = function(searchTerm) {

  var url = 'http://www.omdbapi.com/?s=' + searchTerm;
  var onLoad = function() {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      var resp = this.response;
      handleSearchResults(JSON.parse(resp));

    } else {
      // We reached our target server, but it returned an error

    }
  };

  var callbacks = {
    'onload': onLoad
  };

  makeAjaxRequest(url, callbacks);

};

var makeMovieRequest = function(id) {

  var url = 'http://www.omdbapi.com/?i=' + id + '&plot=full&r=json';
  var onLoad = function() {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      var resp = this.response;
      handleMovieResults(JSON.parse(resp));

    } else {
      // We reached our target server, but it returned an error

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
  makeSearchRequest(searchTerm);
};

var handleMovieResults = function(data) {
  renderMovieDetails(data);
};

var handleSearchError = function(searchTerm) {
  getElementById(RESULTS_CONTAINER).innerHTML =
      'Sorry, there was an error with the request. Try again?';
};

var renderMovieDetails = function(data) {
  var templateScript = getElementById('movie-details-template').innerHTML;
  var template = Handlebars.compile(templateScript);
  getElementById(DETAILS_CONTAINER).innerHTML = template(data);

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




