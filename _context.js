/*\
 * Class AJAX
\*/

function getContext(){
  var pnc = _.Promise.noCallBack();

  xhr.open('GET', '_context.json');
  xhr.onload = function() {
    var context = JSON.parse(this.response);
    pnc.resolve(context);
  };
  xhr.onerror = xhr.onabort = pnc.reject;
  xhr.send(null);

  return pnc.promise;
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







var context = document.getElementById('context');
var xhr = new XMLHttpRequest();
