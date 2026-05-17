# Nest URL Shortener (Backend)

API-сервис для создания коротких ссылок с редиректом и счетчиком кликов.

## Стек

- NestJS + TypeScript
- Prisma + PostgreSQL
- Redis (кэш)

## Возможности

- Создание короткой ссылки вида `{HOST}/{uid}`
- Редирект по `GET /:uid` с инкрементом кликов
- CRUD для ссылок (защищено API-ключом)
- Пагинация и текстовый фильтр для списка ссылок

## Быстрый старт (локально)

1. Установить зависимости:

```bash
npm install
```

2. Создать `.env` на базе примера:

```bash
copy .env.example .env
```

3. Поднять зависимости и запустить приложение в watch-режиме:

```bash
npm run start:dev
```

4. Применить миграции Prisma:

```bash
npm run db:migrate:dev
```

По умолчанию приложение слушает `PORT=3000` (если переменная не задана).

## Переменные окружения

См. [`.env.example`](./.env.example). Ключевые:

- `DATABASE_URL` — строка подключения к PostgreSQL (используется Prisma)
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD` — подключение к Redis
- `HOST` — публичный базовый хост для генерации коротких ссылок (например `localhost:3000`)
- `API_KEY` — ключ для защищённых эндпоинтов (заголовок `x-api-key`)
- `PORT` — порт, на котором стартует NestJS (опционально)

## API

### Публичный редирект

- `GET /:uid` → 302 redirect на исходный `redirect`, увеличивает `clicks`

### Защищённые (нужен заголовок `x-api-key: ${API_KEY}`)

- `POST /url` — создать короткую ссылку
- `GET /url` — получить список (query: `page`, `limit`, `filter`)
- `PATCH /url/:uid` — обновить (title/description/redirect)
- `DELETE /url/:uid` — удалить

Пример создания:

```bash
curl -X POST http://localhost:3000/url ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: YOUR_API_KEY" ^
  -d "{\"redirect\":\"https://example.com\",\"title\":\"Example\",\"description\":\"optional\"}"
```

## Тесты

Юнит-тесты:

```bash
npm run test
```

E2E:

1. Создать `.env.test` (аналогично `.env`) и указать тестовые порты/БД
2. Запустить:

```bash
npm run test:e2e
```
