export type Kanban = {
  id: string;
  name: string;
  tasks: Task[];
};

export type Task = {
  id: string;
  name: string;
  description: string;
  isDummy?: boolean;
};

export type KanbanPosition = {
  kanbanId: string;
  index: number;
};
