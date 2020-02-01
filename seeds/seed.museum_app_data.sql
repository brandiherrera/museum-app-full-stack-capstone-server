-- TRUNCATE 
--     museum_art_data,
--     users_comments
--     RESTART IDENTITY CASCADE;

-- INSERT INTO museum_art_data (object_id, primary_image, art_title, art_artist, art_date) VALUES
--     (436535, 'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg', 'Wheat Field with Cypresses', 'Vincent van Gogh', '1889'),
--     (437835, 'https://images.metmuseum.org/CRDImages/ep/original/DT1500.jpg', 'The Englishman (William Tom Warrener, 1861–1934) at the Moulin Rouge', 'Henri de Toulouse-Lautrec', '1892');
--     (438012, 'https://images.metmuseum.org/CRDImages/ep/original/DT1877.jpg', 'Bouquet of Chrysanthemums', 'Auguste Renoir', '1881'),
--     (335537, 'https://images.metmuseum.org/CRDImages/dp/original/DP108507.jpg', 'Drawings and Prints', 'Vincent van Gogh', '1888');



TRUNCATE 
    museum_users,
    museum_art_data,
    users_comments
    RESTART IDENTITY CASCADE;

INSERT INTO museum_users (first_name, last_name, user_name, email, password)
VALUES
    ('Test', 'Demo', 'iloveART', 'demo@test.com', '$2a$12$JN0JlQ2LtkmGxwUVL.oFh.OP9liWyY7m..VLOOmEKruHgTOef5GL.'),
    ('Michael', 'Scott', 'dunder_REGIONAL_MGR', 'michael@dunder.com', '$2a$12$JN0JlQ2LtkmGxwUVL.oFh.OP9liWyY7m..VLOOmEKruHgTOef5GL.'),
    ('Dwight', 'Schrute', 'DWIGHT', 'dwight@dunder.com', '$2a$12$eObnq8BJ.8TJWZv9fSRgAecJdebfCfjiXGiWxDj8pN4OH9bSDU4jm'),
    ('Pam', 'Beesly', 'pambeesly', 'pam@dunder.com', '$2a$12$22M9ve9IbaqChSsa/aEw0OkSCGtqu4UglPICmtqXpnIm4LQ/jp3OC');

INSERT INTO museum_art_data (object_id, primary_image, art_title, art_artist, art_date) VALUES
    (300, 'https://images.metmuseum.org/CRDImages/ad/original/69178.jpg', 'Balcony', '', '1800-1830'),
    (4000, 'https://images.metmuseum.org/CRDImages/ad/original/112937.jpg', 'Fragment', '', '1700-1800'),
    (436535, 'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg', 'Wheat Field with Cypresses', 'Vincent van Gogh', '1889'),
    -- (436, 'https://images.metmuseum.org/CRDImages/ep/original/DT1567.jpg', 'Wheat Field with Cypresses', 'Vincent van Gogh', '1889'),
    (438012, 'https://images.metmuseum.org/CRDImages/ep/original/DT1877.jpg', 'Bouquet of Chrysanthemums', 'Auguste Renoir', '1881');

INSERT INTO users_comments (art_id, user_id, user_name, comment) VALUES
    (436535, 2, 'dunder_REGIONAL_MGR', 'This is fantastic! I should put it in my office at Dunder Mifflin!!'),
    (436535, 3, 'DWIGHT', 'I agree, Michael. You should.'),
    -- (436, 2, 'This is fantastic! I should put it in my office at Dunder Mifflin!!'),
    -- (436, 3, 'I agree, Michael. You should.'),
    (438012, 4, 'pambeesly', 'So beautiful, I love art so much <3');

INSERT INTO users_gallery (art_id, user_id, user_name ) VALUES
    (436535, 2, 'dunder_REGIONAL_MGR' ),
    (436535, 3, 'DWIGHT'),
    (438012, 2, 'dunder_REGIONAL_MGR' );