INSERT INTO department(name)
VALUES ('Legal'),
    ('Development'),
    ('HR');
INSERT INTO role(title, salary, department_id)
VALUES ('Attorney', 100000.00, 1),
    ('Engineer', 120000.00, 2),
    ('HR Manager', 60000.00, 3);
('Accountant', 60000.00, 3);
INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ('Paul', 'Chang', 1, NULL),
    ('Maksim', 'V', 2, 1),
    ('Dan', 'Cho', 3, 2);