"use client";

import { Droppable } from "@hello-pangea/dnd";
import { AddTask } from "@/components/board/add-task";
import { ColumnHeader } from "@/components/board/column-header";
import { TaskCard } from "@/components/board/task-card";
import type { ColumnWithTasks, Task } from "@/lib/types";

interface ColumnProps {
  column: ColumnWithTasks;
  canDelete: boolean;
  onRenameColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddTask: (columnId: string, title: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function Column({
  column,
  canDelete,
  onRenameColumn,
  onDeleteColumn,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: ColumnProps) {
  return (
    <div className="flex h-full w-[280px] min-w-[280px] shrink-0 flex-col rounded-xl bg-surface-overlay/50 p-2">
      <ColumnHeader
        title={column.title}
        taskCount={column.tasks.length}
        canDelete={canDelete}
        onRename={(title) => onRenameColumn(column.id, title)}
        onDelete={() => onDeleteColumn(column.id)}
      />

      <Droppable droppableId={column.id} type="task">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg p-1 transition-colors ${
              snapshot.isDraggingOver ? "bg-accent-muted" : ""
            }`}
          >
            {column.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="mt-1 pt-1">
        <AddTask onAdd={(title) => onAddTask(column.id, title)} />
      </div>
    </div>
  );
}
