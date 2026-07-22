CREATE TABLE documents (
    id BIGINT NOT NULL AUTO_INCREMENT,
    doc_id VARCHAR(255),
    trace_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    categoria VARCHAR(255),
    probabilidad_categoria FLOAT,
    lenguage VARCHAR(100),
    version FLOAT,
    nivel VARCHAR(20),

    PRIMARY KEY (id),

    UNIQUE KEY uk_documents_doc_id (doc_id),
    INDEX idx_documents_trace_id (trace_id)
);