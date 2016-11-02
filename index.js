const gitHubApi = require("github");
const Promise = require('bluebird');
const inquirer = require('inquirer');
const fs = require('fs');
const predefinedLabels = require('./config/labels');

//initialize GitHub API from node-github
const github = new gitHubApi({
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

//Promisify github API with Bluebird
Promise.promisifyAll(github.authorization);
Promise.promisifyAll(github.issues);
Promise.promisifyAll(github.repos);

/**
 * get repositories
 * @param {string} user - username
 */

function getRepositories(user) {
    return github.repos.getForUser({
        user: user,
        type: 'owner'
    });
}

/**
 * get repository commits
 * @param {string} repositorie - repositories
 * @param {string} owner - repo owner
 */

function getRepositoryCommits(repositories, owner) {
    return repositories.map(repo => {
        return github.repos.getCommits({
            owner: owner,
            repo: repo.name,
            per_page: 100
        });
    });
}

/**
 * get repository pull requests
 * @param {string} repositorie - repositories
 * @param {string} owner - repo owner
 */

function getRepositoryPullRequests(repositories, owner) {
    return repositories.map(repo => {
        return github.pullRequests.getAll({
            owner: owner,
            repo: repo.name,
            per_page: 100,
            state: "all"
        });
    });
}

/**
 * get issues for Organization
 * @param {string} owner - repo owner
 */

function getNoOfIssuesForOrg(owner) {
    return github.issues.getForOrg({
        org: owner,
        state: 'all',
        per_page: 100
    });
}

/**
 * create label
 * @param {string} repository - repo name
 * @param {string} owner - repo owner
 * @param {string} name - label name
 * @param {string} color - label color without `#`
 */

function createLabel(repository, owner, name, color) {
    return github.issues.createLabel({
        owner: owner,
        repo: repository.name,
        name: name,
        color: color
    }).then(function() {
      return console.log("Label: '" + name + "' created in repo '" + repository.name + "'");
    }).catch(function(err) {
      if (err && err.code === 422) {
          console.log("Label: '" + name + "' already exists in repo '" + repository.name + "'");
      } else {
          console.log("Failed to create label in '" + repository.name + "'");
      }
      
      // Propagate error to the tests
      throw err;
    });
}

/**
 * get issues
 * @param {string} repository - repo name
 * @param {string} owner - repo owner
 */

function getIssues(repository, owner) {
    return github.issues.getForRepo({
        owner: owner,
        repo: repository.name
    }).each(issue => issue.repo = repository);
}

/**
 * get labels
 * @param {string} repository - repo name
 * @param {string} owner - repo owner
 */

function getLabels(repository, owner) {
    return github.issues.getLabels({
        owner: owner,
        repo: repository.name
    }).map(label => ({name: label.name, color: label.color}));
}

/**
 * add labels
 * @param {string} repository - repo name
 * @param {string} owner - repo owner
 * @param {string} name - label name
 * @param {string} color - label color without `#`
 */

function addLabels(repository, issue, owner, labels) {
    return github.issues.addLabels({
        owner: owner,
        repo: repository.name,
        number: issue.number,
        body: labels
    });
}

/**
 * login to GitHub
 */

function loginBasic() {
    return inquirer.prompt([
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
    ]).then(login => {
        github.authenticate({
            type: "basic",
            username: login.username,
            password: login.password
        });
    });
}

function cliReport() {

}

/**
 * retrieve login token
 */

function loginToken() {
    return new Promise(function (resolve, reject) {
        fs.readFile('.access-token', function (error, token) {
            if (error) {
                reject(error);
            } else {
                resolve(github.authenticate({type: "token", token: token}));
            }
        });
    });
}

/**
 * create token
 */

function createToken() {
    return inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmToken',
            message: 'Do you wish to create an access token to GitHub?'
        }
    ]).then(answer => {
        if (answer.confirmToken) {
            return github.authorization.create({
                scopes: ['repo'],
                note: 'github-manager-cli'
            }).then(result => fs.writeFile('.access-token', result.token));
        }
    });
}

Promise.coroutine(function*() {
    yield loginToken().catch(error => loginBasic().then(createToken));

    const {owner} = yield inquirer.prompt([
        {
            type: 'input',
            name: 'owner',
            message: 'Enter the owner of the repositories:'
        }
    ]);

    const repositories = yield getRepositories(owner);

    if(process.argv[2] === '--report') {
        const reps = yield Promise.all(getRepositoryCommits(repositories, owner));
        let totalCommits = 0;
        reps.map(a => {
            totalCommits += a.length;
        });

        const prs = yield Promise.all(getRepositoryPullRequests(repositories, owner));
        let totalPRs = 0;
        prs.map(a => {
            totalPRs += a.length;
        });

        const issuesForOrg = yield Promise.all(repositories.map(repo => getIssues(repo, owner)))

        console.log('Number of organinzation commits: ', totalCommits);
        console.log('Number of organinzation PRS: ', totalPRs);
        console.log('Number of issues: ', issuesForOrg.length);

        process.exit();
    }

    const {confirmLabelCopy} = yield inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmLabelCopy',
            message: 'Do you want to copy labels from one repo to another?'
        }
    ]);

    if (confirmLabelCopy) {

        const {copyFromRepository} = yield inquirer.prompt([
            {
                type: 'list',
                name: 'copyFromRepository',
                choices: repositories.map(repo => ({name: repo.name, value: repo})),
                message: 'Please select the repository to copy FROM:'
            }
        ]);

        if (copyFromRepository.length == 0) {
            return;
        }

        const labels = yield Promise.all(getLabels(copyFromRepository, owner));

        const {copyToRepositories} = yield inquirer.prompt([
            {
                type: 'checkbox',
                name: 'copyToRepositories',
                choices: repositories.map(repo => ({name: repo.name, value: repo})),
                message: 'Please select the repositories to copy TO:'
            }
        ]);

        if (copyToRepositories.length == 0) {
            return;
        }

        yield Promise.resolve(labels)
            .each(label => copyToRepositories.map(repo => createLabel(repo, owner, label.name, label.color)))

        return
    }

    const {selectedRepositories} = yield inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedRepositories',
            choices: repositories.map(repo => ({name: repo.name, value: repo})),
            message: 'Please select the repositories where you want to add labels to issues:'
        }
    ]);

    if (selectedRepositories.length == 0) {
        return;
    }

    const {addPredefinedLabels} = yield inquirer.prompt([
        {
            type: 'confirm',
            name: 'addPredefinedLabels',
            message: 'Do you want to add your predefined labels to the selected Repositories?'
        }
    ]);

    if (addPredefinedLabels) {
        yield Promise.resolve(predefinedLabels)
            .each(label => selectedRepositories.map(repo => createLabel(repo, owner, label.name, label.color)))
        return
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
        .then(() => selectedIssues)
        .each(issue => addLabels(issue.repo, issue, owner, [label.name]))
})().catch(e => displayError(e));

function displayError(error) {
    if (!error) {
        console.log('Unknown error :/');
        return 'Unknown error :/';
    }

    let errorMessage = error;
    if (error.message && typeof error.message == 'string') {
        let json;
        try {
          json = JSON.parse(error.message);
        } catch(err) { /* Failed to parse JSON */ }
        
        if (json && json.message) {
            errorMessage = json.message;
        } else {
            errorMessage = error.message;
        }
    }

    console.log(`Error: ${errorMessage}`);
    return `Error: ${errorMessage}`;
}

// Export functions for testing purposes
module.exports = { displayError, addLabels, getLabels, getIssues, createLabel, getRepositories };