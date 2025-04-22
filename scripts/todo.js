// Initialize an empty array to hold todo items
let todoArray = [];
// Initialize a variable to keep track of the current todo ID
let todoId = 0;
// Set the current filter to "all"
let currentFilter = "all";
// Define a key for local storage
const localTodo = "local-todo";

// Get references to DOM elements
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const itemsLeft = document.getElementById("items-left");
const todoFilters = document.querySelectorAll("input[name='filter']");
const clearCompleted = document.getElementById("clear-completed");

// Get theme toggle elements
const themeSwitch = document.getElementById("theme-toggle");
const themeImg = document.querySelectorAll(".theme-change img");

// Event listener for clearing completed todos
clearCompleted.addEventListener("click", () => {
  // Filter out completed todos
  const toRemove = todoArray.filter((obj) => obj.active === false);

  if (
    toRemove.length > 0 &&
    confirm(`Remove ${toRemove.length} completed task.`)
  ) {
    toRemove.forEach((todo) => {
      removeTodo(todo.DOMelem);
    });
  }
});

// Event listener for adding a new todo when Enter key is pressed
todoInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    if (e.target.value !== "") {
      addTodo(e.target.value);
      refreshFilters();
    }
    todoInput.value = ""; // Clear the input field
  }
});

// Add event listeners for each filter option
todoFilters.forEach((filter) => {
  filter.addEventListener("change", filterCallback);
});

// Event listener for theme switching
themeSwitch.addEventListener("click", themeSwitcher);

// Function to switch between light and dark themes
function themeSwitcher(e) {
  themeImg.forEach((logo) => logo.classList.toggle("todo-theme"));

  if (document.body.dataset.theme === "darkTheme") {
    document.body.dataset.theme = "whiteTheme";
  } else if (document.body.dataset.theme === "whiteTheme") {
    document.body.dataset.theme = "darkTheme";
  }
}

// Callback function for filter changes
function filterCallback(e) {
  currentFilter = e.target.value;
  refreshFilters();
}

// Function to refresh the displayed todos based on the current filter
function refreshFilters() {
  if (currentFilter === "completed") {
    completedTodo();
  } else if (currentFilter === "all") {
    allTodo();
  } else {
    activeTodo();
  }
}

// Function to display completed todos
function completedTodo() {
  todoArray.forEach(function (arrayObj) {
    if (!arrayObj.active && arrayObj.DOMelem.classList.contains("todo-hide")) {
      arrayObj.DOMelem.classList.remove("todo-hide");
    } else if (
      arrayObj.active &&
      !arrayObj.DOMelem.classList.contains("todo-hide")
    ) {
      arrayObj.DOMelem.classList.add("todo-hide");
    }
  });
}

// Function to display all todos
function allTodo() {
  todoArray.forEach(function (arrayObj) {
    if (arrayObj.DOMelem.classList.contains("todo-hide")) {
      arrayObj.DOMelem.classList.remove("todo-hide");
    }
  });
}

// Function to display only active todos
function activeTodo() {
  todoArray.forEach(function (arrayObj) {
    if (arrayObj.active && arrayObj.DOMelem.classList.contains("todo-hide")) {
      arrayObj.DOMelem.classList.remove("todo-hide");
    } else if (
      arrayObj.active === false &&
      !arrayObj.DOMelem.classList.contains("todo-hide")
    ) {
      arrayObj.DOMelem.classList.add("todo-hide");
    }
  });
}

// Function to update the count of active todos
function updateActiveCount() {
  let count = todoArray.reduce((count, todoObj) => {
    if (todoObj.active) count++;
    return count;
  }, 0);
  itemsLeft.innerText = count;
}

// Function to update the current todo ID based on existing todos
function updateCurrentId() {
  if (!todoArray.length) {
    todoId = 0;
  } else {
    todoId = todoArray[todoArray.length - 1].id + 1;
  }
}

// Function to retrieve todos from local storage
function getLocalStorage() {
  if (localStorage.getItem(localTodo) === null) {
    // If no todos are stored, initialize with an empty array
    localStorage.setItem(localTodo, JSON.stringify([]));
  } else if (JSON.parse(localStorage.getItem(localTodo).length)) {
    // If there are todos, load them into the todoArray
    todoArray = JSON.parse(localStorage.getItem(localTodo));
    todoArray.forEach((todo) => {
      if (todoId < +todo.id) todoId = +todo.id;
      addTodo(todo.content, false);
    });
    todoId++;
  }
  updateActiveCount();
}

