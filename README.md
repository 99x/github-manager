# github-manager-cli [![Build Status](https://travis-ci.org/99xt/github-manager-cli.svg?branch=master)](https://travis-ci.org/99xt/github-manager-cli) [![npm dependencies](https://david-dm.org/99xt/github-manager-cli.svg)](https://david-dm.org/99xt/github-manager-cli.svg) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/33e92f8ba07748a987da853e90aa3f55)](https://www.codacy.com/app/99xt/github-manager-cli?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=99xt/github-manager-cli&amp;utm_campaign=Badge_Grade) [![Open Source Love](https://badges.frapsoft.com/os/mit/mit.svg?v=102)](https://github.com/ellerbrock/open-source-badge/)

A CLI to manage GitHub repositories

```
npm i -g github-manager-cli
```

## Usage

```
$ gh-label
```

### Generate report

```
$ gh-label --report
```

### owner

Owner of the repository (user/organization)

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
