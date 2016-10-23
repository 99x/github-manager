const GitHubApi = require("github");
const Promise = require('bluebird');
const inquirer = require('inquirer');
// you can define your github-credentials in this file, so you don't have to type it every time
const credentials = require('./config/credentials');

const github = new GitHubApi({
    debug: false,
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
    }).each(issue => issue.repo = repository);
}

function addLabels(repository, issue, owner, labels) {
    github.issues.addLabels({
        owner: owner,
        repo: repository.name,
        number: issue.number,
        body: labels
    });
}

Promise.coroutine(function*() {

    // check for credentials-file
    const {username, password} = (credentials && credentials.username != '' && credentials.password != '')
        ? credentials
        : yield inquirer.prompt([
            {
                type: 'input',
                name: 'username',
                message: 'Enter your GitHub username:'
            },
            {
                type: 'password',
                name: 'password',
                message: 'Enter your GitHub password:'
            }
        ]);

    // This is synchronous
    github.authenticate({
        type: "basic",
        username: username,
        password: password
    });

    const {owner} = yield inquirer.prompt([
        {
            type: 'input',
            name: 'owner',
            message: 'Enter the owner of the repositories:'
        }
    ]);

    const repositories = yield getRepositories(owner);
    const {selectedRepositories} = yield inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedRepositories',
            choices: repositories.map(repo => ({name: repo.name, value: repo})),
            message: 'Please select the repositories:'
        }
    ]);

    if (selectedRepositories.length == 0) {
        return;
    }

    const issues = yield Promise.all(selectedRepositories.map(repo => getIssues(repo, owner)))
        .reduce((all, current) => all.concat(current));

    const {selectedIssues} = yield inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedIssues',
            choices: issues.map(issue => ({name: issue.title, value: issue})),
            message: 'Please select the issues:'
        }
    ]);

    if (selectedIssues.length === 0) {
        return;
    }

    const label = yield inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Please enter the label name:'
        },
        {
            type: 'input',
            name: 'color',
            message: 'Please select the color:',
            validate: color => /^[0-9a-fA-F]{6}$/.test(color) || 'Input a color as a 6 digit hex code.'
        }
    ]);

    yield Promise.resolve(selectedRepositories)
        .each(repo => createLabel(repo, owner, label.name, label.color))
        .then(() => selectedIssues, () => selectedIssues)
        .each(issue => addLabels(issue.repo, issue, owner, [label.name]))
})().catch(e => displayError(e));

function displayError(error) {
    if (!error) {
        console.log('Unknown error :/');
        return;
    }

    let errorMessage = error;
    if (error.message && typeof error.message == 'string') {
        const json = JSON.parse(error.message);
        if (json && json.message) {
            errorMessage = json.message;
        } else {
            errorMessage = error.message;
        }
    }

    console.log(`Error: ${errorMessage}`);
}
