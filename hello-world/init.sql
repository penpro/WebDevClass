CREATE DATABASE hello_app;

CREATE USER 'hello_user'@'localhost' IDENTIFIED BY 'ChangeThisPassword123!';

GRANT ALL PRIVILEGES ON hello_app.* TO 'hello_user'@'localhost';

FLUSH PRIVILEGES;

USE hello_app;

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text VARCHAR(255) NOT NULL
);

INSERT INTO messages (text) VALUES
('Hello from AWS MySQL'),
('This came through Node'),
('This is flowing into React');