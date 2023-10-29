'use client'
import { Task, TypedColumn } from '@/typing';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import { useBoardStore } from '@/store/BoardStore';
import { useModalStore } from '@/store/ModalStore';

type Props = {
  id: TypedColumn;
  tasks: Task[];
  index: number;
};

const idToColumnText: {
  [key in TypedColumn]: string;
} = {
  task: "Task",
  inprogress: "In Progress",
  assigned: "Assigned",
  done: "Done",
};

function Column({ id, tasks, index }: Props) {

    const [ searchString, setNewTaskType] = useBoardStore((state)=> [
      state.searchString,
      state.setNewTaskType
    ]);
    const openModal = useModalStore((state) => state.openModal);

    const handleAddTask = () =>{

      setNewTaskType(id);
      openModal();
    }

  return (
    <Draggable draggableId={id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Droppable droppableId={index.toString()} type='card'>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`p-2 rounded-2xl shadow-sm ${
                  snapshot.isDraggingOver ? 'bg-green-200' : 'bg-white/50'
                }`}
              >
                <h2 className='flex justify-between font-bold text-xl p-2'>
                  {idToColumnText[id]}
                  <span className='text-gray-500 font-normal bg-gray-200 rounded-full text-sm px-2 py-1'>
                    {!searchString ? tasks.length: tasks.filter((task) => task.title.toLowerCase().includes(searchString.toLowerCase())).length} 
                  </span>
                </h2>

                <div className='space-y-2'>
                  {tasks.map((task, index) => {
                    
                    if(searchString && !task.title.toLocaleLowerCase().includes(searchString.toLocaleLowerCase())) return null;
                    
                    return (
                    <Draggable
                      key={task.$id}
                      draggableId={task.$id}
                      index={index}
                    >
                      {(provided) => (
                        <TaskCard
                          task={task}
                          index={index}
                          id={id}
                          innerRef={provided.innerRef}
                          draggableProps={provided.draggableProps}
                          dragHandleProps={provided.dragHandleProps}
                        />
                      )}
                    </Draggable>
                  )})}
                  {provided.placeholder} 
                 
                  <div className='flex items-end justify-end p-2'>
                    <button onClick={handleAddTask} className='text-green-500 hover:text-green-600'>
                      <PlusCircleIcon className='h-10 w-10' />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}

export default Column;
