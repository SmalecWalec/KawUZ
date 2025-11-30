INSERT INTO product (name, description, product_available, stock_quantity, price, latitude, longitude) VALUES
('Ethiopian Yirgacheffe', 'Jasno palone ziarna kawy o nutach kwiatowych i cytrusowych', TRUE, 50, 18.99, 11.131292572618213, 39.63332243789144),
('Colombian Supremo', 'Średnio palona kawa o zrównoważonym, czekoladowym smaku', TRUE, 40, 16.49, 6.257061297796658, -75.57821640541698),
('Sumatra Mandheling', 'Ciemno palone ziarna o ziemistym i pełnym smaku', TRUE, 30, 19.99, -2.93679456641907, 104.74802398392089),
('Kenya AA', 'Jasna i owocowa kawa o średnim stopniu palenia', TRUE, 25, 21.50, 0.5461332972177011, 35.24012546356892);

INSERT INTO users (username, password, email, is_admin) VALUES ('admin', 'admin', 'admin@kawuz.pl', 1);
INSERT INTO users (username, password, email, is_admin) VALUES ('user', 'user', 'user@kawuz.pl', 0);
