CREATE TABLE document_keywords (
    id BIGINT NOT NULL AUTO_INCREMENT,
    document_id BIGINT NOT NULL,
    keyword_id BIGINT NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_document_keywords_document
        FOREIGN KEY (document_id)
        REFERENCES documents(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_document_keywords_keyword
        FOREIGN KEY (keyword_id)
        REFERENCES keywords(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_document_keyword
        UNIQUE (document_id, keyword_id)
);