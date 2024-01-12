import {
  chatJsonMode,
  createMessage,
  createRuns,
  createThread,
  getMessages,
  getStatus,
} from "./api_call.js";
import express from "express";
import cors from "cors";
const app = express();
const port = 7000;
app.use(cors());
app.get("/openai/allquestion", async (req, res) => {
  try {
    const language = req.query.language;
    let count = 0;

    const thread = await createThread();
    await createMessage(
      thread.id,
      `From the data set in the file, read carefully and combine it with the data you have, then create a set of about 20-30 questions with answers in json format in English and add it to the file. let me download it. The questions will range from easy, medium, difficult and very difficult. Difficult and very difficult level questions require more in-depth knowledge.`
    );

    while (count === 0) {
      const run = await createRuns({ threadId: thread.id });
      let runStatus;

      do {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        runStatus = await getStatus({ runId: run.id, threadId: thread.id });

        console.log(runStatus.status);

        if (runStatus.status === "failed") {
          res.status(500).json({
            error:
              "Error sending too many requests in a short time, please wait 1 minute",
          });
          return;
        }
      } while (runStatus.status !== "completed");

      let mess = await getMessages({ threadId: thread.id, runId: run.id });
      mess = mess
        ? JSON.parse(mess)
            .map(({ content, answers, explainCorrectAnswer }) => ({
              content,
              answers,
              explainCorrectAnswer,
            }))
            .filter(
              (element) =>
                element.content !== undefined && element.answers !== undefined
            )
        : "";

      console.log(mess);

      let json;
      if (mess) {
        if (language === "Japanese") {
          json = JSON.parse(await chatJsonMode(JSON.stringify(mess)));
        } else {
          json = mess;
        }
      }

      json =
        json && (json["commands"] || json["questions"] || json["translations"])
          ? json["commands"] || json["questions"] || json["translations"]
          : json;

      if (json) {
        console.log(json);
        res.json(json);
        return;
      } else {
        count = 0;
      }
    }
  } catch (error) {
    console.error("Error calling API:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
