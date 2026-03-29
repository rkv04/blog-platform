# Blog Platform — Backend

## Требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Первый запуск

**1. Клонировать репозиторий**

```bash
git clone <url>
cd backend
```

**2. Скопировать содержимое `.env.example` в `.env` и выполнить**

```bash
docker compose up -d --build
```

Бэкенд будет доступен на `http://localhost:3000`  
Adminer (управление БД) — `http://localhost:8080`  

Данные для входа в Adminer:  
``` 
System: PostgreSQL  
Server: db  
Username: admin  
Password: admin  
Database: blog_db  
```

## Разработка фронтенда

Фронтенд на `http://localhost:5173` будет делать запросы к бэкенду на `http://localhost:3000` — CORS настроен.

## Обновление бэкенда

### Если изменился исходный код (`./src`):

```bash
git pull
```

Сервер внутри контейнера подхватит изменения автоматически, перезапускать контейнер не нужно.

### Изменился `package.json` или `Dockerfile`:

```bash
git pull
docker compose up -d --build
```

## Сброс базы данных

Полный сброс — удаляет все данные иересоздаёт БД с нуля:

```bash
docker compose down -v
docker compose up -d --build
```

После запуска миграции и сид применятся автоматически.

## Тестовые пользователи

После первого запуска в БД будут созданы тестовые аккаунты:

1) admin@example.com  → admin1234 (админ)
2) alice@example.com  → password123 (пользователь)