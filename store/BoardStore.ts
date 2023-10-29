import { ID, databases, storage } from '@/appwrite';
import { getTasksGroupedByColumn } from '@/lib/getTasksGroupedByColumn';
import uploadImage from '@/lib/uploadImage';
import { Board, Column, Image, Task, TypedColumn } from '@/typing';
import { create } from 'zustand';

interface BoardState {
  board: Board;
  getBoard: () =>void;
  setBoardState: (board: Board) => void;
  updateTaskInDB: (task: Task, columnId: TypedColumn) => void;
  newTaskInput: string;
  searchString: string;
  newTaskType: TypedColumn;
  image: File | null;
  addTask: (task: string, columnId: TypedColumn, image?: File | null) => void;
  setNewTaskInput:(input: string) => void;
  setSearchString: (searchString: string) => void;
  deleteTask: (taskIndes: number, taskId: Task, id: TypedColumn) => void;
  setNewTaskType: (columnId: TypedColumn) => void;
  setImage: (image: File | null) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: {
    columns: new Map<TypedColumn, Column>(),
  },

  searchString:"",
  newTaskInput:"",
  setSearchString: (searchString) => set({searchString}),
  newTaskType:"task",
  image: null,
  getBoard: async () => {
  
      const board = await getTasksGroupedByColumn();
      set({ board }); // Update the state with the fetched data
   
  },

  setBoardState: (board) => set({ board }),
  setImage: (image: File | null) => set({image}),

  deleteTask: async(taskIndes: number, task: Task, id: TypedColumn) => {
    const newColumns = new Map(get().board.columns);

    newColumns.get(id)?.tasks.splice(taskIndes, 1);
    set({board: {columns: newColumns}});

    if(task.image){
      await storage.deleteFile(task.image.bucketId, task.image.fileId);

    }

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      task.$id
    );
  },

  setNewTaskInput: (input:string) => set({newTaskInput: input}),
  setNewTaskType: (columnId: TypedColumn) => set({newTaskType: columnId}),

  updateTaskInDB: async(task, columnId) => {
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      task.$id, {
        title: task.title,
        status: columnId,
      }
    );
  },

  addTask: async(task: string, columnId: TypedColumn, image?: File | null) => {
      let file: Image | undefined;

      if(image) {
        const fileUploaded = await uploadImage(image);
        if(fileUploaded){
          file = {
            bucketId: fileUploaded.bucketId,
            fileId: fileUploaded.$id,
          }
        }
      }

      const {$id} = await databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
        ID.unique(),
        {
          title: task,
          status: columnId,
          ...(file && {image: JSON.stringify(file)}),

        }
      );

      set({newTaskInput: ""});
      set((state) =>{
        const newColumns = new Map(state.board.columns);

        const newTask: Task = {
          $id,
          $createdAt: new Date().toISOString(),
          title: task,
          status: columnId,
          ...(file && {image: file})
        };

        const column = newColumns.get(columnId)

        if(!column){
          newColumns.set(columnId, {
            id: columnId,
            tasks: [newTask],
          })
        }else{
          newColumns.get(columnId)?.tasks.push(newTask);
        }

        return {
          board: {
            columns: newColumns,
            
          }
        }
      })
  }

}));

