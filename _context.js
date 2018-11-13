/*\
 * Class AJAX
\*/

var AJAX = {};

AJAX.get = function get (url) {
  var pnc = _.Promise.noCallBack();
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = function (){
    pnc.resolve.call(this, this.response);
  };
  xhr.onerror = xhr.onabort = function () {
    pnc.reject.call(this, arguments);
  };
  xhr.send(null);
  return pnc.promise;
};

AJAX.getJson = function(url) {
  var pnc = _.Promise.noCallBack();
  this.get(url)
    .then(function (response) {
      var json = JSON.parse(response);
      pnc.resolve.call(this, json);
    })
    .catch(function(){
      pnc.reject.call(this, arguments);
    });
};

/*\
 * Class Context
\*/

function Context(contextObj) {
  this.context = contextObj;
}

Context.prototype.get = function(path) {
  //TODO
};

/*\
 * Class Vue
\*/

function Vue(template) {
  this.template = template;
}

/*\
 * Class Console
\*/

function Console(element) {
  this.element = element;
}

Console.prototype.log = function(element){
  if(! Node.prototype.isPrototypeOf(element)){
    element = document.createTextNode(element);
  }
  this.element.appendChild(element);
};

/*\
 * main
\*/

var console = new Console(document.getElementById('context'));
var context = AJAX.getJson('_context.json');
