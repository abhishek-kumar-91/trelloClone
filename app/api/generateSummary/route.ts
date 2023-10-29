import openai from "@/openai";
import { NextResponse } from "next/server";

export async function POST(request: Request){
    const {tasks} = await request.json();
    console.log(tasks);

    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0.8,
        n: 1,
        stream: false,
        message: [{
            role: "system",
            content: 'When responding, welcome the user always as Mr. Abhishek and say welcome to the trello Limit the response to 200 characters',

        },
        {
            role:"user",
            content: `Hi there, provide a summary of the following tasks. count how many tasks are in each category such as
            Task, inprogress, assigned, done, then tell the user to have a productive day! here 's the data: ${JSON.stringify(
                tasks
            )}`,
        },
    ]
    });

    const {data} = response;

    console.log("data", data);
    console.log(data.choices[0].message);
    return NextResponse.json(data.choices[0].message);
}