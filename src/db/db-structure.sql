CREATE TABLE Casual (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE Branch (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE Shift (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    branch_id INTEGER NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES Branch(id)
);

CREATE TABLE Available (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    casual_id INTEGER NOT NULL,
    shift_id INTEGER NOT NULL,
    FOREIGN KEY (casual_id) REFERENCES Casual(id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES Shift(id) ON DELETE CASCADE
);

INSERT INTO Branch (name) VALUES 
    ("Beacock"),
    ("Bostwick"),
    ("Byron"),
    ("Carson"),
    ("Cherryhill"),
    ("Childrens"),
    ("CIF"),
    ("Cherryhill"),
    ("East London"),
    ("Glanworth"),
    ("Jalna"),
    ("Lambeth"),
    ("Landon"),
    ("Lending"),
    ("Masonville"),
    ("Pond Mills"),
    ("Sherwood"),
    ("Stoney Creek");
