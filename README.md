## SSR
## Authentication
URL | Page description
--- | --- 
`/signin` | Sign in
`/recovery` | Page for resetting password

### Application
#### Navigation
URL | Page description
--- | --- 
`/` | Main page
`/orgs` | Subordinate organizations;<br>*relative to the organization of the user*
`/users` | Users of subordinate organizations;<br>*relative to the organization of the user*
`/forms` | Forms of the user's organization

### Organization
URL | Page description
--- | --- 
`/orgs/:id`<br>`/orgs/:id/info` | Organization profile
`/orgs/:id/orgs` | Subordinate organizations;<br>*relative to the organization specified by id*
`/orgs/:id/users` | Users of subordinate orgs;<br>*relative to the organization specified by id* 
`/orgs/:id/forms` | Forms of the organization specified by id
`/orgs/:id/settings` | Organization settings 

### User
URL | Page description
--- | --- 
`/users/:id`<br>`/users/:id/info` | User profile
`/users/:id/settings` | User settings

### Form
URL  | Page description
--- | --- 
`/forms/:id`<br>`/forms/:id?token=...` | Form filling page;<br>***token** is used for automatic mailing*
`/forms/:id/settings` | Form settings
`/forms/:id/preview` | Form preview
`/forms/:id/editing` | Form editing page
`/forms/:id/responses` | Answers to the specified form

### Response
URL  | Page description
--- | --- 
`/responses/:id` | Response specified by id

----------
## API
## Authentication
### Sign in
**URL** : `/api/v1/session`\
**Method**:  `POST`\
**Request body**:
```ts
{
  email: string
  password: string
}
```
**Response**: 200 | 404

---
### Sign out
**URL** : `/api/v1/session`\
**Method**:  `DELETE`\
**Request body**: `{}`\
**Response**: 200

---

### Reset password
*Send to the specified email link to resetting password.*
**URL** : `/api/v1/user/password`\
**Method**:  `PUT`\
**Request body**:
```ts
{
  email: string
  reset: boolean // required
}
```
**Response**: 200 | 404

---
### Get new password
*Generate new password and send it to the email.*
**URL** : `/api/v1/user/password`\
**Query params**:
```ts
token: string // required
```
**Method**:  `GET`\
**Response**: `200 | 404`

---
## Recipients
```ts
interface Recipient (
  id: number
  email: string
  type: enum {'rcpt', 'user', 'org'}
  active: boolean
  created: Date
  updated: Date
  authorId: number // user who made the last update
)
```
---
### Email verification
**URL**: `/api/v1/recipients/verification`\
**Method**: `POST`\
**Request Body**: 
```ts
{
  email: string
  // is available for new user/org or for mailing
  mode: enum { 'signUp', 'mailing' } // required
}
```
**Response body**:
```ts
{
  email: string
  verified: boolean // does email exist?
  available: boolean // is available for new user/org signup or mailing
}
```
---
### Create
**URL**: `/api/v1/recipients`\
**Method**: `POST`\
**Request Body**:
```ts
{ email: string }
```
**Response body**: `rcpt: Recipient`

---
### Get by id
**URL**: `/api/v1/recipients/:id`\
**Method**: `GET`\
**Response body**: `rcpt: Recipient`

---
### Get by email
**URL**: `/api/v1/recipients/search`\
**Method**: `POST`\
**Request Body**:
```ts
{ email: string }
```
**Response body**: `rcpt: Recipient`

---
### Update
**URL**: `/api/v1/recipients/:id`\
**Method**: `PATCH`\
**Request Body**:
```ts
{
  email: string
  active: boolean
}
```
**Response body**: `rcpt: Recipient`

---
## Organizations
```ts
interface Org {
  id: number
  email: string
  active: boolean
  parentId: number
  created: Date
  updated: Date
  authorId: number
  ...info // { label, shortName, fullName, ... }
}
```
### Create
**Method**:  POST
**URL** : `/api/v1/orgs`\
**Request body**:
```ts
{
  email: string
  ...info // { label, shortName, fullName, ... }
}
```
**Response**: `org: Org`

