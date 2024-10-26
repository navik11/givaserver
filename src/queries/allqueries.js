const createGivaUserTable = `CREATE TABLE givauser (
    id SERIAL PRIMARY KEY,          -- Unique identifier for each user
    username VARCHAR(50) UNIQUE NOT NULL,  -- Username, must be unique
    password TEXT NOT NULL,         -- Password (hashed)
    email VARCHAR(100) UNIQUE NOT NULL,    -- Email, must be unique
    active BOOLEAN DEFAULT FALSE,   -- Whether the user is active or not
    fullName VARCHAR(100),          -- Full name of the user
    avatar TEXT,                    -- URL or path to the avatar image
    otp TEXT,                -- OTP for verification (if applicable)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the user was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- When the user was last updated
);
`;
const createGivaProductTable = `CREATE TABLE givaproduct (
    id SERIAL PRIMARY KEY,                      -- Unique ID for each product
    name VARCHAR(100) NOT NULL,                 -- Name of the jewelry product
    description TEXT,                           -- Description of the product
    price FLOAT(10, 2) NOT NULL,              -- Price of the jewelry, with 2 decimal places
    avatar TEXT,                                -- URL or path to the avatar image
    stock INT NOT NULL DEFAULT 0,               -- Quantity in stock
    material VARCHAR(50),                       -- Material (e.g., gold, silver, platinum)
    weight FLOAT(5, 2),                       -- Weight in grams
    gemstone VARCHAR(50),                       -- Type of gemstone if any (e.g., diamond, ruby)
    carat FLOAT(4, 2),                        -- Carat weight for gemstones
    size VARCHAR(10),                           -- Size, especially for rings (e.g., 6, 7, 8)
    type VARCHAR(50),                           -- Type of jewelry (e.g., necklace, ring, bracelet)
    rating FLOAT(3, 2) DEFAULT 0,             -- Average rating out of 5.00
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,      -- Timestamp for product creation
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Last updated time
);
`;

export const searchUser = `
    SELECT * FROM givauser
    WHERE email = $1 OR username = $2;
    `;

export const activateUser = `
  UPDATE givauser
  SET active = TRUE
  WHERE email = $1 OR username = $2
  RETURNING *;
`;