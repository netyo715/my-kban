import { Fragment, useEffect, useRef, useState } from "react";
import { Kanban, KanbanPosition, Task } from "./types";
import {
  createTask,
  deleteTask,
  editTask,
  loadData,
  moveTask,
  saveData,
} from "./scripts";

function margeClass(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function App() {
  const [kanbans, setKanbans] = useState<Kanban[]>([]);
  const [focusedId, setFocusedId] = useState<string | undefined>();
  const [isTaskDragged, setIsTaskDragged] = useState(false);
  const [dropPosition, setDropPosition] = useState<KanbanPosition>();
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setKanbans(loadData());
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      saveData(kanbans);
    }, 1000);
    return () => {
      clearTimeout(handler);
    };
  }, [kanbans]);

  const forcusedTask = kanbans
    .flatMap((kanban) => kanban.tasks)
    .find((task) => task.id === focusedId);

  const handleDrop = () => {
    if (!focusedId || !isTaskDragged || !dropPosition) {
      setIsTaskDragged(false);
      return;
    }
    setKanbans(moveTask(kanbans, focusedId, dropPosition));
    setIsTaskDragged(false);
  };

  const handleChange = (
    editFunction: (task: Task) => unknown,
    taskId: string
  ) => {
    const newKanbans = editTask(kanbans, taskId, editFunction);
    setKanbans(newKanbans);
  };

  const handleCreateButtonClick = (kanbanId: string) => {
    const { kanbans: newKanbans, taskId } = createTask(kanbans, kanbanId);
    setKanbans(newKanbans);
    setFocusedId(taskId);
  };

  useEffect(() => {
    if (nameInputRef.current) {
      // こう書くと何故か新規作成のときだけfocus出来て都合が良い
      nameInputRef.current.focus();
    }
  }, [focusedId]);

  return (
    <div className="h-screen w-screen grid grid-cols-[1fr_360px]">
      <div
        className="grid gap-3 m-3 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]"
        onMouseDown={() => {
          setFocusedId(undefined);
        }}
      >
        {kanbans.map((kanban) => {
          return (
            <div
              key={kanban.id}
              className="bg-lime-100 rounded-3xl"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => {
                setDropPosition({
                  kanbanId: kanban.id,
                  index: kanban.tasks.length,
                });
              }}
            >
              <div className="px-4 pt-2 font-bold">
                <span>{kanban.name}</span>
              </div>
              <div className="flex flex-col p-2">
                {kanban.tasks.map((task, index) => {
                  return (
                    <Fragment key={task.id}>
                      <div
                        className={margeClass(
                          "h-1 rounded",
                          isTaskDragged &&
                            kanban.id == dropPosition?.kanbanId &&
                            index == dropPosition?.index
                            ? "bg-blue-300"
                            : "bg-transparent"
                        )}
                        onDragEnter={(e) => {
                          setDropPosition({ kanbanId: kanban.id, index });
                          e.stopPropagation();
                        }}
                      ></div>
                      <div
                        className={margeClass(
                          "h-9 py-1 px-2 rounded-md flex justify-between gap-2 border-2",
                          task.id === focusedId
                            ? "border-blue-500"
                            : "border-lime-50",
                          task.id === focusedId && isTaskDragged
                            ? "bg-gray-200"
                            : "bg-lime-50"
                        )}
                        onMouseDown={(e) => {
                          setFocusedId(task.id);
                          e.stopPropagation();
                        }}
                        draggable
                        onDragEnter={(e) => {
                          setDropPosition({ kanbanId: kanban.id, index });
                          e.stopPropagation();
                        }}
                        onDragStart={() => setIsTaskDragged(true)}
                        onDragEnd={() => setIsTaskDragged(false)}
                      >
                        <span className="flex-1 overflow-ellipsis overflow-hidden whitespace-nowrap">
                          {task.name}
                        </span>
                        <div
                          className="flex justify-center w-5 bg-lime-100 rounded-xl cursor-pointer"
                          onClick={() =>
                            setKanbans(deleteTask(kanbans, task.id))
                          }
                        >
                          <span>x</span>
                        </div>
                      </div>
                    </Fragment>
                  );
                })}
                <div
                  className={margeClass(
                    "h-1 rounded",
                    isTaskDragged &&
                      kanban.id == dropPosition?.kanbanId &&
                      dropPosition?.index == kanban.tasks.length
                      ? "bg-blue-300"
                      : "bg-transparent"
                  )}
                ></div>
                {!isTaskDragged && (
                  <div className="flex items-center justify-center">
                    <div
                      className="h-9 w-9 flex items-center justify-center rounded-3xl bg-lime-50 cursor-pointer"
                      onClick={() => {
                        handleCreateButtonClick(kanban.id);
                      }}
                    >
                      <span className="select-none font-bold">+</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-full bg-lime-100">
        {forcusedTask ? (
          <div className="flex flex-col gap-2 p-2">
            <input
              className="bg-transparent font-bold text-2xl"
              value={forcusedTask.name}
              onChange={(e) => {
                handleChange((task) => {
                  task.name = e.target.value;
                }, forcusedTask.id);
              }}
              ref={nameInputRef}
            />
            <span>詳細</span>
            <textarea
              className="h-52 bg-lime-50 rounded-md"
              value={forcusedTask.description}
              onChange={(e) => {
                handleChange((task) => {
                  task.description = e.target.value;
                }, forcusedTask.id);
              }}
            ></textarea>
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span>タスクを選択するとここに詳細が表示されます</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
