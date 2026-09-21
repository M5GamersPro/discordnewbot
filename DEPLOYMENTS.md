# Customer deployments

deployments/
├── customer-a/
│   ├── .env       # ignored and private
│   └── data.db    # ignored and private
└── customer-b/
    ├── .env
    └── data.db

Each paid customer receives a separate local SQLite database and a separate environment file while running on the same host. The bot process and token are isolated per customer deployment. Customer tokens are never stored in Prisma, GitHub, Discord messages, or logs.
