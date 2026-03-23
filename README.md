# DIplom-backend

## User Service Changes

The **user-service** now treats `Store` documents as independent accounts. Stores no longer reference a `User` owner; they have their own login credentials (`email` & `password`).

Users are created through `/auth/register`. By default new users are given the `buyer` role, but you can request a different role by including a `role` field. For example, to create a seller:

```json
{
  "username":"alice",
  "email":"alice@example.com",
  "password":"secret",
  "role":"seller"
}
```

In production you should restrict role assignment to admin clients; the service only validates that the supplied role is one of `buyer|seller|admin`.


### Store model

- `name`, `description`, `email`, `password`, `logo`, `address`, `isVerified`, `isActive`
- `email` is unique and required
- `password` is stored hashed and omitted from most query results
- `logo` and `address` are optional profile fields; `isVerified` defaults to false

### New endpoints (mounted under `/store`)

| Route             | Method | Description                     | Auth required |
| ----------------- | ------ | ------------------------------- | ------------- |
| `/store/register` | POST   | Create new store account        | No            |
| `/store/login`    | POST   | Authenticate store and get JWT  | No            |
| `/store/`         | GET    | List all stores                 | Yes           |
| `/store/:id`      | GET    | Get store details               | Yes           |
| `/store/:id`      | PUT    | Update store (without password) | Yes           |
| `/store/:id`      | DELETE | Remove a store                  | Yes           |

> **Note:** authentication middleware just verifies the JWT; the token payload contains `{ id, name, role }` where `role` is `store` for store accounts.

Existing `User` documents may still hold a `store` reference; that relationship is optional and unrelated to store authentication.

---
