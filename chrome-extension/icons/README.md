# Icone Estensione

Le icone dell'estensione devono essere create nelle seguenti dimensioni:
- **16x16** pixel (icona piccola nella barra degli strumenti)
- **48x48** pixel (pagina gestione estensioni)
- **128x128** pixel (Chrome Web Store, se pubblicata)

## Generazione Rapida delle Icone

### Opzione 1: Usando un'immagine esistente

Se hai già un logo o un'immagine, puoi ridimensionarla online usando:
- [Favicon Generator](https://realfavicongenerator.net/)
- [ICO Convert](https://icoconvert.com/)
- [Online Image Resizer](https://www.iloveimg.com/resize-image)

### Opzione 2: Creare icone con emoji (temporanee)

Per testare rapidamente, puoi usare questo semplice HTML per generare icone:

1. Crea un file `generate-icons.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Icon Generator</title>
</head>
<body>
    <canvas id="canvas16" width="16" height="16"></canvas>
    <canvas id="canvas48" width="48" height="48"></canvas>
    <canvas id="canvas128" width="128" height="128"></canvas>

    <script>
        function createIcon(canvasId, size, emoji, bgColor) {
            const canvas = document.getElementById(canvasId);
            const ctx = canvas.getContext('2d');

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, size, size);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);

            // Emoji
            ctx.font = `${size * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, size / 2, size / 2);

            // Download link
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `icon${size}.png`;
                a.textContent = `Download icon${size}.png`;
                document.body.appendChild(a);
                document.body.appendChild(document.createElement('br'));
            });
        }

        createIcon('canvas16', 16, '🏠', '#667eea');
        createIcon('canvas48', 48, '🏠', '#667eea');
        createIcon('canvas128', 128, '🏠', '#667eea');
    </script>
</body>
</html>
```

2. Apri il file in Chrome
3. Clicca sui link per scaricare le icone
4. Salva i file PNG in questa cartella (`chrome-extension/icons/`)

### Opzione 3: Placeholder temporanei

Per ora, puoi scaricare icone placeholder da:
- [Flaticon](https://www.flaticon.com/)
- [Icons8](https://icons8.com/)
- [Heroicons](https://heroicons.com/)

Cerca "home", "document", o "hotel" e scarica nei formati richiesti.

### Opzione 4: Design professionale (consigliato)

Per un'icona professionale, considera:
1. **Figma** (gratuito): crea un design 128x128 ed esportalo in 16, 48, 128px
2. **Canva** (gratuito): usa template per icone app
3. **Adobe Illustrator**: per design vettoriali professionali

## Design Consigliato

Per questa estensione, l'icona dovrebbe:
- Rappresentare "alloggio" o "documento" (es: 🏠, 📄, 🏛️)
- Usare i colori del brand: viola/blu (#667eea, #764ba2)
- Essere semplice e riconoscibile anche a 16x16px
- Avere sfondo pieno (non trasparente) per migliore visibilità

## Note

Se mancano le icone, Chrome mostrerà un placeholder grigio, ma l'estensione funzionerà comunque.
