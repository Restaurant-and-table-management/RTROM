DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS menu_categories;

CREATE TABLE menu_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(500)
);

CREATE TABLE menu_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    category_id BIGINT NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_special BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_menu_item_category FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);
