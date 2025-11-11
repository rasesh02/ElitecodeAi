import { createClient } from "redis";
import { CppTestRunner } from "./cpp_runner.js";
import { PythonTestRunner } from "./python_runner.js";
import { JsTestRunner } from "./js_runner.js";
import { JavaTestRunner } from "./java_runner.js";

const main = async () => {
  const cppRunner = new CppTestRunner();
  const pyRunner = new PythonTestRunner();
  try {
    const redisClient = createClient({ url: process.env.REDIS_URL || "redis://redis:6379" });
    await redisClient.connect();
    console.log("Connected to Redis");

    while (true) {
      const message = await redisClient.brPop("message", 0);
      if (!message) continue;

      const { element } = message;
      const job = JSON.parse(element);
      console.log(job);
      const language = job.language;

      switch (language) {
        case "C++":
          const cppResult = await cppRunner.execute(job);
          console.log("sendng back", job.job_id);
          await redisClient.publish(`${job.job_id}`, JSON.stringify(cppResult));
          console.log(`Completed job ${job.job_id}`);
          break;
        case "Python":
          const pyResult = await pyRunner.execute(job);
          console.log("pyResult", pyResult);
          await redisClient.publish(`${job.job_id}`, JSON.stringify(pyResult));
          console.log(`Completed job ${job.job_id}`);
          break;

        case "Java":
          const javaResult = await JavaTestRunner.execute(job);
          console.log("java results", javaResult);
          await redisClient.publish(
            `${job.job_id}`,
            JSON.stringify(javaResult)
          );
          break;

        case "Javascript":
          const jsResult = await JsTestRunner.execute(job);
          await redisClient.lPush(
            `results:${job.job_id}`,
            JSON.stringify(jsResult)
          );
          console.log(`Completed job ${job.job_id}`);
          break;

        default:
          break;
      }
    }
  } catch (error) {
    console.error("Worker error:", error);
    process.exit(1);
  }
};

main();
