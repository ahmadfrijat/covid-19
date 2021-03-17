DROP TABLE IF EXISTS corona;

CREATE TABLE corona(
    id SERIAL PRIMARY KEY,
    country VARCHAR(255),
    totalConfirmed VARCHAR(255),
    totalDeaths VARCHAR(255),
    totalRecovered VARCHAR(255),
    date VARCHAR(255)
)