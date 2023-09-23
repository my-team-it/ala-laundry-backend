-- to create a new database
-- CREATE DATABASE alatest;

-- to use database
use alaprod;

-- creating a new table
CREATE TABLE room (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  address VARCHAR(100) NOT NULL
);

-- creating a new table
CREATE TABLE machine (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  room_id INT UNSIGNED NOT NULL,
  INDEX (room_id),
  FOREIGN KEY (room_id) REFERENCES room(id)
);

CREATE TABLE machine_timer (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  prev_timer INT,
  current_timer INT,
  machine_id INT UNSIGNED NOT NULL,
  INDEX(machine_id),
  FOREIGN KEY (machine_id) REFERENCES machine(id)
);

CREATE TABLE mode (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price INT UNSIGNED NOT NULL,
  duration INT UNSIGNED NOT NULL
);

-- creating a new table
CREATE TABLE washing (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_timer_val INT,
  is_door_open BOOLEAN,
  state VARCHAR(10),
  mode_id INT UNSIGNED NOT NULL,
  machine_id INT UNSIGNED NOT NULL,
  INDEX(mode_id),
  INDEX(machine_id),
  FOREIGN KEY (mode_id) REFERENCES mode(id),
  FOREIGN KEY (machine_id) REFERENCES machine(id)
);

-- creating a new table
CREATE TABLE payment (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  txn_id INT UNSIGNED NOT NULL,
  prv_txn_id INT UNSIGNED NOT NULL,
  sum INT UNSIGNED NOT NULL,
  status VARCHAR(10) NOT NULL
);

-- creating a new table
CREATE TABLE transaction (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  washing_id INT UNSIGNED NOT NULL,
  payment_id INT UNSIGNED NOT NULL,
  INDEX(washing_id),
  INDEX(payment_id),
  FOREIGN KEY (washing_id) REFERENCES washing(id),
  FOREIGN KEY (payment_id) REFERENCES payment(id)
);

-- to show all tables
show tables;
