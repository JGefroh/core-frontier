function loadFont() {
    var customFont = new FontFace('Protomolecule', 'url(assets/fonts/Protomolecule.woff2)');
    customFont.load().then(function(loadedFont) {
        document.fonts.add(loadedFont);
    })
}

loadFont()