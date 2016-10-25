const spawn = require("child_process").spawn;

describe("end-to-end", function() {
  this.timeout(10000);
  
  it("standart flow", function(done) {
    const questions = ["GitHub username", "GitHub password", "access token", "owner of the repositories", "copy labels", "add labels", "predefined labels", "select the issues", "label name", "select the color"];
    const answers = [process.env.USER_NAME, process.env.USER_PASS, "n", process.env.USER_NAME, "n", "a", "n", "a", "test-label", "FFFFFF"].map((a) => a + "\n");
    let currentStep = 0;

    const cli = spawn("node", ["index.js"]);

    cli.stdout.setEncoding("utf8");

    cli.stdout.on("data", function(data) {
      if(data.indexOf(questions[currentStep]) > -1) {
        cli.stdin.write(answers[currentStep]);
        currentStep++;

        if(currentStep === questions.length) {
          return done();
        }
      }
    });

    cli.stderr.on("data", done);
    cli.on("close", done);
  });
});
