#!/usr/bin/env node

const GitHubApi = require("github");
const credentials = require('./config/credentials');

const organization = process.argv[2];

if(organization === undefined) {
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
    Promise: require('bluebird'),
    followRedirects: false,
    timeout: 5000
});

github.authenticate({
    type: "basic",
    username: credentials.username,
    password: credentials.password
});

github.repos.getForUser({
	user: organization,
	type: 'owner'
}, (err, repos) => {
	if(err) {
		//console.log(err);
	}
	else {
		repos.map((repo) => {
			github.issues.createLabel({
				owner: organization,
				repo: repo.name,
				name: 'hacktoberfest',
				color: '800080'
			}, (error, status) => {
				if(error) {
					console.log(error);
				}
				github.issues.getForRepo({
					owner: organization,
					repo: repo.name
				}, (errIssue, issues) => {
					issues.map((issue) => {
						console.log(issue);
						github.issues.addLabels({
							owner: organization,
							repo: repo.name,
							number: issue.number,
							body: ['hacktoberfest']
						});
					});
				});
			});
		});
	}
});