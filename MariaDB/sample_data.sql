-- ------------------------------------------------------
-- - SAMPLE DATA ---------------------------------------
-- ------------------------------------------------------

-- Fitness_Levels, Body_Types, and Fitness_Goals are populated to directly correspond with
--  answers to the Fitness Survey
-- The remaining Insert statements are to create sample data in each of the key data tables

-- corresponds to fitness level options in survey
INSERT INTO Fitness_Levels (fitness_level_name)
VALUES
    ('Beginner'),
    ('Intermediate'),
    ('Advanced');

-- corresponds to body type options in survey
INSERT INTO Body_Types (body_type_name)
VALUES
    ('Endomorph'),
    ('Mesomorph'),
    ('Ectomorph'),
    ('Not Sure');

-- corresponds to fitness goal options in survey
INSERT INTO Fitness_Goals (fitness_goal_name)
VALUES
    ('lose-weight'),
    ('get-stronger'),
    ('better-endurance'),
    ('build-muscle'),
    ('better-flexibility'),
    ('not-sure');

-- One default avatar option for users
INSERT INTO Avatars (avatar_name)
VALUES ('Default Avatar');

-- User 1 has registered
INSERT INTO Users (display_name, email, firebase_uid, avatar_id, created_at, updated_at)
VALUES ('Kristen', 'mcdokris@oregonstate.edu', '123auifd93', 1, now(), now());

-- User 1 Filled out Survey
INSERT INTO Surveys (user_id, body_type_id, fitness_goal_id, fitness_level_id)
VALUES (1, 4, 2, 2);

-- 3 different milestones created that the app may measure users' progress against
INSERT INTO Milestones (milestone_name, milestone_value, milestone_attribute)
VALUES
	('First Exercise Complete', 1, 'exercise_count'),
    ('100 Push-ups', 100, 'push_ups'),
    ('500 Squats', 500, 'squats');

-- User 1 is measuring progress against milestone # 1
INSERT INTO User_Milestones (user_id, milestone_id)
VALUES (1,1);

-- A Fitness Plan was created for user # 1
INSERT INTO Fitness_Plans (user_id, fitness_plan_name, fitness_plan_desc,start_date, end_date)
VALUES (1, "Kristen's Beginner Exercise Plan", "This plan is tailored to help you lose weight", '2024-08-01', '2024-08-31');

-- Full listing of what equipment user #1 does and does not have, as collected by survey
INSERT INTO User_Equipment (user_id, equipment_id, equip_available)
VALUES
	(1, 1, TRUE),
    (1, 2, TRUE),
    (1, 3, TRUE),
    (1, 4, TRUE),
    (1, 5, TRUE),
    (1, 6, TRUE),
    (1, 7, TRUE),
    (1, 8, TRUE),
    (1, 9, FALSE),
    (1, 10, TRUE),
    (1, 11, TRUE),
    (1, 12, TRUE),
    (1, 13, TRUE),
    (1, 14, TRUE),
    (1, 15, FALSE),
    (1, 16, TRUE),
    (1, 17, TRUE),
    (1, 18, TRUE),
    (1, 19, TRUE),
    (1, 20, FALSE),
    (1, 21, TRUE),
    (1, 22, TRUE),
    (1, 23, TRUE),
    (1, 24, FALSE),
    (1, 25, TRUE),
    (1, 26, FALSE),
    (1, 27, TRUE),
    (1, 28, TRUE);

-- Stores Workout Names for 3 Workouts Created. More details available in Workout_Exercises, to see what exercises each workout contains
--  and Fitness_Plan_Workouts to see what workouts were assigned to a fitness plan
INSERT INTO Workouts (workout_name)
VALUES ('Beginner Leg Day'), ('Intermediate Upper Body Day'), ('Advanced Push Day');

-- One Workout composed of 4 exercises was assembled. Exercises may have sets and reps, or a duration to perform
INSERT INTO Workout_Exercises (workout_id, exercise_id, exercise_rep, exercise_set, exercise_weight, exercise_duration_sec, rest_time_sec)
VALUES
	(1, 63, 10, 3, 0, null, 30),
	(1, 65, null, null, 0, 60, 60),
    (1, 129, 8, 3, 45, null, 60),
    (1, 224, 5, 3, 45, null, 60);

-- Indicates 1 workout was complete on 7/28 by user #1
INSERT INTO Workout_Histories (workout_id, user_id, completed_date, notes)
VALUES (1, 1,'2024-07-28', 'this was tough');

-- Exit Survey Ratings Stored for completion of 1 workout, composed of 4 exercises
INSERT INTO Exercise_Feedbacks (workout_history_id, exercise_id, rating, feedback_date)
VALUES
	(1, 63, 3, '2024-07-28'),
	(1, 65, 4, '2024-07-28'),
	(1, 129, 1, '2024-07-28'),
	(1, 224, 5, '2024-07-28');

 -- Fitness Plan Composed of Workouts # 1, 2, 3
 INSERT INTO Fitness_Plan_Workouts (fitness_plan_id, workout_id)
 VALUES
	(1, 1),
    (1, 2),
    (1, 3);