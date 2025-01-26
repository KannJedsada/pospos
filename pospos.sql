CREATE SEQUENCE IF NOT EXISTS categories_id_seq;

CREATE TABLE "public"."categories" (
    "id" int4 NOT NULL DEFAULT nextval('categories_id_seq' :: regclass),
    "category_name" varchar(100),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS departments_id_seq;

CREATE TABLE "public"."departments" (
    "id" int4 NOT NULL DEFAULT nextval('departments_id_seq' :: regclass),
    "dept_name" varchar(100),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS dish_status_id_seq;

CREATE TABLE "public"."dish_status" (
    "id" int4 NOT NULL DEFAULT nextval('dish_status_id_seq' :: regclass),
    "status_name" varchar(50),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS positions_id_seq;

CREATE TABLE "public"."positions" (
    "id" int4 NOT NULL DEFAULT nextval('positions_id_seq' :: regclass),
    "p_name" varchar(100),
    "dept_id" int4,
    "start_time" varchar(255),
    "end_time" varchar(255),
    CONSTRAINT "positions_dept_id_fkey1" FOREIGN KEY ("dept_id") REFERENCES "public"."departments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."employees" (
    "id_card" varchar(20) NOT NULL,
    "f_name" varchar(100),
    "l_name" varchar(100),
    "emp_phone" varchar(20),
    "emp_mail" varchar(100),
    "house_number" varchar(100),
    "road" varchar(100),
    "subdistrict" varchar(100),
    "district" varchar(100),
    "province" varchar(100),
    "zipcode" varchar(10),
    "p_id" int4,
    "start_date" date,
    "access" int4,
    CONSTRAINT "employees_p_id_fkey1" FOREIGN KEY ("p_id") REFERENCES "public"."positions"("id") ON DELETE
    SET
        NULL,
        PRIMARY KEY ("id_card")
);

CREATE SEQUENCE IF NOT EXISTS units_id_seq;

CREATE TABLE "public"."units" (
    "id" int4 NOT NULL DEFAULT nextval('units_id_seq' :: regclass),
    "u_name" varchar(255),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS menu_categories_id_seq;

CREATE TABLE "public"."menu_categories" (
    "id" int4 NOT NULL DEFAULT nextval('menu_categories_id_seq' :: regclass),
    "category_name" varchar(100),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS materials_id_seq;

CREATE TABLE "public"."materials" (
    "id" int4 NOT NULL DEFAULT nextval('materials_id_seq' :: regclass),
    "m_name" varchar(100),
    "m_img" varchar(255),
    "unit" int4,
    "is_composite" bool DEFAULT false,
    "material_category" int4,
    CONSTRAINT "materials_unit_fkey" FOREIGN KEY ("unit") REFERENCES "public"."units"("id"),
    CONSTRAINT "category_fk" FOREIGN KEY ("material_category") REFERENCES "public"."categories"("id"),
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."material_composition" (
    "composite_material_id" int4 NOT NULL,
    "material_id" int4 NOT NULL,
    "quantity_used" numeric(10, 2),
    "unit_id" int4,
    CONSTRAINT "material_composition_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id"),
    CONSTRAINT "material_composition_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id"),
    CONSTRAINT "material_composition_composite_material_id_fkey1" FOREIGN KEY ("composite_material_id") REFERENCES "public"."materials"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("composite_material_id", "material_id")
);

CREATE TABLE "public"."material_prices" (
    "material_id" int4 NOT NULL,
    "price" numeric(10, 2),
    "effective_date" timestamp NOT NULL,
    CONSTRAINT "material_prices_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id"),
    PRIMARY KEY ("material_id", "effective_date")
);

CREATE SEQUENCE IF NOT EXISTS menu_status_id_seq;

CREATE TABLE "public"."menu_status" (
    "id" int4 NOT NULL DEFAULT nextval('menu_status_id_seq' :: regclass),
    "status_name" varchar(100),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS menu_type_id_seq;

CREATE TABLE "public"."menu_type" (
    "id" int4 NOT NULL DEFAULT nextval('menu_type_id_seq' :: regclass),
    "typename" varchar(50),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS menus_menu_id_seq;

CREATE TABLE "public"."menus" (
    "menu_id" int4 NOT NULL DEFAULT nextval('menus_menu_id_seq' :: regclass),
    "menu_name" varchar(100),
    "menu_img" varchar(255),
    "menu_category" int4,
    "menu_status" int4 DEFAULT 1,
    "menu_type" int4,
    CONSTRAINT "menus_menu_category_fkey" FOREIGN KEY ("menu_category") REFERENCES "public"."menu_categories"("id"),
    CONSTRAINT "menus_menu_status_fkey" FOREIGN KEY ("menu_status") REFERENCES "public"."menu_status"("id"),
    CONSTRAINT "menus_menu_type_fkey" FOREIGN KEY ("menu_type") REFERENCES "public"."menu_type"("id"),
    PRIMARY KEY ("menu_id")
);

CREATE TABLE "public"."menu_ingredients" (
    "menu_id" int4 NOT NULL,
    "material_id" int4 NOT NULL,
    "quantity_used" float8,
    "unit_id" int4,
    CONSTRAINT "menu_ingredients_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id"),
    CONSTRAINT "menu_ingredients_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("menu_id") ON DELETE CASCADE,
    CONSTRAINT "menu_ingredients_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE CASCADE,
    PRIMARY KEY ("menu_id", "material_id")
);

CREATE SEQUENCE IF NOT EXISTS menu_price_id_seq;

CREATE TABLE "public"."menu_price" (
    "id" int4 NOT NULL DEFAULT nextval('menu_price_id_seq' :: regclass),
    "menu_id" int4,
    "price" float8,
    "date_start" date,
    "date_end" date,
    CONSTRAINT "menu_price_menu_id_fkey1" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("menu_id") ON DELETE CASCADE,
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS table_status_id_seq;

CREATE TABLE "public"."table_status" (
    "id" int4 NOT NULL DEFAULT nextval('table_status_id_seq' :: regclass),
    "status_name" varchar(50),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS tables_id_seq;

CREATE TABLE "public"."tables" (
    "id" int4 NOT NULL DEFAULT nextval('tables_id_seq' :: regclass),
    "t_name" varchar(10),
    "status_id" int4,
    CONSTRAINT "fk_status_id" FOREIGN KEY ("status_id") REFERENCES "public"."table_status"("id"),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS payment_status_id_seq;

CREATE TABLE "public"."payment_status" (
    "id" int4 NOT NULL DEFAULT nextval('payment_status_id_seq' :: regclass),
    "status_name" varchar(50),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS orders_id_seq;

CREATE TABLE "public"."orders" (
    "id" int4 NOT NULL DEFAULT nextval('orders_id_seq' :: regclass),
    "total_qty" int4,
    "total_price" numeric(10, 2),
    "time_ordered" timestamp,
    "payment_status_id" int4 DEFAULT 1,
    CONSTRAINT "orders_payment_status_id_fkey" FOREIGN KEY ("payment_status_id") REFERENCES "public"."payment_status"("id"),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS order_detail_id_seq;

CREATE TABLE "public"."order_detail" (
    "id" int4 NOT NULL DEFAULT nextval('order_detail_id_seq' :: regclass),
    "order_id" int4,
    "menu_id" int4,
    "qty" int4,
    "table_id" int4,
    "dish_status" int4 DEFAULT 1,
    "price" float8,
    CONSTRAINT "order_detail_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id"),
    CONSTRAINT "order_detail_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("menu_id"),
    CONSTRAINT "order_detail_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id"),
    CONSTRAINT "order_detail_dish_status_fkey" FOREIGN KEY ("dish_status") REFERENCES "public"."dish_status"("id"),
    PRIMARY KEY ("id")
);



CREATE SEQUENCE IF NOT EXISTS promotions_id_seq;

CREATE TABLE "public"."promotions" (
    "id" int4 NOT NULL DEFAULT nextval('promotions_id_seq' :: regclass),
    "promo_name" varchar(100),
    "promo_discount" int4,
    "start_promo" date,
    "end_promo" date,
    "promo_type" varchar(20) NOT NULL,
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS qr_code_url_id_seq;

CREATE TABLE "public"."qr_code_url" (
    "id" int4 NOT NULL DEFAULT nextval('qr_code_url_id_seq' :: regclass),
    "qr_url" varchar(255),
    "date_create" timestamp,
    "qr_status" bool DEFAULT true,
    "table_id" int4,
    CONSTRAINT "qr_code_url_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id"),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS receipts_id_seq;

CREATE TABLE "public"."receipts" (
    "id" int4 NOT NULL DEFAULT nextval('receipts_id_seq' :: regclass),
    "table_id" int4,
    "id_card" varchar(20),
    "total_price" numeric(10, 2),
    "discount" numeric(10, 2),
    "final_price" numeric(10, 2),
    "amount_paid" numeric(10, 2),
    "change_amount" numeric(10, 2),
    "promo_id" int4,
    "created_at" timestamp,
    "updated_at" timestamp,
    "payment_status" int4 DEFAULT 1,
    CONSTRAINT "receipts_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id"),
    CONSTRAINT "receipts_id_card_fkey" FOREIGN KEY ("id_card") REFERENCES "public"."employees"("id_card"),
    CONSTRAINT "receipts_promo_id_fkey" FOREIGN KEY ("promo_id") REFERENCES "public"."promotions"("id"),
    CONSTRAINT "receipts_payment_status_fkey" FOREIGN KEY ("payment_status") REFERENCES "public"."payment_status"("id"),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS receipt_items_id_seq;

CREATE TABLE "public"."receipt_items" (
    "id" int4 NOT NULL DEFAULT nextval('receipt_items_id_seq' :: regclass),
    "receipt_id" int4,
    "order_id" int4,
    CONSTRAINT "receipt_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE,
    CONSTRAINT "receipt_items_receipt_id_fkey1" FOREIGN KEY ("receipt_id") REFERENCES "public"."receipts"("id") ON DELETE CASCADE,
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS stock_at_id_seq;

CREATE TABLE "public"."stock_at" (
    "id" int4 NOT NULL DEFAULT nextval('stock_at_id_seq' :: regclass),
    "timestamps" timestamp,
    "total_qty" numeric(10, 2),
    "total_price" numeric(10, 2),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS stock_at_detail_id_seq;

CREATE TABLE "public"."stock_at_detail" (
    "id" int4 NOT NULL DEFAULT nextval('stock_at_detail_id_seq' :: regclass),
    "stock_at_id" int4,
    "material_id" int4,
    "qty" numeric(10, 2),
    "unit_id" int4,
    "price" numeric(10, 2),
    "category_id" int4,
    CONSTRAINT "stock_at_detail_stock_at_id_fkey" FOREIGN KEY ("stock_at_id") REFERENCES "public"."stock_at"("id"),
    CONSTRAINT "stock_at_detail_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id"),
    CONSTRAINT "stock_at_detail_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id"),
    CONSTRAINT "stock_at_detail_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id"),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS stocks_id_seq;

CREATE TABLE "public"."stocks" (
    "id" int4 NOT NULL DEFAULT nextval('stocks_id_seq' :: regclass),
    "material_id" int4,
    "qty" numeric(10, 3),
    "min_qty" numeric(10, 3),
    "category_id" int4,
    CONSTRAINT "stocks_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id"),
    CONSTRAINT "fk_material" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS timestamps_id_seq;

CREATE TABLE "public"."timestamps" (
    "id" int4 NOT NULL DEFAULT nextval('timestamps_id_seq' :: regclass),
    "id_card" varchar(100),
    "check_in" time,
    "check_out" time,
    "work_date" date,
    CONSTRAINT "timestamps_id_card_fkey" FOREIGN KEY ("id_card") REFERENCES "public"."employees"("id_card"),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS unit_conversions_id_seq;

CREATE TABLE "public"."unit_conversions" (
    "id" int4 NOT NULL DEFAULT nextval('unit_conversions_id_seq' :: regclass),
    "from_unit_id" int4,
    "to_unit_id" int4,
    "conversion_rate" numeric(10, 3),
    CONSTRAINT "unit_conversions_from_unit_id_fkey" FOREIGN KEY ("from_unit_id") REFERENCES "public"."units"("id"),
    CONSTRAINT "unit_conversions_to_unit_id_fkey" FOREIGN KEY ("to_unit_id") REFERENCES "public"."units"("id"),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS work_schedules_id_seq;

CREATE TABLE "public"."work_schedules" (
    "id" int4 NOT NULL DEFAULT nextval('work_schedules_id_seq' :: regclass),
    "id_card" varchar(100),
    "work_date" date,
    CONSTRAINT "work_schedules_id_card_fkey" FOREIGN KEY ("id_card") REFERENCES "public"."employees"("id_card"),
    PRIMARY KEY ("id")
);

CREATE SEQUENCE IF NOT EXISTS carts_id_seq;

CREATE TABLE "public"."carts" (
    "id" int4 NOT NULL DEFAULT nextval('carts_id_seq' :: regclass),
    "menu_id" int4,
    "qty" int4,
    "price" float8,
    "table_id" int4,
    "cart_status" int4 DEFAULT 1,
    CONSTRAINT "carts_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("menu_id"),
    CONSTRAINT "carts_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id"),
    PRIMARY KEY ("id")
);

INSERT INTO
    "public"."employees" (
        "id_card",
        "f_name",
        "l_name",
        "emp_phone",
        "emp_mail",
        "house_number",
        "road",
        "subdistrict",
        "district",
        "province",
        "zipcode",
        "p_id",
        "start_date",
        "access"
    )
VALUES
    (
        'admin',
        '',
        '',
        '',
        'admin',
        '',
        '',
        '',
        '',
        '',
        '',
        NULL,
        '2024-08-21',
        0
    );