// Function to update local storage with the current todoArray
function updateLocalStorage() {
  localStorage.setItem(localTodo, JSON.stringify(todoArray));
}

// Function to remove a todo from the storage by ID
function removeFromStorage(id) {
  todoArray = todoArray.filter((todoObj) => {
    return todoObj.id !== +id;
  });
  updateLocalStorage();
}

// Function to change the active status of a todo
function changeActiveStatus(todo) {
  todo.classList.toggle("todo-checked");
  let isActive = true;

  if (todo.classList.contains("todo-checked")) {
    isActive = false;
  }

  // Update the active status in the todoArray
  todoArray.forEach((arrayObj) => {
    if (arrayObj.id === +todo.id) arrayObj.active = isActive;
  });
  updateLocalStorage();
  updateActiveCount();
}

// Function to remove a todo from the DOM and storage
function removeTodo(todo) {
  removeTodoDom(todo);
  removeFromStorage(+todo.id);
  updateCurrentId();
  updateActiveCount();
  refreshFilters();
}

// Function to remove a todo element from the DOM
function removeTodoDom(todo) {
  todo.remove();
}

// Function to add a new todo to the list
function addTodo(todoText, newTodo = true) {
  const newTodoList = document.createElement("li");
  newTodoList.classList.add("todo-item");
  newTodoList.id = "" + todoId;
  newTodoList.draggable = true; // Make the item draggable
  newTodoList.innerHTML = `
    <input type="checkbox" class="todo-checkbox" id="checkbox">
      <span class="todo-text" id="todo-text">${todoText}</span>
      <button class="todo-delete"><img class="delete-img" src="./images/icon-cross.svg" alt=""/></button>
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

  // Event listener for the delete button
  const todo_delete = newTodoList.querySelector(".todo-delete");
  todo_delete.addEventListener("click", function () {
    removeTodo(newTodoList);
  });

  // Event listener for the checkbox
  const todo_check = newTodoList.querySelector(".todo-checkbox");
  todo_check.addEventListener("click", function () {
    changeActiveStatus(newTodoList);
    refreshFilters();
  });
  updateActiveCount();
}

// Function to create an initial todo list
function createTodoList() {
  const starterList = [
    "Complete online JavaScript course",
    "Jog around the park 3x",
    "10 minutes meditation",
    "Read for 1 hour",
    "Pick up groceries",
    "Complete Todo App on Frontend Mentor",
  ];
  if (
    localStorage.getItem("isFirstVisit") === null ||
    localStorage.getItem("isFirstVisit") === false
  ) {
    localStorage.setItem("isFirstVisit", true);
    starterList.forEach((item) => {
      addTodo(item);
    });
    changeActiveStatus();
    //todoArray[0].DOMelem
  } else {
    getLocalStorage();
  }
}
// Call the function to create the initial todo list
createTodoList();
localStorage.clear();

// Drag and drop functionality
const sortableList = document.getElementById("todo-list");
let draggedItem = null;

// Event listener for drag start
sortableList.addEventListener("dragstart", (e) => {
  draggedItem = e.target;
  setTimeout(() => {
    e.target.style.display = "none";
  }, 0);
});

// Event listener for drag end
sortableList.addEventListener("dragend", (e) => {
  setTimeout(() => {
    e.target.style.display = "";
    draggedItem = null;
  }, 0);
});

// Event listener for drag over
sortableList.addEventListener("dragover", (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(sortableList, e.clientY);
  const currentElement = document.querySelector(".dragging");
  if (afterElement == null) {
    sortableList.appendChild(draggedItem);
  } else {
    sortableList.insertBefore(draggedItem, afterElement);
  }
});

// Function to get the element after which the dragged item should be placed
const getDragAfterElement = (container, y) => {
  const draggableElements = [
    ...container.querySelectorAll("li:not(.dragging)"), // Get all draggable elements except the one being dragged
  ];
  return draggableElements.reduce(
    (closest, child) => {
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
