INSERT INTO "users" ("name", "email", "password_hash", "role", "created_at") VALUES
('Alice Johnson',	'alice@example.com',	'$argon2id$v=19$m=65536,t=3,p=4$uQ1Zbkt6XxjC7NZBS4xdKQ$fkDhf2v8EEJ1QYIDR/fnVuE0oGRXm9LGLacmVfb4UCk',	'user',	'2026-03-23 09:23:18.023506+00'),
('Admin',	'admin@example.com',	'$argon2id$v=19$m=65536,t=3,p=4$j78G0ZvmX/OCYXh4bGiIhA$4SJTy6VCFWmci/enGHMBQAuNEL8g68zDGz8n5f/dlJM',	'admin',	'2026-03-23 09:24:12.921599+00')
ON CONFLICT DO NOTHING;

INSERT INTO "topics" ("id", "name") VALUES
(1,	'Технологии'),
(2,	'Наука'),
(3,	'Искусство'),
(4,	'Спорт'),
(5,	'Путешествия')
ON CONFLICT DO NOTHING;;