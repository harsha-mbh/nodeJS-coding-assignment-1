const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const path = require("path");
const { open } = require("sqlite");
app.use(express.json());
const { format, parseISO } = require("date-fns");

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

///API 1
app.get("/todos/", async (request, response) => {
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;
  switch (true) {
    case hasPriorityAndStatusAndCategoryProperties(request.query):
      getTodosQuery = `
          SELECT id,todo,priority, status, category,
          due_date AS dueDate
          FROM todo
          WHERE todo LIKE '%${search_q}%'
          AND priority = '${priority}'
          AND status = '${status}'
          AND category = '${category}';`;
      break;
    case hasCategoryProperty(request.query):
      getTodosQuery = `
            SELECT id,todo,priority, status, category,
          due_date AS dueDate FROM todo
            WHERE todo LIKE '%${search_q}%'
            AND category = '${category}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `SELECT id,todo,priority, status, category,
          due_date AS dueDate FROM todo
          WHERE todo LIKE '%${search_q}%'
          AND priority = '${priority}'
          ;`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `SELECT id,todo,priority, status, category,
          due_date AS dueDate FROM todo
          WHERE todo LIKE '%${search_q}%'
          AND status = '${status}';`;
      break;
    case hasPriorityAndCategoryProperties(request.query):
      getTodosQuery = `
          SELECT id,todo,priority, status, category,
          due_date AS dueDate FROM todo
          WHERE todo LIKE '%${search_q}%'
          AND priority = '${priority}'
          AND category = '${category}';`;
      break;
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
          SELECT id,todo,priority, status, category,
          due_date AS dueDate FROM todo
          WHERE todo LIKE '%${search_q}%'
          AND priority = '${priority}'
          AND status = '${status}';`;
      break;
    case hasCategoryAndStatusProperties(request.query):
      getTodosQuery = `
          SELECT id,todo,priority, status, category,
          due_date AS dueDate FROM todo
          WHERE todo LIKE '%${search_q}%'
          AND status = '${status}'
          AND category = '${category}';`;
      break;
    default:
      getTodosQuery = `
          SELECT id,todo,priority, status, category,
          due_date AS dueDate FROM todo
          WHERE todo LIKE '%${search_q}%';`;
  }
  const todos = await db.all(getTodosQuery);
  response.send(todos);
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
  const { date } = request.query;
  let parsedDate = parseISO(date);
  format(parsedDate, "yyyy-MM-dd");
  const getTodoQuery = `
    SELECT id,todo,priority, status, category,
    due_date AS dueDate
    FROM todo
    WHERE due_date = '${parsedDate}';`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

///API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
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
  const newTodoId = dbResponse.lastId;
  response.send("Todo Successfully Added");
});

///API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
    case requestBody.category !== undefined:
      updateColumn = "Category";
      break;
    case requestBody.dueDate !== undefined:
      updateColumn = "Due Date";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body;

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

  await database.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
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
