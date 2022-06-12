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
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
};

app.post("/users", (request, response) => {
  const { username, name } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "Username already exists!!" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const toDoOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(toDoOperation);

  return response.status(201).json(toDoOperation);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const findTodo = user.todos.find((todo) => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }
  findTodo.title = title;
  findTodo.deadline = new Date(deadline);

  return response.json(findTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findIdTodo = user.todos.find((item) => item.id === id);

  if (!findIdTodo) {
    return response.status(404).json({ error: "Todo Not Found" });
  }

  findIdTodo.done = true;

  return response.json(findIdTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const deleteIdIndex = user.todos.findIndex((item) => item.id === id);
  // Utilizando isso para percorrer o array e achar a posição no array que ele se encontra.

  if (deleteIdIndex === -1) {
    return response.status(404).json({ error: "Todo Not Found" });
  }

  user.todos.splice(deleteIdIndex, 1);

  return response.status(204).json();
});

module.exports = app;
