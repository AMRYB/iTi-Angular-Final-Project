# 🍞 Bakery Project

This is the **README** for our ITI Summer Training graduation project.
We successfully completed the project, which was a hands-on application of everything we learned.

## 🛠️ Tech Stack

* **HTML, CSS, JavaScript**
* **ES.Next** (validation + modern features)
* **Bootstrap** (for responsive design)
* **Angular** (routing, components, data binding)
* **JSON Server** (mock backend API)

## 📌 Features

* **Dashboard**

  * Add/manage items (cakes, bread, cookies, etc.)
* **Team Page**

  * Show team members (names, photos, social accounts for contact)
* **Routing**

  * Smooth navigation between pages
  * Connected with **JSON Server** for CRUD operations

## 🏠 Pages

* **Home**
* **About**
* **Products** (core functionality: search, add, filter)
* **Contact**
* **Cart** (manage added products + checkout)


---

## Sequence Diagram(s)

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  participant UI as Admin UI (index.html)
  participant JS as script.js
  participant API as JSON-Server (/categories,/product)

  U->>UI: Load Admin
  UI->>JS: init()
  JS->>API: GET /categories, GET /product (parallel)
  API-->>JS: categories[], product[]
  JS->>UI: hydrate selects, table, stats

  U->>UI: Add/Edit/Delete Product/Category
  UI->>JS: submit action
  JS->>API: POST/PATCH/DELETE
  API-->>JS: 2xx/4xx
  JS->>UI: update in-memory, re-render table/stats
  JS-->>U: show message
```

```mermaid
sequenceDiagram
  autonumber
  actor U as Shopper
  participant PC as ProductComponent
  participant PS as ProductService (HttpClient)
  participant CS as CartService
  participant CC as CartComponent
  participant API as JSON-Server

  U->>PC: View Products
  PC->>PS: getAll()
  PS->>API: GET /product
  API-->>PS: products[]
  PS-->>PC: Observable<products[]>
  PC->>U: Render grid

  U->>PC: Click "Add to cart"
  PC->>CS: add(product, qty=1)

  U->>CC: Open Cart
  CC->>CS: getItems(), getSubTotal(), getGrandTotal(includeShipping)
  CC->>U: Render items, totals
  U->>CC: Update qty / Remove
  CC->>CS: updateQty/remove
  CS-->>CC: updated totals
  CC->>U: Show new totals
```

---

## 🎯 Goal

The project simulates an **online bakery store**, where users can browse products, add them to the cart, and manage their shopping process.

## 🤝 Team

Special thanks to my amazing team for the effort and collaboration we put in to deliver the project in the best way possible.
**We’re proud of what we achieved 🙌**
