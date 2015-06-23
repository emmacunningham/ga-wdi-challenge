

var getElementById = function(id) {
  return document.getElementById(id);
};

var getElementBySelector = function(selector) {
  return document.querySelector(selector);
}

var makeSearchRequest = function(searchTerm) {

  var request = new XMLHttpRequest();
  request.open('GET', 'http://www.omdbapi.com/?s=' + searchTerm, true);

  request.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      var resp = this.response;
      console.log(JSON.parse(resp));
    } else {
      // We reached our target server, but it returned an error

    }
  };

  request.onerror = function() {
    // There was a connection error of some sort
  };

  request.send();


};


makeSearchRequest('samurai');

var renderResults = function() {
  var data = {movies: [{title: 'poop'}, {title: 'double-poop'}]};
  var templateScript = getElementById('movie-template').innerHTML;
  var template = Handlebars.compile(templateScript);
  getElementBySelector('body').innerHTML += template(data);
}


