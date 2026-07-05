# TPV Festa Major

Aplicació de punt de venda instal·lable (PWA) per a ordinador, tauleta i mòbil. Un cop oberta i instal·lada des d'un servidor HTTPS, pot continuar funcionant sense connexió.

## Desenvolupament

```bash
npm install
npm run dev
```

## Generar la versió distribuïble

```bash
npm run build
```

La carpeta `dist/` resultant é l'aplicació preparada per publicar. S'ha de servir com a lloc web estàtic amb HTTPS; no s'ha d'obrir `index.html` directament des del sistema de fitxers.

Per provar-la a la xarxa local:

```bash
npm run serve
```

El terminal indicarà l'adreça IP local. L'accés HTTP des d'un altre dispositiu serveix per revisar la interfície, però la instal·lació i el mode offline requereixen HTTPS (excepte a `localhost`).

## Instal·lar-la

- **Windows, macOS, Linux o Android:** obre l'adreça HTTPS amb Chrome o Edge i selecciona **Instal·la l'aplicació**.
- **iPhone o iPad:** obre-la amb Safari, prem **Compartir** i després **Afegir a la pantalla d'inici**.

Cada dispositiu conserva les seves sessions i vendes al seu propi emmagatzematge local. Aquesta versió no sincronitza dades entre terminals; cal exportar la sessió des del menú d'administració.

## Verificació

```bash
npm run lint
npm run build
```
