import { Kanban, KanbanPosition, Task } from "./types";

const LOCAL_STORAGE_KEY = "my-kban-data";

export function loadData(): Kanban[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return [
    { id: crypto.randomUUID(), name: "未着手", tasks: [] },
    { id: crypto.randomUUID(), name: "保留中", tasks: [] },
    { id: crypto.randomUUID(), name: "実施中", tasks: [] },
    { id: crypto.randomUUID(), name: "完了", tasks: [] },
  ];
}

export function saveData(data: Kanban[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

export function createTask(kanbans: Kanban[], kanbanId: string) {
  const kanbansCopy = [...kanbans];
  const taskId = crypto.randomUUID();
  kanbansCopy
    .find((kanban) => kanban.id === kanbanId)
    ?.tasks.push({
      id: taskId,
      name: "",
      description: "",
    });
  return { kanbans: kanbansCopy, taskId };
}

export function deleteTask(kanbans: Kanban[], taskId: string) {
  return kanbans.map((kanban) => {
    return {
      ...kanban,
      tasks: kanban.tasks.filter((task) => task.id != taskId),
    };
  });
}

export function moveTask(
  kanbans: Kanban[],
  taskId: string,
  position: KanbanPosition
) {
  const kanbansCopy = [...kanbans];
  const task = kanbansCopy
    .flatMap((kanban) => kanban.tasks)
    .find((task) => task.id === taskId);
  if (!task) {
    return kanbansCopy;
  }
  task.isDummy = true;
  kanbansCopy
    .find((kanban) => kanban.id === position.kanbanId)
    ?.tasks.splice(position.index, 0, { ...task, isDummy: undefined });
  return kanbansCopy.map((kanban) => {
    return {
      ...kanban,
      tasks: kanban.tasks.filter((task) => !task.isDummy),
    };
  });
}

export function editTask(
  kanbans: Kanban[],
  taskId: string,
  editFunction: (task: Task) => unknown
) {
  const kanbansCopy = [...kanbans];
  const task = kanbansCopy
    .flatMap((kanban) => kanban.tasks)
    .find((task) => task.id === taskId);
  if (!task) {
    return kanbansCopy;
  }
  editFunction(task);
  return kanbansCopy;
}