---
### Get
**URL**: `/api/v1/orgs/:id`\
**Method**: `GET`\
**Response body**: `org: Org`

---
### Update
**URL**: `/api/v1/orgs/:id`\
**Method**: `PATCH`\
**Request Body**:
```ts
{
  email: string
  active: boolean
  parentId: integer // deferred
  ...info
}
```
**Response body**: `org: Org`

---
### Get subordinate organizations
**URL**: `/api/v1/orgs/:id/orgs`\
**Method**: `GET`\
**Query params**:
```ts
active: boolean
search: string
minDepth: number // default 1
maxDepth: number // default null - no limit
```
**Response body**:
```ts
{  
  list: {
    entries: number[] // list of ids
    count: number
  }
  entities: { [id: number]: Org }
}
```
---
### Get users of subordinate organizations
**URL**: `/api/v1/orgs/:id/users`\
**Method**: `GET`\
**Query params**:
```ts
active: boolean // relative to users
search: string
role: enum { 'root', 'admin', 'user', 'respondent' }
minDepth: number // default 1
maxDepth: number // default null - no limit
```
**Response body**:
```ts
{
  list: {
    entries: number[] // list of ids
    count: number
  }
  entities: { [id: number]: User }
}
```
---
### Get forms of the organization
**URL**: `/api/v1/orgs/:id/forms`\
**Method**: `GET`\
**Query params**:
```ts
search: string
// time interval
minDate: Date // default null
maxDate: Date // default now()
```
**Response body**:
```ts
{  
  list: {
    entries: number[] // list of ids
    count: number
  entities: { [id: number]: Form } 
}
```
---

## Users
```ts
interface User {
  id: number
  email: string
  role: enum { 'root', 'admin', 'user', 'respondent' }
  active: boolean
  orgId: number
  created: Date
  updated: Date
  authorId: number
  ...info // { firstName, lastName, Patronomyc, ... }
}
```
### Create
**Method**:  `POST`\
**URL** : `/api/v1/users`\
**Request body**:
```ts
{
  email: string
  role enum
  orgId: number
  ...info // { firstName, lastName, Patronomyc, ... }
}
```
**Response**: `usr: User`

---
### Get
**URL**: `/api/v1/users/:id`\
**Method**: `GET`\
**Response body**: `usr: User`

---
### Update
**URL**: `/api/v1/users/:id`\
**Method**: `PATCH`\
**Request Body**:
```ts
{
  email: string
  active: boolean
  role: string // deferred
  ...info
}
```
**Response body**: `usr: User`

---
## Forms
```ts
interface Item {
  title: string
  type: enum {
    'delimeter',
    'string', 'paragraph',
    'integer', 'float', 'financial',
    'select',
    'date', 'time', 'datetime'
  }
  required: boolean
};

interface Scheme {
  title: string
  items: Item[]
};

interface Settings {
  shareable: boolean
  recipients: number[] // ids list
  expire: Date
};

interface Form {
  id: number
  scheme: Scheme
  settings: Settings
  orgId: number
  userId: number // owner
  created: Date
  updated: Date
  deleted: Date
  authorId: number // user who made the last update
};
```
### Create
**Method**:  `POST`\
**URL** : `/api/v1/forms`\
**Request body**:
```ts
{ scheme: Scheme }
```
**Response**: `form: Form`

---
### Get
**URL**: `/api/v1/forms/:id`\
**Method**: `GET`\
**Response body**: `form: Form`

---
### Update
**URL**: `/api/v1/forms/:id`\
**Method**: `PATCH`\
**Request Body**:
```ts
{
  action: 'update'
  scheme: Scheme
}
```
**Response body**: `form: Form`

---
### Send
**URL**: `/api/v1/forms/:id`\
**Method**: `PATCH`\
**Request Body**:
```ts
{
  action: 'send'
  settings: Settings
}
```
**Response body**: `form: Form`

---
### Delete
**URL**: `/api/v1/forms/:id`\
**Method**: `PATCH`\
**Request Body**:
```ts
{ action: 'delete' } // soft deletion
```
**Response body**: `form: Form`

---
