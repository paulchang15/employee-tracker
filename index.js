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
  connection.query(`SELECT * FROM ${tableName}`, function (err, res) {
    if (err) throw err;
    console.table(res);

    questions();
  });
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
  // connection.query("SELECT * FROM department", function (err, res) {
  //   if (err) throw err;

  //   const arr = res.map(({ id, name }) => ({
  //     name: name,
  //     value: id,
  //   }));

  //   inquirer
  //     .prompt([
  //       {
  //         type: "input",
  //         name: "first",
  //         message:
  //           "Please enter the first name of the employee you would like to add.",
  //       },
  //       {
  //         type: "input",
  //         name: "last",
  //         message:
  //           "Please enter the last name of the employee you would like to add.",
  //       },
  //       {
  //         type: "list",
  //         name: "role",
  //         message: "What is the role of this employee?",
  //         choices: arr,
  //       },
  //     ])
  //     .then((answer) => {
  //       connection.query(
  //         "INSERT INTO employee SET ?",
  //         {
  //           first_name: answer.first,
  //           last_name: answer.last,
  //           role_id: answer.department,
  //         },
  //         function (err, res) {
  //           if (err) throw err;
  //           console.table(res);
  //         }
  //       );
  //     });
  // });
  connection.query(
    `SELECT * FROM role LEFT JOIN employee WHERE role.column`,
    function (err, res) {
      if (err) throw err;

      const arr = res.map(({ title, role_id, manager_id }) => ({
        name: title,
        value: role_id,
        manager_id,
      }));
      console.log(arr);

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
          {
            type: "list",
            name: "role",
            message: "What is the role of this employee?",
            choices: arr,
          },
          {
            type: "list",
            name: "manager",
            message: "Who is the manager of this employee?",
            choices: arr,
          },
        ])
        .then((answer) => {
          connection.query(
            "INSERT INTO employee SET ?",
            {
              first_name: answer.first,
              last_name: answer.last,
              role_id: answer.role,
            },
            function (err, res) {
              if (err) throw err;
              console.table(res);
            }
          );
        });
    }
  );
};
