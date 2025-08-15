import { openai } from "@/utils/openai";
import { personaPrompts } from "@/utils/personas";

export async function POST (request : Request) {
    const { persona , messages } = await request.json();

    const systemMessage = {
        role: "system" as const, 
        content: personaPrompts[persona as keyof typeof personaPrompts]
    };

    const allMessages = [systemMessage, ...messages];

    const response = await openai.chat.completions.create({
        model : "gpt-4o-mini",
        messages : allMessages
    })

    return Response.json({
        response : response.choices[0].message.content
    })
}