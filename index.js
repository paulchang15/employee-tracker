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
          return;
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
    var arr = [];
    for (let i = 0; i < res.length; i++) {
      arr.push(res[i].name);
      console.log(res[i].name);
    }
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
        console.log(answer.salary);
        connection.query(
          "INSERT INTO role SET ?",
          [
            {
              title: answer.title,
              salary: answer.salary,
              department_id: arr,
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
// addEmployee = () => {
//   inquirer
//     .prompt([
//       {
//         type: "input",
//         name: "department",
//         message: "What is the name of the department you would like to add?",
//       },
//     ])
//     .then((answer) => {
//       connection.query(
//         "INSERT INTO department SET ?",
//         {
//           name: answer.department,
//         },
//         function (err, res) {
//           if (err) throw err;
//           console.table(res);
//         }
//       );
//       questions();
//     });
// };
