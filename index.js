const GitHubApi = require("github");
const  readlineSync = require('readline-sync');

const organization = process.argv[2];
 
let userName = readlineSync.question('Enter your Github Username: ');
let password = readlineSync.question('Enter your Github Password: ', { hideEchoBack: true });

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
    username: username,
    password: password
});

github.repos.getForUser({
	user: organization,
	type: 'owner'
}, (err, repos) => {
	if(err) console.log(err);
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