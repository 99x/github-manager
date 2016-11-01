const assert = require("assert");
const USER_NAME = "github-cli-test";

describe("unit", function () {
  let cli;

  beforeEach(function () {
    cli = require("../");
  });

  var USER_NAME = "github-cli-test";

  it("should get user\"s repositories", function (done) {
    this.timeout(5000);

    cli.getRepositories(process.env.USER_NAME||USER_NAME)
      .then(function (result) {
        assert.ok(Array.isArray(result));
        assert.ok(result.length > 0);
        done();
      }).catch(done);
  });

  it("should not create label without auth", function (done) {
    cli.createLabel({
        name: "test-repo"
      }, process.env.USER_NAME||USER_NAME, "test", "FFFFFF")
      .catch(function () {
        done();
      });
  });

  it("should not create multiple labels without auth", function (done) {
    cli.addLabels({
        name: "test-repo"
      }, 1, process.env.USER_NAME||USER_NAME, [])
      .catch(function () {
        done();
      });
  });

  it("should get labels", function (done) {
    cli.getLabels({
        name: "test-repo"
      }, process.env.USER_NAME||USER_NAME)
      .then(function (result) {
        assert.ok(Array.isArray(result));
        assert.ok(result.length > 0);
        assert.equal(Object.keys(result[0]).length, 2); // Only name and color

        done();
      }).catch(done);
  });

  it("should get issues", function (done) {
    cli.getIssues({
        name: "test-repo"
      }, process.env.USER_NAME||USER_NAME)
      .then(function (result) {
        assert.ok(Array.isArray(result));
        assert.ok(result.length > 0);
        assert.ok(result[0].repo);

        done();
      }).catch(done);
  });

  it("should get repositories", function (done) {
    cli.getRepositories(process.env.USER_NAME||USER_NAME)
      .then(function (result) {
        assert.ok(Array.isArray(result));
        assert.ok(result.length > 0);

        done();
      }).catch(done);
  });

  it("should display error", function () {
    assert.equal(cli.displayError(), "Unknown error :/");
    assert.equal(cli.displayError("test"), "Error: test");
    assert.equal(cli.displayError({
      message: "{ \"message\": \"json-test\"}"
    }), "Error: json-test");
    assert.equal(cli.displayError({
      message: "{ \"error\": \"test\"}"
    }), "Error: { \"error\": \"test\"}");
  });
});