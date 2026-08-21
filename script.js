// Seleciona os elementos da página
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");
const taskCounter = document.getElementById("task-counter");
const filterButtons = document.querySelectorAll(".filter-button");

// Filtro atualmente selecionado: "all", "pending" ou "completed"
let currentFilter = "all";

// Chave usada para salvar as tarefas no localStorage
const STORAGE_KEY = "todo-list-tasks";

// Lista de tarefas em memória
// Cada tarefa é um objeto: { id, text, completed }
let tasks = [];

// Salva o array de tarefas no localStorage (convertido em texto JSON)
function saveTasks() {

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

}

// Carrega as tarefas salvas no localStorage, se existirem
function loadTasks() {

    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (!savedTasks) {

        return [];

    }

    try {

        return JSON.parse(savedTasks);

    } catch {

        // Se o conteúdo salvo estiver corrompido, começa com lista vazia
        return [];

    }

}

// Gera um id simples e único pra cada tarefa
function generateId() {

    return Date.now().toString();

}

// Cria o elemento <li> correspondente a uma tarefa
function createTaskElement(task) {

    const li = document.createElement("li");

    li.className = "task-item";
    li.dataset.id = task.id;

    if (task.completed) {

        li.classList.add("completed");

    }

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Marcar "${task.text}" como ${task.completed ? "pendente" : "concluída"}`);

    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");

    text.className = "task-text";
    text.textContent = task.text;

    text.addEventListener("dblclick", () => startEditingTask(li, task));

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "✕";
    deleteButton.setAttribute("aria-label", "Excluir tarefa");

    deleteButton.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, text, deleteButton);

    return li;

}

// Retorna apenas as tarefas que correspondem ao filtro atual, sem alterar o array original
function getFilteredTasks() {

    if (currentFilter === "pending") {

        return tasks.filter(task => !task.completed);

    }

    if (currentFilter === "completed") {

        return tasks.filter(task => task.completed);

    }

    return tasks;

}

// Redesenha a lista inteira na tela a partir do array "tasks"
function renderTasks() {

    taskList.innerHTML = "";

    const filteredTasks = getFilteredTasks();

    filteredTasks.forEach(task => {

        taskList.appendChild(createTaskElement(task));

    });

    const isEmpty = filteredTasks.length === 0;

    emptyMessage.classList.toggle("hidden", !isEmpty);

    emptyMessage.textContent = tasks.length === 0
        ? "Nenhuma tarefa por aqui ainda."
        : "Nenhuma tarefa nesse filtro.";

    updateCounter();

    saveTasks();

}

// Atualiza o texto do contador de tarefas pendentes
function updateCounter() {

    const pendingCount = tasks.filter(task => !task.completed).length;

    if (tasks.length === 0) {

        taskCounter.textContent = "";

        return;

    }

    if (pendingCount === 0) {

        taskCounter.textContent = "tudo feito ✓";

        return;

    }

    const label = pendingCount === 1 ? "pendente" : "pendentes";

    taskCounter.textContent = `${pendingCount} ${label}`;

}

// Adiciona uma nova tarefa à lista
function addTask(text) {

    const trimmedText = text.trim();

    if (trimmedText === "") {

        return;

    }

    tasks.push({

        id: generateId(),
        text: trimmedText,
        completed: false

    });

    renderTasks();

}

// Alterna o estado concluído/pendente de uma tarefa
function toggleTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) {

        return;

    }

    task.completed = !task.completed;

    renderTasks();

}

// Substitui o texto da tarefa por um campo editável, ao dar duplo clique
function startEditingTask(li, task) {

    const input = document.createElement("input");

    input.type = "text";
    input.className = "task-edit-input";
    input.value = task.text;

    const textSpan = li.querySelector(".task-text");

    li.replaceChild(input, textSpan);

    input.focus();
    input.select();

    // Salva ao perder o foco (clicar fora)
    input.addEventListener("blur", () => finishEditingTask(task.id, input.value));

    // Salva com Enter, cancela com Esc
    input.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {

            input.blur();

        }

        if (event.key === "Escape") {

            input.value = task.text;

            input.blur();

        }

    });

}

// Confirma a edição: atualiza o texto da tarefa (ou remove, se ficou vazia)
function finishEditingTask(id, newText) {

    const trimmedText = newText.trim();

    if (trimmedText === "") {

        deleteTask(id);

        return;

    }

    const task = tasks.find(task => task.id === id);

    if (task) {

        task.text = trimmedText;

    }

    renderTasks();

}

// Remove uma tarefa da lista
function deleteTask(id) {

    tasks = tasks.filter(task => task.id !== id);

    renderTasks();

}

// Captura o envio do formulário (clique no botão ou Enter no input)
taskForm.addEventListener("submit", (event) => {

    event.preventDefault();

    addTask(taskInput.value);

    taskInput.value = "";

    taskInput.focus();

});

// Captura o clique nos botões de filtro
filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        currentFilter = button.dataset.filter;

        filterButtons.forEach(btn => btn.classList.toggle("active", btn === button));

        renderTasks();

    });

});

// Ao carregar a página, recupera as tarefas salvas (se houver) e renderiza
tasks = loadTasks();

renderTasks();