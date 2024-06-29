// public/scripts.js

const API_URL = 'http://localhost:3000/todos';

document.addEventListener('DOMContentLoaded', () => {
  const todoList = document.getElementById('todo-list');

  // Fetch todos from server and display them
  const fetchTodos = async () => {
    try {
      const response = await fetch(API_URL);
      const todos = await response.json();
      displayTodos(todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  // Display todos in the list
  const displayTodos = (todos) => {
    todoList.innerHTML = '';
    todos.forEach(todo => {
      const li = document.createElement('li');
      li.textContent = `${todo.task}: ${todo.details}`;
      todoList.appendChild(li);
    });
  };

  fetchTodos(); // Initial fetch
});
