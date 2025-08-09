-- Trails
CREATE TABLE trails (
    id SERIAL PRIMARY KEY,
    name TEXT,
    length_km NUMERIC,
    difficulty TEXT,
    geom GEOMETRY(LineString, 4326)
);

-- Restrooms
CREATE TABLE restrooms (
    id SERIAL PRIMARY KEY,
    type TEXT,
    accessible BOOLEAN,
    geom GEOMETRY(Point, 4326)
);

-- Picnic Areas
CREATE TABLE picnic_areas (
    id SERIAL PRIMARY KEY,
    table_count INTEGER,
    has_grill BOOLEAN,
    geom GEOMETRY(Polygon, 4326)
);

-- Parking Lots
CREATE TABLE parking_lots (
    id SERIAL PRIMARY KEY,
    capacity INTEGER,
    surface_type TEXT,
    geom GEOMETRY(Polygon, 4326)
);

-- Scenic Points
CREATE TABLE scenic_points (
    id SERIAL PRIMARY KEY,
    name TEXT,
    description TEXT,
    image_name TEXT,
    geom GEOMETRY(Point, 4326)
);
