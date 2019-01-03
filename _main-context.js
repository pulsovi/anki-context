(function mainIIFE() {
  if ('undefined' === typeof global.context) {
    log("Le context n'a pas pu être chargé.\nMerci de vérifier la syntaxe du fichier <_get-context.js>\n");
  }
  var context = new Context(global.context);

  var collection = document.querySelectorAll('[context-data]');
  var cible, contextContent, i;
  for (i = 0; i < collection.length; ++i) {
    cible = collection[i].getAttribute('context-data');
    objCible = context.get(cible);
    collection[i].innerText = objCible;
  }

  collection = document.querySelectorAll('[context-show]');
  for (i = 0; i < collection.length; ++i) {
    cible = collection[i].getAttribute('context-show');
    objCible = context.get(cible);
    if (!objCible) {
      collection[i].style.display = 'none';
    }
  }

  log("context chargé");
}());
