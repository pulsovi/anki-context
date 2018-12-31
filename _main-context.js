(function mainIIFE() {
  if ('undefined' === typeof global.context) {
    log("Le context n'a pas pu être chargé.\nMerci de vérifier la syntaxe du fichier <_get-context.js>\n");
  }
  var context = new Context(global.context);
  var collection = document.querySelectorAll('[context-data]');
  var cible, contextContent;
  for (var i = 0; i < collection.length; ++i) {
    cible = collection[i].getAttribute('context-data');
    objCible = context.get(cible);
    collection[i].innerText = objCible;
  }
}());
