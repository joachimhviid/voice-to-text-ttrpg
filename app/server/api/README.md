# Writing to the Database via the API

To create a new session and write to the database, you need to send a `POST` request to the `/api/sessions` endpoint.

## Endpoint

`POST /api/sessions`

## Request Body

The request body must be a JSON object with the following fields:

- `title` (string, required): The title of the session.
- `content` (string, optional): The main content of the session.
- `combatStats` (string, optional): Markdown content for combat statistics.
- `inventoryStats` (string, optional): Markdown content for inventory.
- `relations` (string, optional): Markdown content for character relations.
- `summary` (string, optional): Markdown content for the session summary.

## Example

Here's an example of how to create a new session using `curl`:

```sh
curl -X POST http://localhost:3000/api/sessions \
-H "Content-Type: application/json" \
-d '{
  "title": "The Dragon's Lair",
  "content": "Our heroes venture into the lair of a fearsome dragon.",
  "combatStats": "# Combat\n\n- Dragon: AC 20, HP 250",
  "inventoryStats": "# Inventory\n\n- 1 Sword of Slaying\n- 5 Health Potions",
  "relations": "# Relations\n\n- The party is united against the dragon.",
  "summary": "# Summary\n\nThe party entered the cave and prepared for battle."
}'
```

This will create a new session in the database with the provided content.
