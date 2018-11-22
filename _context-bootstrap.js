setTimeout(function() {
  var console = document.getElementById('context');
  var log = function(data){
    console.appendChild(document.createTextNode(data));
  };
  log('context-bootsrap start');

  function appendScript(src) {
    var script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
  }
}, null);
