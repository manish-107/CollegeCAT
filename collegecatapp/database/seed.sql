-- Insert users
INSERT INTO users (name, email) VALUES
('Alice Johnson', 'alice@example.com'),
('Bob Smith', 'bob@example.com'),
('Charlie Davis', 'charlie@example.com');

-- Insert products
INSERT INTO products (name, price, stock) VALUES
('Laptop', 1200.50, 10),
('Smartphone', 699.99, 20),
('Headphones', 150.75, 30);

-- Insert orders
INSERT INTO orders (user_id, product_id, quantity) VALUES
(1, 2, 1),  -- Alice buys a Smartphone
(2, 1, 2),  -- Bob buys 2 Laptops
(3, 3, 5);  -- Charlie buys 5 Headphones
