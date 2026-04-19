CREATE TABLE menu_categories (
    category_id BIGSERIAL PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL,
    display_order INT NOT NULL
);

CREATE TABLE menu_items (
    item_id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    is_vegetarian BOOLEAN NOT NULL DEFAULT FALSE,
    image_url VARCHAR(255),
    CONSTRAINT fk_menu_item_category FOREIGN KEY (category_id) REFERENCES menu_categories(category_id)
);
