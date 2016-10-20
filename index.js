const GitHubApi = require("github");
const Promise = require('bluebird');
const readlineSync = require('readline-sync');
const organization = process.argv[2];
const labelName = process.argv[3];
const labelColor = process.argv[4];

const username = readlineSync.question('Enter your Github Username: ');
const password = readlineSync.question('Enter your Github Password: ', { hideEchoBack: true });

if(!organization || !labelName || !labelColor) {
	return;
}

const github = new GitHubApi({
    debug: true,
    protocol: "https",
    host: "api.github.com",
    pathPrefix: "",
    headers: {
        "user-agent": "My-Cool-GitHub-App"
    },
    Promise: Promise,
    followRedirects: false,
    timeout: 5000
});

github.authenticate({
	type: "basic",
    username: username,
    password: password
});

Promise.promisifyAll(github.issues);
Promise.promisifyAll(github.repos);

function getRepositories(user) {
	return github.repos.getForUser({
		user: user,
		type: 'owner'
	});
}

function createLabel(repository, owner, name, color) {
	return github.issues.createLabel({
		owner: owner,
		repo: repository.name,
		name: name,
		color: color
	});
}

function getIssues(repository, owner) {
	return github.issues.getForRepo({
		owner: owner,
		repo: repository.name
	});
}

function addLabels(repository, issue, owner, labels) {
	github.issues.addLabels({
		owner: owner,
		repo: repository.name,
		number: issue.number,
		body: labels
	});
}

getRepositories(organization)
	.each(repository => createLabel(repository, organization, labelName, labelColor))
	.each(repository => {
		getIssues(repository, organization)
		.each(issue => addLabels(repository, issue, organization, [labelName]))
	});
