import OpenAI from "openai";
const openai = new OpenAI();
const assistant_id = "asst_T0rjpnrZOajk4POiZRBFyQWe";
export async function chatJsonMode(json) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You is a useful assistant designed to translate languages from English to Japanese with JSON output",
      },
      { role: "user", content: json },
    ],
    model: "gpt-3.5-turbo-1106",
    response_format: { type: "json_object" },
  });
  return completion.choices[0].message.content;
  // console.log(completion.choices[0].message.content);
}
export async function createThread() {
  try {
    return await openai.beta.threads.create();
  } catch (error) {
    console.log(error.name, error.message);
    throw error;
  }
}
export async function createMessage(threadId, userQuestion) {
  try {
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userQuestion,
    });
  } catch (error) {
    console.log(error.name, error.message);
    throw error;
  }
}

export async function getMessages({ threadId, runId }) {
  try {
    console.log(threadId);
    const messages = await openai.beta.threads.messages.list(threadId);
    // console.log(messages);
    // Find the last message for the current run
    const lastMessageForRun = messages.data
      .filter(
        (message) => message.run_id === runId && message.role === "assistant"
      )
      .pop();
    console.log(lastMessageForRun.content[0].text.value);
    console.log(lastMessageForRun.content[0].text.annotations[0]);
    // If an assistant message is found, console.log() it
    if (lastMessageForRun) {
      if (lastMessageForRun.content[0].text.annotations[0])
        return await openai.files.retrieveContent(
          lastMessageForRun.content[0].text.annotations[0]?.file_path.file_id
        );
      else {
        // const regex = /sandbox:\/mnt\/data\/file-([\w-]+)/;
        // const match = lastMessageForRun.content[0].text.value.match(regex);
        // if (match)
        //   return await openai.files.retrieveContent(`file-${match[1]}`);
        // else return null;
      }
    }
    return null;
  } catch (error) {
    console.log(error.name, error.message);
    throw error;
  }
}
export async function createRuns({ threadId }) {
  try {
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistant_id,
    });
    return run;
  } catch (error) {
    console.log("run");
    console.log(error.name, error.message);
    throw error;
  }
}

export async function getStatus({ threadId, runId }) {
  try {
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    return runStatus;
  } catch (error) {
    console.log("getStatus");
    console.log(error.name, error.message);
    throw error;
  }
}
export async function submitToolOutputs({ threadId, runId, toolOutputItems }) {
  try {
    await openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
      tool_outputs: toolOutputItems,
    });
  } catch (error) {
    console.log("output tool");
    console.log(error.name, error.message);
    throw error;
  }
}
