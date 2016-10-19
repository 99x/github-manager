const GitHubApi = require("github");
const credentials = require('./config/credentials');

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
    type: "oauth",
    key: '911093047d9a553e69aa',
    secret: 'bac9ee16be0b6caabec3469d3faba61b1ad00211'
}, (err, token) => {
	console.log(err, token);
});

github.authenticate({
    type: "basic",
    username: credentials.username,
    password: credentials.password
});

github.repos.getForUser({
	user: '99xt',
	type: 'owner'
}, (err, repos) => {
	if(err) {
		console.log(err);
	}
	else {
		repos.map((repo) => {
			github.issues.createLabel({
				owner: '99xt',
				repo: repo.name,
				name: 'hacktoberfest',
				color: '800080'
			}, (error, status) => {
				if(error) {
					console.log(error);
				}
				else {
					console.log(status);
				}
			});
		});
	}
});