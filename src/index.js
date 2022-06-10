const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

const checksExistsUserAccount = (request, response, next) => {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user;

  return next();
};

app.post("/users", (request, response) => {
  const { username, name } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!!" });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  return response.status(201).send();
});

app.use(checksExistsUserAccount);

app.get("/todos", (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const toDoOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(toDoOperation);

  return response.status(201).send();
});

app.put("/todos/:id", (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  let update = false;

  const updatedToDo = user.todos.map((item) => {
    if (item.id === id) {
      update = true;
      return { ...item, title, deadline };
    }
    return item;
  });

  if (!update) {
    return response.status(404).json({ error: " Not Found " });
  }

  user.todos = updatedToDo;

  return response.json(user.todos);
});

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  (request, response) => {}
);

app.delete("/todos/:id", (request, response) => {});

module.exports = app;
