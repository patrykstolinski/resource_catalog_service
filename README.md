# Resource Catalog Service

Ein einfacher RESTful API-Service für einen Ressourcenkatalog, der mit Express.js implementiert wurde.

---

## Merkmale

* **GET /resources**: Ruft alle Ressourcen ab.
* **GET /resources/search**: Ruft alle Ressourcen ab. Unterstützt Filterung über Query-Parameter (alle).
* **GET /resources/:id**: Ruft eine einzelne Ressource anhand ihrer ID ab.
* **POST /resources**: Erstellt eine neue Ressource.
* **PUT /resources/:id**: Aktualisiert eine bestehende Ressource.
* **DELETE /resources/:id**: Löscht eine bestehende Ressource.
* Verwendet **Middleware** für Validierung und Fehlerbehandlung.
* Konfiguration über **Umgebungsvariablen**.
* Unterstützt **CORS**.

---

## Voraussetzungen

Stelle sicher, dass du Node.js und npm installiert hast.

## Installation

1.  Klone dieses Repository (sobald es in einem Repository ist).
2.  Navigiere in das Projektverzeichnis.
3.  Installiere die Abhängigkeiten:
    ```sh
    npm install
    ```
4.  Erstelle eine `.env`-Datei im Stammverzeichnis und füge den Port hinzu:
    ```
    PORT = 5002
    HOST = 127.0.0.1
    ```

---

## Verwendung

Starte den Server mit dem folgenden Befehl:
```sh
npm start
