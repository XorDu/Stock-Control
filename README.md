<div align="center">

# ðŸ“¦ Stock Control

### Inventory Management System for Canteens

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

</div>

---

## ðŸ“‹ About

**Stock Control** is a full-featured inventory management system designed for canteens and small businesses. Built with a Node.js/Express backend and MySQL database, it provides an intuitive interface to manage products, track inventory levels, and handle stock operations efficiently.

## âœ¨ Features

- ðŸ“Š **Real-time inventory tracking** â€” Monitor stock levels at a glance
- âž• **CRUD operations** â€” Create, read, update, and delete products
- ðŸ”„ **Batch management** â€” Track product lots and batches
- ðŸ“ˆ **Reports** â€” Generate inventory reports
- ðŸ” **Secure** â€” Environment-based configuration with dotenv

## ðŸ› ï¸ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js |
| **Database** | MySQL |
| **Auth** | dotenv for config |
| **API** | RESTful API with CORS support |

## ðŸš€ Getting Started

### Prerequisites
- Node.js (v14+)
- MySQL Server

### Installation

```bash
# Clone the repository
git clone https://github.com/XorDu/Stock-Control.git
cd Stock-Control

# Install dependencies
npm install

# Initialize the database
npm run init-db

# Start the server
npm start
```

### Environment Variables

Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=stock_control
PORT=3000
```

## ðŸ“ Project Structure

```
Stock-Control/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ backend/
â”‚   â”‚   â”œâ”€â”€ server.js          # Express server entry point
â”‚   â”‚   â””â”€â”€ scripts/
â”‚   â”‚       â”œâ”€â”€ init-db.js     # Database initialization
â”‚   â”‚       â””â”€â”€ migrate_lote_id.js  # Migration scripts
â”œâ”€â”€ docs/                      # Documentation
â”œâ”€â”€ package.json
â””â”€â”€ .gitignore
```

## ðŸ¤ Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/XorDu/Stock-Control/issues).

## ðŸ“„ License

This project is [ISC](https://opensource.org/licenses/ISC) licensed.

---

<div align="center">
Made with â¤ï¸ by <a href="https://github.com/XorDu">XorDu</a>
</div>