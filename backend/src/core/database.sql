CREATE TABLE IF NOT EXISTS professors (
    prof_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prof_name VARCHAR(50) NOT NULL,
    university VARCHAR(100),
    academic_rank VARCHAR(20),
    average_rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (average_rating >= 1.0 AND average_rating <= 5.0) 
);

CREATE TABLE IF NOT EXISTS courses (
    course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(255) NOT NULL 
);

CREATE TABLE IF NOT EXISTS reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(course_id) ON UPDATE CASCADE, 
    professor_id UUID REFERENCES professors(prof_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
 
INSERT INTO professors (prof_name, university, academic_rank, average_rating) VALUES
('Dr. Nguyen Van Quang', 'Hanoi University of Science and Technology', 'Associate Professor', 4.5),
('Prof. Le Thi Minh', 'Vietnam National University', 'Professor', 4.8),
('Dr. Pham Duc Lam', 'FPT University', 'Lecturer', 3.9),
('Dr. Tran Hoang Nam', 'RMIT Vietnam', 'Senior Lecturer', 4.2),
('Ms. Hoang Bao Chau', 'Bach Khoa University', 'Lecturer', 4.1);
INSERT INTO courses (course_code, course_name) VALUES
('CS101', 'Introduction to Computer Science'),
('CS202', 'Data Structures and Algorithms'),
('AI301', 'Artificial Intelligence & Machine Learning'),
('SYS404', 'Operating Systems (Arch Linux focus)'),
('DB505', 'Advanced Database Systems'),
('RUST101', 'Systems Programming with Rust');
