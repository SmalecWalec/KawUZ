INSERT INTO product (name, description, product_available, stock_quantity, price, map) VALUES
('Tanzania Peaberry', 'Wyjątkowe ziarna Peaberry, średnio palone, o złożonym owocowym smaku', TRUE, 20, 22.99, 'Tanzania%20PeaberryTanzaniaTanzania'),
('Ethiopian Yirgacheffe', 'Jasno palone ziarna kawy o nutach kwiatowych i cytrusowych', TRUE, 50, 18.99, 'Ethiopian%20Yirgacheffe%2C%20Addis%20Ababa%2C%20Etiopia'),
('Brazilian Santos', 'Łagodna, średnio palona kawa o niskiej kwasowości i kremowym smaku', TRUE, 60, 15.99, 'Churrasco%20do%20Cear%C3%A1%20R.%20Barcelos%2C%2010%20-%20Atroari%2C%20Pres.%20Figueiredo%20-%20AM%2C%2069735-000%2C%20Brazylia'),
('Sumatra Mandheling', 'Ciemno palone ziarna o ziemistym i pełnym smaku', TRUE, 30, 19.99, 'Sumatra%20Mandheling%2C%20Jagakarsa%2C%20D%C5%BCakarta%09Indonezja'),
('Kenya AA', 'Jasna i owocowa kawa o średnim stopniu palenia', TRUE, 25, 21.50, 'Dunga%20Hill%20Camp%20Kisumu%2C%20Kenia'),
('Guatemalan Antigua', 'Pełna, średnio palona kawa z nutami kakao i przypraw', TRUE, 45, 18.25, 'Compro%20do%C3%B1a%20Sofia%2045JW%2B63V%2C%20Tejutla%2C%20Gwatemala'),
('Costa Rican Tarrazú', 'Delikatna kawa o jasnym paleniu z nutami brązowego cukru i orzechów', TRUE, 35, 17.75, 'Mirador%20Tiquicia%20Bebedero%2C%20San%20Antonio%2C%20Kostaryka'),
('Colombian Supremo', 'Średnio palona kawa o zrównoważonym, czekoladowym smaku', TRUE, 40, 16.49, 'Colombian%20Supremo%2C%20Bogot%C3%A1%2C%20Kolumbia');

INSERT INTO users (username, password, email, is_admin) VALUES ('admin', 'admin', 'admin@kawuz.pl', 1);
INSERT INTO users (username, password, email, is_admin) VALUES ('user', 'user', 'user@kawuz.pl', 0);
