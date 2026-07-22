CREATE TABLE keywords (
    id BIGINT NOT NULL AUTO_INCREMENT,
    keyword VARCHAR(255) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uk_keywords_keyword (keyword)
);