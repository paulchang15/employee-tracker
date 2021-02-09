const inquirer = require("inquirer");
const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "employee_tracker_db",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  questions();
});

function questions() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "tables",
        message: "What would you like to to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update an employee role",
          "Exit",
        ],
      },
    ])
    .then((answer) => {
      console.log(answer.tables);
      switch (answer.tables) {
        case "View all departments":
          getAll("department");
          break;
        case "View all roles":
          getAll("role");
          break;
        case "View all employees":
          getAll("employee");
          break;
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update an employee role":
          updateRole();
          break;
        case "Exit":
          connection.end();
      }
    });
}

getAll = (tableName) => {
  connection.query(
    `SELECT * FROM ??`,
    [tableName],

    function (err, res) {
      if (err) throw err;
      console.table(res);

      questions();
    }
  );
};
addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "department",
        message: "What is the name of the department you would like to add?",
      },
    ])
    .then((answer) => {
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: answer.department,
        },
        function (err, res) {
          if (err) throw err;
          console.table(res);
        }
      );
      questions();
    });
};
addRole = () => {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;

    const arr = res.map(({ id, name }) => ({
      name: name,
      value: id,
    }));
    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "What is the title of the role you would like to add?",
        },
        {
          type: "input",
          name: "salary",
          message: "What is the salary of this role?",
        },
        {
          type: "list",
          name: "department",
          message: "What department does this employee belong in?",
          choices: arr,
        },
      ])
      .then((answer) => {
        console.log(answer);
        connection.query(
          "INSERT INTO role SET ?",
          [
            {
              title: answer.title,
              salary: answer.salary,
              department_id: answer.department,
            },
          ],
          function (err, res) {
            if (err) throw err;
            console.table(res);
          }
        );
        questions();
      });
  });
};
addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "first",
        message:
          "Please enter the first name of the employee you would like to add.",
      },
      {
        type: "input",
        name: "last",
        message:
          "Please enter the last name of the employee you would like to add.",
      },
    ])
    .then((answer) => {
      let firstName = answer.first;
      let lastName = answer.last;

      connection.query(`SELECT * FROM role`, function (err, res) {
        if (err) throw err;
        const roleChoices = res.map(({ id, title }) => ({
          name: title,
          value: id,
        }));
        inquirer
          .prompt([
            {
              type: "list",
              name: "role",
              message: "What is the role of this employee?",
              choices: roleChoices,
            },
          ])
          .then((answer) => {
            let roleId = answer.role;

            connection.query(`SELECT * FROM employee`, function (err, res) {
              if (err) throw err;
              const managerChoices = res.map(
                ({ id, first_name, last_name, man_ind }) => ({
                  name: first_name,
                  last_name,
                  value: id,
                  man_ind,
                })
              );
              inquirer
                .prompt([
                  {
                    type: "confirm",
                    name: "confirmManager",
                    message: "Does this employee have a manager?",
                  },
                  {
                    type: "list",
                    name: "manager",
                    message: "Who is the manager employee?",
                    choices: managerChoices,
                  },
                ])

                .then((answer) => {
                  if (answer.confirmManager) {
                    connection.query(
                      "INSERT INTO employee SET ?",
                      {
                        first_name: firstName,
                        last_name: lastName,
                        role_id: roleId,
                        manager_id: answer.manager,
                      },

                      function (err, res) {
                        if (err) throw err;
                        console.table(res);
                      }
                    );
                  } else {
                    connection.query(
                      "INSERT INTO employee SET ?",
                      {
                        manager_id: NULL,
                      },
                      function (err, res) {
                        if (err) throw err;
                        console.table(res);
                      }
                    );
                  }
                  questions();
                });
            });
          });
      });
    });
};

updateRole = () => {
  connection.query(`SELECT * FROM employee`, function (err, res) {
    if (err) throw err;
    const empChoices = res.map(({ id, first_name, last_name }) => ({
      name: first_name,
      last_name,
      value: id,
    }));
    inquirer
      .prompt([
        {
          type: "list",
          name: "empUpdate",
          message: "What role would you like to change this employee to?",
          choices: empChoices,
        },
      ])
      .then((answer) => {
        let employee = answer.empUpdate;
        console.log(employee);
        connection.query(`SELECT * FROM role`, function (err, res) {
          if (err) throw err;
          const roleChoices = res.map(({ id, title }) => ({
            name: title,
            value: id,
          }));
          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: "What role will this employee change to?",
                choices: roleChoices,
              },
            ])
            .then((answer) => {
              connection.query(
                "UPDATE employee SET ? WHERE ?",
                {
                  role_id: answer.role,
                },
                {
                  id: employee,
                },

                function (err, res) {
                  if (err) throw err;
                  console.table(res);
                }
              );
            });
        });
      });
  });
};
