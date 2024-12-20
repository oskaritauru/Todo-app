let todoArray = [];
let todoId = 0;
let currentFilter = 'all';
const localTodo = "local-todo";

const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const itemsLeft = document.getElementById("items-left");
const todoFilters = document.querySelectorAll("input[name='filter']");
const clearCompleted = document.getElementById('clear-completed');

const themeSwitch = document.getElementById('theme-toggle');
const themeImg = document.querySelectorAll('.theme-change img');

clearCompleted.addEventListener('click', () => {
  const toRemove = todoArray.filter((obj) => obj.active === false);

  if (toRemove.length > 0 && confirm(`Remove ${toRemove.length} completed task.`)) {
    toRemove.forEach((todo) => {
      removeTodo(todo.DOMelem);
    });
  }
});

todoInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    if (e.target.value !== "") {
      addTodo(e.target.value);
      refreshFilters();
    }
    todoInput.value = '';
  }
});

todoFilters.forEach((filter) => {
  filter.addEventListener('change', filterCallback);
});

themeSwitch.addEventListener('click', themeSwitcher);

function themeSwitcher(e) {
  themeImg.forEach(logo => logo.classList.toggle("todo-theme"));

  if (document.body.dataset.theme === "darkTheme") {
    document.body.dataset.theme = "whiteTheme";
  } else if (document.body.dataset.theme === "whiteTheme") {
    document.body.dataset.theme = "darkTheme";
  }
}

function filterCallback(e) {
  currentFilter = e.target.value;
  refreshFilters();
}

function refreshFilters() {
  if (currentFilter === 'completed') {
    completedTodo();
  } else if (currentFilter === 'all') {
    allTodo();
  } else {
    activeTodo();
  }
}

function completedTodo() {
  todoArray.forEach(function (arrayObj) {
    if (!arrayObj.active && arrayObj.DOMelem.classList.contains("todo-hide")) {
      arrayObj.DOMelem.classList.remove("todo-hide");
    }
    else if (arrayObj.active && !arrayObj.DOMelem.classList.contains("todo-hide")) {
      arrayObj.DOMelem.classList.add("todo-hide");
    }
  });
}

function allTodo() {
  todoArray.forEach(function (arrayObj) {
    if (arrayObj.DOMelem.classList.contains("todo-hide")) {
      arrayObj.DOMelem.classList.remove("todo-hide");
    }
  });
}

function activeTodo() {
  todoArray.forEach(function (arrayObj) {
    if (arrayObj.active && arrayObj.DOMelem.classList.contains("todo-hide")) {
      arrayObj.DOMelem.classList.remove("todo-hide");
    }
    else if (arrayObj.active === false && !arrayObj.DOMelem.classList.contains("todo-hide")) {
      arrayObj.DOMelem.classList.add("todo-hide");
    }
  });
}

function updateActiveCount() {
  let count = todoArray.reduce((count, todoObj) => {
    if (todoObj.active) count++;
    return count;
  }, 0);
  itemsLeft.innerText = count;
}

function updateCurrentId() {
  if (!todoArray.length) {
    todoId = 0;
  } else {
    todoId = todoArray[todoArray.length - 1].id + 1;
  }
}

function getLocalStorage() {
  if (localStorage.getItem(localTodo) === null) {
    localStorage.setItem(localTodo, JSON.stringify([]));
  } else if (JSON.parse(localStorage.getItem(localTodo).length)) {
    todoArray = JSON.parse(localStorage.getItem(localTodo));
    todoArray.forEach((todo) => {
      if (todoId < +todo.id) todoId = +todo.id;
      addTodo(todo.content, false);
    });
    todoId++;
  }
  updateActiveCount();
}

function updateLocalStorage() {
  localStorage.setItem(localTodo, JSON.stringify(todoArray));
}

function removeFromStorage(id) {
  todoArray = todoArray.filter((todoObj) => {
    return todoObj.id !== +id;
  });
  updateLocalStorage();
}

function changeActiveStatus(todo) {
  todo.classList.toggle("todo-checked");
  let isActive = true;

  if (todo.classList.contains("todo-checked")) {
    isActive = false;
  }

  todoArray.forEach((arrayObj) => {
    if (arrayObj.id === +todo.id) arrayObj.active = isActive;
  });
  updateLocalStorage();
  updateActiveCount();
}

function removeTodo(todo) {
  removeTodoDom(todo);
  removeFromStorage(+todo.id);
  updateCurrentId();
  updateActiveCount();
  refreshFilters();
}

function removeTodoDom(todo) {
  todo.remove();
}

function addTodo(todoText, newTodo = true) {
  const newTodoList = document.createElement('li');
  newTodoList.classList.add("todo-item");
  newTodoList.id = "" + todoId;
  newTodoList.draggable = true;
  newTodoList.innerHTML = `
    <input type="checkbox" class="todo-checkbox" id="checkbox">
      <span class="todo-text" id="todo-text">${todoText}</span>
      <button class="todo-delete"><img class="delete-img" src="../images/icon-cross.svg" alt=""/></button>
  `;

  if (newTodo) {
    todoArray.push({
      active: true,
      content: todoText,
      DOMelem: newTodoList,
      id: todoId++,
    });
    updateLocalStorage();
  } else {
    todoArray.forEach((arrayObj) => {
      if (arrayObj.id === todoId) {
        arrayObj.DOMelem = newTodoList;
        if (!arrayObj.active) {
          newTodoList.classList.add("todo-checkbox");
        }
      }
    });
  }
  todoList.appendChild(newTodoList);

  const todo_delete = newTodoList.querySelector(".todo-delete");

  todo_delete.addEventListener("click", function () {
    removeTodo(newTodoList);
  });

  const todo_check = newTodoList.querySelector(".todo-checkbox");

  todo_check.addEventListener("click", function () {
    changeActiveStatus(newTodoList);
    refreshFilters();
  });
  updateActiveCount();
}

function createTodoList() {
  const starterList = [
    "Complete online JavaScript course",
    "Jog around the park 3x",
    "10 minutes meditation",
    "Read for 1 hour",
    "Pick up groceries",
    "Complete Todo App on Frontend Mentor",
  ];
  if (localStorage.getItem("isFirstVisit") === null || localStorage.getItem("isFirstVisit") === false) {
    localStorage.setItem("isFirstVisit", true);
    starterList.forEach((item) => {
      addTodo(item);
    });
    changeActiveStatus();
    //todoArray[0].DOMelem
  }
  else {
    getLocalStorage();
  }
}
createTodoList();
localStorage.clear()

const sortableList = document.getElementById("todo-list");
let draggedItem = null;

sortableList.addEventListener("dragstart", (e) => {
  draggedItem = e.target;
  setTimeout(() => {
    e.target.style.display = "none";
  }, 0);
});

sortableList.addEventListener("dragend", (e) => {
  setTimeout(() => {
    e.target.style.display = "";
    draggedItem = null;
  }, 0);
});

sortableList.addEventListener("dragover", (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(sortableList, e.clientY);
  const currentElement = document.querySelector(".dragging");
  if (afterElement == null) {
    sortableList.appendChild(
      draggedItem
    );
  }
  else {
    sortableList.insertBefore(
      draggedItem,
      afterElement,
    );
  }
});

const getDragAfterElement = (container, y) => {
  const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return {
        offset: offset,
        element: child,
      };
    } else {
      return closest;
    }
  },
    {
      offset: Number.NEGATIVE_INFINITY,
    }
  ).element;
};