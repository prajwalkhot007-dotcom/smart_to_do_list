document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("taskForm");
  const taskList = document.getElementById("taskList");
  const exportBtn = document.getElementById("exportTasks");
  const themeToggle = document.getElementById("themeToggle");

  const priorityColors = {
    High: "#ff6b6b",
    Medium: "#feca57",
    Low: "#1dd1a1",
  };

  const applyColorByPriority = (element, priority) => {
    element.style.borderLeft = `6px solid ${priorityColors[priority] || "#ccc"}`;
  };
  const sortTasksByPriority = () => {
  const priorityValue = { High: 1, Medium: 2, Low: 3, "": 4 };
  const tasksArray = Array.from(taskList.children);

  tasksArray.sort((a, b) => {
    const aPriority = priorityValue[a.dataset.priority] || 4;
    const bPriority = priorityValue[b.dataset.priority] || 4;
    return aPriority - bPriority;
  });

  tasksArray.forEach(task => taskList.appendChild(task));
};

  const loadTasks = () => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => addTask(task.text, task.datetime, task.priority, task.category, false));
  };

  const saveTasks = () => {
    const tasks = [];
    document.querySelectorAll("#taskList li").forEach(item => {
      const text = item.querySelector(".task-text").textContent;
      const datetime = item.querySelector(".task-time").dataset.datetime;
      const priority = item.dataset.priority;
      const category = item.dataset.category;
      tasks.push({ text, datetime, priority, category });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  const setReminder = (taskText, datetime) => {
    const timeDiff = new Date(datetime) - new Date();
    if (timeDiff > 0) {
      setTimeout(() => {
        alert(`Reminder: ${taskText}`);
      }, timeDiff);
    }
  };

  const addTask = (text, datetime, priority, category, shouldSave = true) => {
    const taskItem = document.createElement("li");
    taskItem.draggable = true;
    taskItem.dataset.priority = priority;
    taskItem.dataset.category = category;
    taskItem.className = "task-item";
    applyColorByPriority(taskItem, priority);

    const taskSpan = document.createElement("span");
    taskSpan.className = "task-text";
    taskSpan.textContent = text;

    const taskTime = document.createElement("div");
    taskTime.className = "task-time";
    taskTime.textContent = datetime ? `⏰ ${datetime}` : "";
    taskTime.dataset.datetime = datetime;

    const taskMeta = document.createElement("div");
    taskMeta.className = "task-meta";
    taskMeta.innerHTML = `<strong>Priority:</strong> ${priority || 'None'} | <strong>Category:</strong> ${category || 'None'}`;

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "✔️";
    completeBtn.onclick = () => {
      taskItem.classList.toggle("completed");
      saveTasks();
    };

    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = () => {
      const newText = prompt("Edit task:", taskSpan.textContent);
      if (newText !== null && newText.trim() !== "") {
        taskSpan.textContent = newText;
        saveTasks();
      }
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.onclick = () => {
      taskItem.remove();
      saveTasks();
    };

    actionsDiv.append(completeBtn, editBtn, deleteBtn);
    taskItem.append(taskSpan, actionsDiv, taskTime, taskMeta);
    taskList.appendChild(taskItem);
    sortTasksByPriority();  

    taskItem.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", taskItem.outerHTML);
      e.dataTransfer.effectAllowed = "move";
      taskItem.remove();
    });

    if (shouldSave) {
      saveTasks();
      if (datetime) setReminder(text, datetime);
    }
  };

  taskForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const taskText = document.getElementById("taskInput").value;
    const taskDateTime = document.getElementById("taskDateTime").value;
    const taskPriority = document.getElementById("taskPriority").value;
    const taskCategory = document.getElementById("taskCategory").value;

    addTask(taskText, taskDateTime, taskPriority, taskCategory);
    taskForm.reset();
  });

  taskList.addEventListener("dragover", e => e.preventDefault());

  taskList.addEventListener("drop", e => {
    e.preventDefault();
    const html = e.dataTransfer.getData("text/plain");
    taskList.insertAdjacentHTML("beforeend", html);
    sortTasksByPriority(); 
    saveTasks();
  });

  exportBtn.addEventListener("click", () => {
    const tasks = localStorage.getItem("tasks");
    const blob = new Blob([tasks], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tasks.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
  });

  loadTasks();
});
