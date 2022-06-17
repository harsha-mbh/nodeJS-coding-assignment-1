const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const path = require("path");
const { open } = require("sqlite");
app.use(express.json());
const { format, parseISO, isValid } = require("date-fns");

const dbPath = path.join(__dirname, "todoApplication.db");
let db;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running successfully at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasPriorityAndCategoryProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityAndStatusAndCategoryProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined &&
    requestQuery.status !== undefined &&
    requestQuery.category !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const isPriorityValid = (priority) => {
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    return true;
  } else {
    return false;
  }
};

const isStatusValid = (status) => {
  if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
    return true;
  } else {
    return false;
  }
};

const isCategoryValid = (category) => {
  if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    return true;
  } else {
    return false;
  }
};

///API 1
app.get("/todos/", async (request, response) => {
  let getTodosQuery = "";
  let requestQuery = request.query;
  const { search_q = "", priority, status, category } = request.query;
  switch (true) {
    case hasCategoryProperty(requestQuery):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodosQuery = `
            SELECT id,todo,priority, status, category,
          due_date AS dueDate FROM todo
            WHERE todo LIKE '%${search_q}%'
            AND category = '${category}';`;
        const todos = await db.all(getTodosQuery);
        response.send(todos);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasPriorityProperty(requestQuery):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodosQuery = `SELECT id,todo,priority, status, category,
          due_date AS dueDate FROM todo
          WHERE todo LIKE '%${search_q}%'
          AND priority = '${priority}'
          ;`;
        const todos = await db.all(getTodosQuery);
        response.send(todos);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case hasStatusProperty(requestQuery):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodosQuery = `SELECT id,todo,priority, status, category,
          due_date AS dueDate FROM todo
          WHERE todo LIKE '%${search_q}%'
          AND status = '${status}';`;
        const todos = await db.all(getTodosQuery);
        response.send(todos);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasPriorityAndCategoryProperties(requestQuery):
      if (priority !== "HIGH" || priority !== "MEDIUM" || priority !== "LOW") {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else if (
        category !== "WORK" ||
        category !== "HOME" ||
        category !== "LEARNING"
      ) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        getTodosQuery = `
          SELECT id,todo,priority, status, category,
          due_date AS dueDate FROM todo
          WHERE todo LIKE '%${search_q}%'
          AND priority = '${priority}'
          AND category = '${category}';`;
        const todos = await db.all(getTodosQuery);
        response.send(todos);
      }
      break;
    case hasPriorityAndStatusProperties(requestQuery):
      if (priority !== "HIGH" || priority !== "MEDIUM" || priority !== "LOW") {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else if (
        status !== "TO DO" ||
        status !== "IN PROGRESS" ||
        status !== "DONE"
      ) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        getTodosQuery = `
          SELECT id,todo,priority, status, category,
          due_date AS dueDate FROM todo
          WHERE todo LIKE '%${search_q}%'
          AND priority = '${priority}'
          AND status = '${status}';`;
        const todos = await db.all(getTodosQuery);
        response.send(todos);
      }
      break;
    case hasCategoryAndStatusProperties(requestQuery):
      if (
        category !== "WORK" ||
        category !== "HOME" ||
        category !== "LEARNING"
      ) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else if (
        status !== "TO DO" ||
        status !== "IN PROGRESS" ||
        status !== "DONE"
      ) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        getTodosQuery = `
          SELECT id,todo,priority, status, category,
          due_date AS dueDate FROM todo
          WHERE todo LIKE '%${search_q}%' AND status = '${status}' AND category = '${category}';`;
        const todos = await db.get(getTodosQuery);
        response.send(todos);
      }
      break;
    default:
      getTodosQuery = `
          SELECT id,todo,priority, status, category,
          due_date AS dueDate FROM todo
          WHERE todo LIKE '%${search_q}%';`;
      const todos = await db.all(getTodosQuery);
      response.send(todos);
  }
});

///API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT id,todo,priority, status, category,
    due_date AS dueDate 
    FROM todo
    WHERE id = '${todoId}';`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

///API 3
app.get("/agenda/", async (request, response) => {
  //const { date } = request.query;
  const date = format(new Date(2021, 11, 12), "yyyy-MM-dd");
  console.log(date);
  const getTodoQuery = `
    SELECT id,todo,priority, status, category,
    due_date AS dueDate
    FROM todo
    WHERE due_date = ${date};`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

///API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  switch (false) {
    case isPriorityValid(priority):
      response.status(400);
      response.send("Invalid Todo Priority");
      break;
    case isStatusValid(status):
      response.status(400);
      response.send("Invalid Todo Status");
      break;
    case isCategoryValid(category):
      response.status(400);
      response.send("Invalid Todo Category");
      break;
    default:
      const createTodoQuery = `
    INSERT INTO todo (id, todo, priority, status, category, due_date)
    VALUES(
        ${id},
        '${todo}',
        '${priority}',
        '${status}',
        '${category}',
        '${dueDate}'
    );`;
      const dbResponse = await db.run(createTodoQuery);
      response.send("Todo Successfully Added");
  }
});

///API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body;

  switch (true) {
    case requestBody.status !== undefined:
      if (isStatusValid(requestBody.status)) {
        updateColumn = "Status";
        const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date = '${dueDate}'
    WHERE
      id = ${todoId};`;

        await db.run(updateTodoQuery);
        response.send(`${updateColumn} Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case requestBody.priority !== undefined:
      if (isPriorityValid(requestBody.priority)) {
        updateColumn = "Priority";
        const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date = '${dueDate}'
    WHERE
      id = ${todoId};`;

        await db.run(updateTodoQuery);
        response.send(`${updateColumn} Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      let updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date = '${dueDate}'
    WHERE
      id = ${todoId};`;

      await db.run(updateTodoQuery);
      response.send(`${updateColumn} Updated`);
      break;
    case requestBody.category !== undefined:
      if (isCategoryValid(requestBody.category)) {
        updateColumn = "Category";
        const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date = '${dueDate}'
    WHERE
      id = ${todoId};`;

        await db.run(updateTodoQuery);
        response.send(`${updateColumn} Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case requestBody.dueDate !== undefined:
      updateColumn = "Due Date";
      updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date = '${dueDate}'
    WHERE
      id = ${todoId};`;

      await db.run(updateTodoQuery);
      response.send(`${updateColumn} Updated`);
      break;
  }
});

///API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
    DELETE FROM todo
    WHERE id = ${todoId};`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
