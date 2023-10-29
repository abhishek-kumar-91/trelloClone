'use client'
import { useBoardStore } from '@/store/BoardStore';
import { useEffect } from 'react';
import { DragDropContext, DropResult, Droppable, Draggable } from 'react-beautiful-dnd';
import Column from '@/components/Column';

function Board() {
  const [board, getBoard, setBoardState, updateTaskInDB] = useBoardStore((state) => [ 
    state.board,
   state.getBoard,
   state.setBoardState,
   state.updateTaskInDB
  ]);

  useEffect(() => {
    getBoard();

  }, [getBoard]);

  const handleDnDragEnd = (result: DropResult) => {
    // Handle the drag-and-drop logic here

    const {source, destination, type} = result;
    
    if(!destination) return;

    if(type === "column"){
      const entries = Array.from(board.columns.entries());
      const [removed] = entries.splice(source.index, 1)
      entries.splice(destination.index, 0, removed);
      const rearrangedColumns = new Map(entries);
      setBoardState ({
        ...board,
         columns: rearrangedColumns
      });
    }

    const columns = Array.from(board.columns);
    const startColIndex = columns[Number(source.droppableId)];
    const finishColIndex = columns[Number(destination.droppableId)];

    const startCol: Column = {
      id: startColIndex[0],
      tasks: startColIndex[1].tasks,
    };

    const finishCol: Column = {
      id: finishColIndex[0],
      tasks: finishColIndex[1].tasks,
    };

    if(!startCol || !finishCol) return;

    if(source.index === destination.index && startCol === finishCol) return;

    const newTasks = startCol.tasks;
    const [taskMoved] = newTasks.splice(source.index, 1);

    if(startCol.id === finishCol.id){
      newTasks.splice(destination.index, 0, taskMoved);
      const newCol = {
        id: startCol.id,
        tasks: newTasks,
      };

      const newColumns =  new Map(board.columns);
      newColumns.set(startCol.id, newCol);

      setBoardState({...board, columns: newColumns});
    }else{
        const finishTasks = Array.from(finishCol.tasks);
        finishTasks.splice(destination.index, 0, taskMoved);

        const newColumns =  new Map(board.columns);
        const newCol = {
          id: startCol.id,
          tasks: newTasks,
        };

        newColumns.set(startCol.id, newCol);
        newColumns.set(finishCol.id, {
          id: finishCol.id,
          tasks: finishTasks,
        });
        updateTaskInDB(taskMoved, finishCol.id);
        console.log(finishCol.id);
        setBoardState({...board, columns:newColumns})
    }
  };

  return (
    <DragDropContext onDragEnd={handleDnDragEnd}>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-5 max-w-7xl mx-auto'>
        {Array.from(board.columns.entries()).map(([id, column], index) => (
          <Droppable key={id} droppableId={id} direction='horizontal' type='task'>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className='column-wrapper'
              >
                <Column key={id} id={id} tasks={column.tasks} index={index} />
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}

export default Board;
