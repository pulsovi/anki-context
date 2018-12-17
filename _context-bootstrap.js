var log;
setTimeout(function() {
  log = (function IIFE(){
    var console = document.getElementById('context');

    return function(data){
      console.appendChild(document.createTextNode(data));
    };
  }());
  log('context-bootsrap starts\n');

  function appendScript(src) {
    var script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
  }
}, null);
