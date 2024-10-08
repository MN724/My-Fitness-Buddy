SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT=0;

USE myfitnessbuddy;

-- -----------------------------------------------------
-- TABLES 
-- -----------------------------------------------------

CREATE TABLE Users (
    user_id INT NOT NULL AUTO_INCREMENT,
    display_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    firebase_uid VARCHAR(255) NOT NULL,
    avatar_id INT DEFAULT 1,
    created_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id),
    FOREIGN KEY (avatar_id)
        REFERENCES Avatars (avatar_id)
        ON UPDATE CASCADE
);

CREATE TABLE Surveys (
	survey_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    created_at TIMESTAMP,
    body_type_id INT,
    fitness_goal_id INT,
    fitness_level_id INT,
    equipment VARCHAR(255),
    PRIMARY KEY (survey_id),
    FOREIGN KEY (user_id)
		REFERENCES Users (user_id),
    FOREIGN KEY (body_type_id)
        REFERENCES Body_Types (body_type_id)
        ON UPDATE CASCADE,
    FOREIGN KEY (fitness_goal_id)
        REFERENCES Fitness_Goals (fitness_goal_id)
        ON UPDATE CASCADE,
    FOREIGN KEY (fitness_level_id)
        REFERENCES Fitness_Levels (fitness_level_id)
        ON UPDATE CASCADE
);

CREATE TABLE Body_Types (
	body_type_id INT AUTO_INCREMENT NOT NULL,
    body_type_name VARCHAR(25) NOT NULL,
    PRIMARY KEY (body_type_id)
);

CREATE TABLE Fitness_Goals (
	fitness_goal_id INT AUTO_INCREMENT NOT NULL,
    fitness_goal_name VARCHAR(25) NOT NULL,
    PRIMARY KEY (fitness_goal_id)
);

CREATE TABLE Fitness_Plans (
    fitness_plan_id INT AUTO_INCREMENT NOT NULL,
    user_id INT,
    fitness_plan_name VARCHAR(100),
    fitness_plan_desc TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (fitness_plan_id),
    FOREIGN KEY (user_id)
        REFERENCES Users (user_id)
);

CREATE TABLE Fitness_Levels (
	fitness_level_id INT AUTO_INCREMENT NOT NULL,
    fitness_level_name VARCHAR(25) NOT NULL,
    PRIMARY KEY (fitness_level_id)
);

CREATE TABLE Avatars (
	avatar_id INT AUTO_INCREMENT NOT NULL,
    avatar_name VARCHAR(25),
    avatar_image_link VARCHAR(200),
    PRIMARY KEY (avatar_id)
);

CREATE TABLE Milestones (
	milestone_id INT AUTO_INCREMENT NOT NULL,
    milestone_name VARCHAR(200) NOT NULL,
    milestone_value INT NOT NULL,
    milestone_attribute VARCHAR(200) NOT NULL,
    PRIMARY KEY (milestone_id)
);

CREATE TABLE User_Milestones (
    user_milestone_id INT AUTO_INCREMENT NOT NULL,
    user_id INT NOT NULL,
    milestone_id INT NOT NULL,
    progress INT DEFAULT 0,
    PRIMARY KEY (user_milestone_id),
    FOREIGN KEY (user_id)
        REFERENCES Users (user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (milestone_id)
        REFERENCES Milestones (milestone_id)
        ON DELETE CASCADE
);

CREATE TABLE Equipment (
	equipment_id INT AUTO_INCREMENT NOT NULL,
    equipment_name VARCHAR(25) NOT NULL,
    PRIMARY KEY (equipment_id)
);

CREATE TABLE User_Equipment (
	user_equipment_id INT AUTO_INCREMENT NOT NULL,
    user_id INT,
    equipment_id INT,
    equip_available BOOL,
    PRIMARY KEY (user_equipment_id),
    FOREIGN KEY (user_id)
        REFERENCES Users (user_id),
	FOREIGN KEY (equipment_id)
        REFERENCES Equipment (equipment_id)
);

CREATE TABLE Exercises (
    exercise_id INT AUTO_INCREMENT NOT NULL,
    exercise_name VARCHAR(255) NOT NULL,
    exercise_desc TEXT,
    body_part VARCHAR(255) NOT NULL,
    target VARCHAR(255) NOT NULL,
    primary_equipment_id INT NOT NULL,
    equipment VARCHAR(255),
    difficulty_level INT,
    PRIMARY KEY (exercise_id),
    FOREIGN KEY (primary_equipment_id)
        REFERENCES Equipment (equipment_id)
);

CREATE TABLE Workouts (
    workout_id INT AUTO_INCREMENT NOT NULL,
    workout_name VARCHAR(200) NOT NULL,
    PRIMARY KEY (workout_id)
);

CREATE TABLE Workout_Histories (
	workout_history_id INT AUTO_INCREMENT NOT NULL,
    workout_id INT NOT NULL,
    user_id INT NOT NULL,
    completed_date TIMESTAMP,
    notes TEXT,
    PRIMARY KEY (workout_history_id),
    FOREIGN KEY (workout_id)
        REFERENCES Workouts (workout_id),
    FOREIGN KEY (user_id)
        REFERENCES Users (user_id)
);

CREATE TABLE Workout_Exercises (
    plan_day_exercise_id INT NOT NULL AUTO_INCREMENT,
    plan_day_id INT,
    exercise_id INT,
    sets INT,
    reps INT,
    duration INT,
    rest_time_sec INT,
    PRIMARY KEY (plan_day_exercise_id),
    FOREIGN KEY (plan_day_id)
        REFERENCES Fitness_Plan_Workouts (plan_day_id),
	FOREIGN KEY (exercise_id)
        REFERENCES Exercises (exercise_id)
);

CREATE TABLE Exercise_Feedbacks (
    feedback_id INT AUTO_INCREMENT NOT NULL,
    workout_history_id INT NOT NULL,
    exercise_id INT NOT NULL,
    rating INT NOT NULL,
    feedback_date TIMESTAMP NOT NULL,
    PRIMARY KEY (feedback_id),
    FOREIGN KEY (workout_history_id)
        REFERENCES Workout_Histories (workout_history_id),
    FOREIGN KEY (exercise_id)
        REFERENCES Exercises (exercise_id)
);

CREATE TABLE Fitness_Plan_Workouts (
    plan_day_id INT AUTO_INCREMENT NOT NULL,
    plan_id INT,
    day_of_week VARCHAR(10),
    PRIMARY KEY (plan_day_id),
    FOREIGN KEY (fitness_plan_id)
        REFERENCES Fitness_Plans (fitness_plan_id)
);