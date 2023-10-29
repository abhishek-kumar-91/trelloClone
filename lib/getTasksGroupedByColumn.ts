import { databases } from "@/appwrite";
import { Board, Column, TypedColumn } from "@/typing";

export const getTasksGroupedByColumn = async () => {
    const data = databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!
    );

    const tasks = (await data).documents
    console.log(data)
    const columns = tasks.reduce((acc,task) => {
        if(!acc.get(task.status)){
            acc.set(task.status, {
                id: task.status,
                tasks: []
            });
        }

        acc.get(task.status)!.tasks.push({
            $id: task.$id,
            $createdAt: task.$createdAt,
            title: task.title,
            status: task.status,
            ...(task.image && {image: JSON.parse(task.image)})
        });
        
        return acc;
    }, new Map<TypedColumn, Column>)
    

    const columnsTypes: TypedColumn[] = ["task", "inprogress", "assigned", "done"]

    for(const columnsType of columnsTypes){
        if(!columns.get(columnsType)){
            columns.set(columnsType, {
                id: columnsType,
                tasks: []
            });
        }
    }

    

    const sortedColumns = new Map (
        Array.from(columns.entries()).sort(
            (a,b) =>(
                columnsTypes.indexOf(a[0]) - columnsTypes.indexOf(b[0])
            )
        )
    );

    const board: Board = {
        columns: sortedColumns
    }

    console.log("Board value",board)
    return board;
};
