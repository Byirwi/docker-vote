---
title: TP Docker,docker-compose,k8s
author: Tom Avenel
abstract: Le but de ce TP est d'isoler et de déployer une application dans une stack de conteneurs Docker.
---

# Présentation de l'application

L'application est composée de 6 composants : `vote`, `result`, `worker`, `db`, `redis` et `proxy`.

Seuls les 4 composants `vote`, `result`, `worker` et `proxy` contiennent du code spécifique à ce projet (`db` et `redis` sont des composants génériques déjà existants et uniquement à déployer).

- `proxy` est un serveur Nginx servant de reverse-proxy vers le front des resultats et des votes.
- `vote` est un composant hébergeant une UI permettant de voter
- `result` est un composant hébergeant une UI affichant les résultats de vote
- `redis` est un message broker qui collecte les votes et les envoie au `worker`
- `worker` est un composant gérant le backend des votes
- `db` est une base de données `postgres` persistant les votes.

Une fois déployée, l'application expose :

- une UI pour les votes (conteneur `vote`) accessible depuis le reverse-proxy : <http://vote.votes.fr/>
- une UI pour afficher les résultats (conteneur `result`) accessible depuis le reverse-proxy : <http://results.votes.fr/>


**Attention : le reverse-proxy a besoin des entrées DNS suivantes pour fonctionner à ajouter dans le fichier hosts : /etc/hosts sous Linux, /private/etc/hosts sous MacOS, C:\Windows\System32\drivers\etc\hosts sous Windows.**

```
127.0.0.1 vote.votes.fr
127.0.0.1 results.votes.fr
```

Une autre option est d'utiliser la commande `curl` pour tester l'application depuis la ligne de commande, avec `curl --resolve vote.votes.fr:127.0.0.1 …`

Les fichiers `Dockerfile` sont à compléter : ceux-ci sont déjà commentés **mais ils ne suivent pas forcément les bonnes pratiques**.

# Spécifications de déploiement

L'application totale sera déployée dans une stack composée de 6 services :

- un service `proxy` (reverse-proxy Nginx) buildé depuis `./proxy` :
  + Lié au port `80` de l'hôte
  + Utilise le réseau du frontend
- un service `vote` buildé depuis `./vote` :
  + Le web serveur tourne sur le port `80` dans le conteneur.
  + Le conteneur doit s'appeler `vote`.
- un service `result` buildé depuis `./result` (tourne sur le port `80`).
  + Le web serveur tourne sur le port `80` dans le conteneur.
  + Le conteneur doit s'appeler `results`.
- un service `worker` buildé depuis `./worker` qui récupère les messages de `redis` et les envoie dans la `db`
- un message broker nommé `redis` utilisant l’image `redis:alpine` pour gérer les interactions entre les composants : ce conteneur organise les échanges de messages entre le service `vote` et le service `worker`
  + Le port `6379` doit être accessible à `vote` et `worker`
  + Le script `./healthchecks/redis.sh` permet de monitorer l'état de l'application dans le conteneur
- une base de données nommée `db` utilisant l’image `postgres:9.4` pour persister les votes
  + La base de données stocke les données dans le répertoire `/var/lib/postgresql/data`.
  + La base de données requiert deux variables d’environment au démarrage: `POSTGRES_USER="postgres"` et `POSTGRES_PASSWORD="postgres"`.
  + Le port `5432` doit être accessible à `worker` et `result`
  + Le script `./healthchecks/postgres.sh` permet de monitorer l'état de l'application dans le conteneur
- Les sources des applications `vote` et `result` doivent être accessibles dans le répertoire `/app` dans le conteneur.
- Si les sources sont modifiées dans le dépôt de code, on ne créera pas de nouvelle image du conteneur (accès depuis l'extérieur).
- Seuls les services `vote` et `result` sont des services _métier_ :
  + Les autres conteneurs n'ont donc pas à être lancés séparéments mais doivent démarrer automatiquement si l'un des deux services métier démarre.
  + Seuls les services métier et le reverse-proxy doivent être accessibles depuis l'hôte.
- Les conteneurs `redis` et `db` doivent être accessibles à tous les autres conteneurs.

# Legal

- © 2025 Tom Avenel under CC BY-SA 4.0
