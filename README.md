<div align="center">

# 📦 Stock Control

### Inventory Management System for Canteens

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

</div>

---

## 📋 About

**Stock Control** is a full-featured inventory management system designed for canteens and small businesses. Built with a Node.js/Express backend and MySQL database, it provides an intuitive interface to manage products, track inventory levels, and handle stock operations efficiently.

## ✨ Features

- 📊 **Real-time inventory tracking** — Monitor stock levels at a glance
- ➕ **CRUD operations** — Create, read, update, and delete products
- 🔄 **Batch management** — Track product lots and batches
- 📈 **Reports** — Generate inventory reports
- 🔐 **Secure** — Environment-based configuration with dotenv

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js |
| **Database** | MySQL |
| **Auth** | dotenv for config |
| **API** | RESTful API with CORS support |

## 🚀 Getting Started

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

## 📁 Project Structure

```
Stock-Control/
├── src/
│   ├── backend/
│   │   ├── server.js          # Express server entry point
│   │   └── scripts/
│   │       ├── init-db.js     # Database initialization
│   │       └── migrate_lote_id.js  # Migration scripts
├── docs/                      # Documentation
├── package.json
└── .gitignore
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/XorDu/Stock-Control/issues).

## 📄 License

This project is [ISC](https://opensource.org/licenses/ISC) licensed.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/XorDu">XorDu</a>
</div>
