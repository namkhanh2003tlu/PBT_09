// DOM Elements
const form = document.querySelector('#todoForm');
const input = document.querySelector('#todoInput');
const todoList = document.querySelector('#todoList');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearBtn = document.querySelector('.clear-btn');
const itemCount = document.querySelector('#itemCount');

// State
let todos = [];
let currentFilter = 'all';
const STORAGE_KEY = 'todos_pbt09';

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    renderTodos();
});

// ============ EVENT LISTENERS ============
// Form submit - Add new todo
form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo();
});

// Filter buttons
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// Clear completed button
clearBtn.addEventListener('click', () => {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
});

// Event Delegation on todo list
todoList.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
        deleteTodo(e.target.closest('.todo-item'));
    } else if (e.target.classList.contains('todo-text')) {
        // Double click to edit
        if (e.detail === 2) {
            startEdit(e.target.closest('.todo-item'));
        } else {
            // Single click to toggle
            toggleTodo(e.target.closest('.todo-item'));
        }
    }
});

// Event Delegation for edit input
todoList.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const editInput = e.target.closest('.todo-edit-input');
        if (editInput) {
            saveEdit(editInput.closest('.todo-item'));
        }
    } else if (e.key === 'Escape') {
        const li = e.target.closest('.todo-item');
        if (li) {
            li.classList.remove('in-edit');
        }
    }
});

// ============ FUNCTIONS ============
function addTodo() {
    const text = input.value.trim();
    
    if (!text) {
        input.focus();
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    todos.push(todo);
    saveTodos();
    renderTodos();
    input.value = '';
    input.focus();
}

function deleteTodo(liElement) {
    const id = parseInt(liElement.dataset.id);
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

function toggleTodo(liElement) {
    const id = parseInt(liElement.dataset.id);
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function startEdit(liElement) {
    liElement.classList.add('in-edit');
    const input = liElement.querySelector('.todo-edit-input');
    input.value = liElement.querySelector('.todo-text').textContent;
    input.focus();
    input.select();
}

function saveEdit(liElement) {
    const id = parseInt(liElement.dataset.id);
    const input = liElement.querySelector('.todo-edit-input');
    const newText = input.value.trim();

    if (!newText) {
        liElement.classList.remove('in-edit');
        return;
    }

    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.text = newText;
        saveTodos();
        renderTodos();
    }
}

function renderTodos() {
    todoList.innerHTML = '';

    if (todos.length === 0) {
        todoList.innerHTML = '<div class="empty-state">📭 No todos yet. Add one to get started!</div>';
        updateItemCount(0);
        return;
    }

    const filteredTodos = filterTodos();

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `<div class="empty-state">✨ No ${currentFilter} todos</div>`;
        updateItemCount(0);
        return;
    }

    filteredTodos.forEach(todo => {
        const li = createTodoElement(todo);
        todoList.appendChild(li);
    });

    updateItemCount(todos.filter(t => !t.completed).length);
}

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;

    // Checkbox (visual indicator)
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.disabled = true;

    // Text span
    const textSpan = document.createElement('span');
    textSpan.className = 'todo-text';
    textSpan.textContent = todo.text;

    // Edit input
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'todo-edit-input';
    editInput.value = todo.text;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = '❌ Delete';

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(editInput);
    li.appendChild(deleteBtn);

    return li;
}

function filterTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

function updateItemCount(count) {
    itemCount.textContent = count === 1 ? '1 item left' : `${count} items left`;
}

// ============ LOCALSTORAGE ============
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
    const data = localStorage.getItem(STORAGE_KEY);
    todos = data ? JSON.parse(data) : [];
}
