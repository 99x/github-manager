# github-manager-cli [![Build Status](https://travis-ci.org/99xt/github-manager-cli.svg?branch=master)](https://travis-ci.org/99xt/github-manager-cli) [![npm dependencies](https://david-dm.org/99xt/github-manager-cli.svg)](https://david-dm.org/99xt/github-manager-cli.svg) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/33e92f8ba07748a987da853e90aa3f55)](https://www.codacy.com/app/99xt/github-manager-cli?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=99xt/github-manager-cli&amp;utm_campaign=Badge_Grade) [![Open Source Love](https://badges.frapsoft.com/os/mit/mit.svg?v=102)](https://github.com/ellerbrock/open-source-badge/)

## What's github-manager-cli ?

`github-manager-cli` is command line tool which can used to manage repositories on GitHub.

```
npm i -g github-manager-cli
```

Once installed commmand `gh-manager` will be available globally.


## Usage

```
$ gh-manager
```

## Inpiration

GitHub offers massive features with heavy customizations for repositories and organizations. Most of these features are available through [GitHub's public API](https://developer.github.com/v3/). When performing particular actions some of these features provided through the API aren't enough. In order to do bulk tasks, for an example if we need to add same label to an organization, there is no particular API. This is where `github-manager-cli` comes into play. This tool can be helpful in performing prominent bulk tasks through the CLI.

## Contributor guidelines

- Fork the repository.
- Clone the forked repository.
- Create your own branch.
- Create tests and make sure tests pass on travis.
- Usage section of Readme should be update for new features
- Create a pull request with changes made.

To run existing tests provide `USER_NAME` and `USER_PASS` environment variables with GitHub account for testing(or just `USER_NAME` for unit tests).

## License

MIT © [99XT](https://github.com/99xt)
