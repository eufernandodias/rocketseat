const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).json({ message: "User not found" })
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const id = uuidv4();

  if (users.some((users) => users.username === username)) {
    return response.status(400).json({ error: "User already exists" })
  }

  users.push({ id, name, username, todos: [] });

  const user = users.find((user) => user.id === id);

  if (user) {
    return response.status(201).json(user);
  } else {
    return response.status(400).json({ error: "Error to create a new user." })
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {


  return response.status(200).json(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const user = request.user;

  const newDeadlineFormat = new Date(deadline + " 00:00");

  user.todos.push({
    id: uuidv4(),
    title,
    done: false,
    deadline: newDeadlineFormat,
    created_at: new Date()
  });

  return response.status(201).json(user);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  const user = request.user;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline + " 00:00");

  return response.json(todo);


});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const user = request.user;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const user = request.user;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" }); els
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();


});

module.exports = app;