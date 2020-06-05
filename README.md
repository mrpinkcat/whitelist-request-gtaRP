# Whitelist Request GTA-RP

**CE PROJET N'EST PLUS MAINTENU, TANT AU NIVEAU DE SA SÉCURITÉ QU'AU NIVEAU DE SES FONCTIONALITÉS**

Un système de demande de whitelist avec captcha, interface d’administration protégé par un mot de passe, interaction avec d'autres fichiers (.lua) et interface utilisateur.

## Prérequis

- [node.js](https://nodejs.org/en/download/)

## Installation

### IMPORTANT
Ce systeme est fait pour fonctionner avec un systeme de witelist PAR IP situé dans le fichier `serveur.lua`.

Il va chercher la ligne `local whitelist = {` et va inserer les ip apres celle ci.

### Clonez le repo dans le meme fichier que `server.lua `
```bash
git clone
```

### Installer les dépendances
```bash
npm i
```

## Configuration

### Fichier de configuration
Copier et renomez le fichier `.env.example` en `.env` et configurer ce dernier.
| VARIABLE | DESCRIPTION |
| --- | --- |
| PORT | Le port sur le quel va tourner le serveur web |

### Fichier `panel.htpasswd`
Il vous faudra generer le contenue du fichier `panel.htpasswd` avec [ce site](https://www.web2generators.com/apache-tools/htpasswd-generator).

L'identifiant par défaut est `test` avec le mot de passe `test`.

### Captcha
*Uniquement sui vous avez activé le RECAPTCHA dans la configuration (voir apres le lancement).*

Dans le fichier `web/index.html` ligne 60, il à une clé a fournir pour votre captcha. Je vous laisse suivre le guide écris par Google ou regarder des vidéos sur youtube pour vous en sortir.

## Lancement
```bash
npm run start
```

### Configuration en ligne
Dirigez vous sur le panneau d'administration sur `/panel`.

L'identifiant par défaut est `test` avec le mot de passe `test`, sauf si vous avez modifier le `panel.htpasswd` (ce qui est fortement conseillé).

Cliquez sur `Configuration`.

Entrez vos informations.
