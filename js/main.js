var RESULTS_CONTAINER = 'results-container';

var getElementById = function(id) {
  return document.getElementById(id);
};

var getElementBySelector = function(selector) {
  return document.querySelector(selector);
}

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

var handleSearchResults = function(results) {
  renderMovies(results);
};

var handleSearchInput = function(searchTerm) {
  makeSearchRequest(searchTerm);
};

var renderMovies = function(data) {
  var templateScript = getElementById('movie-template').innerHTML;
  var template = Handlebars.compile(templateScript);
  getElementBySelector('.results-container').innerHTML = template(data);
}

getElementById('search-term').addEventListener('input', function(e) {
  var searchTerm = encodeURIComponent(getElementById('search-term').value);
  handleSearchInput(searchTerm);
});

