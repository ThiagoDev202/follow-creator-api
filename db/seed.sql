INSERT INTO users (id, name) VALUES (1, 'Ana'), (2, 'Bruno'), (3, 'Carla')
ON CONFLICT (id) DO NOTHING;
INSERT INTO creators (id, name) VALUES (1, 'Luna Prado'), (2, 'Mel Duarte')
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));
SELECT setval(pg_get_serial_sequence('creators', 'id'), (SELECT MAX(id) FROM creators));
