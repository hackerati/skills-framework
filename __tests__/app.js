const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const requestPromise = require('request-promise');
const sinon = require('sinon');

const { getGithubAuth, getGithubRepo, createGithubRepo } = require('../generators/app/utils/github');
// const { getGithubAuth, getGithubRepo, createGithubRepo } =
// require('../generators/app/utils/github');
// const { getTravisToken, encryptTravisEnvVars, loopWhileSyncing } =
// require('../generators/app/utils/travis');

const sandbox = sinon.sandbox.create();

describe('generator-lambda-cd:app', () => {
  beforeAll(() => {
    sandbox.stub(requestPromise, 'post').returns({
      then: () => ({
        catch: () => {},
      }),
    });
    return helpers.run(path.join(__dirname, '../generators/app')).withOptions({ 'skip-deploy': true });
  });

  afterAll(() => {
    sandbox.restore();
  });

  it('creates files', () => {
    assert.file([
      'event/sample.js',
      'test/test.js',
      '.eslintignore',
      '.eslintrc',
      '.gitignore',
      '.travis.yml',
      'lambda.js',
      'main.tf',
      'Makefile',
      'package.json',
      'README.md',
      'yarn.lock',
    ]);
  });
});

describe('Github util', () => {
  const promise = {
    then: () => {},
  };

  beforeEach(() => {
    this.getStub = sandbox.stub(requestPromise, 'get').returns(promise);
    this.postStub = sandbox.stub(requestPromise, 'post').returns(promise);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('calls a post request correctly for auth', () => {
    const props = {
      githubUser: 'test-user',
      githubPassword: 'test-password',
    };

    expect.assertions(1);
    expect(getGithubAuth(props)).toBe(promise);
    sandbox.assert.calledOnce(this.postStub);
    sandbox.assert.calledWith(this.postStub, sinon.match({
      auth: {
        pass: 'test-password',
        user: 'test-user',
      },
      body: sinon.match.string,
      headers: {
        'User-Agent': 'test-user',
      },
      method: 'POST',
      resolveWithFullResponse: true,
      url: 'https://api.github.com/authorizations',
    }));
  });

  it('calls a post request correctly for auth with OTP', () => {
    const props = {
      githubUser: 'test-user',
      githubPassword: 'test-password',
      githubAuthCode: 1234,
    };

    expect.assertions(1);
    expect(getGithubAuth(props)).toBe(promise);
    sandbox.assert.calledOnce(this.postStub);
    sandbox.assert.calledWith(this.postStub, sinon.match({
      auth: {
        pass: 'test-password',
        user: 'test-user',
      },
      body: sinon.match.string,
      headers: {
        'User-Agent': 'test-user',
        'X-GitHub-OTP': 1234,
      },
      method: 'POST',
      resolveWithFullResponse: true,
      url: 'https://api.github.com/authorizations',
    }));
  });

  it('calls a get request correctly for a github repo', () => {
    const props = {
      githubUser: 'test-user',
      githubToken: 'test-token',
      githubOrgName: 'test-org',
      githubRepoName: 'test-repo',
    };

    expect.assertions(1);
    expect(getGithubRepo(props)).toBe(promise);
    sandbox.assert.calledOnce(this.getStub);
    sandbox.assert.calledWith(this.getStub, sinon.match({
      headers: {
        Authorization: 'token test-token',
        'User-Agent': 'test-user',
      },
      method: 'GET',
      url: 'https://api.github.com/repos/test-org/test-repo',
    }));
  });

  it('calls a post request correctly for creating a github repo under the user', () => {
    const props = {
      githubUser: 'test-user',
      githubToken: 'test-token',
      githubOrgName: 'test-user',
      githubRepoName: 'test-repo',
    };

    expect.assertions(1);
    expect(createGithubRepo(props)).toBe(promise);
    sandbox.assert.calledOnce(this.postStub);
    sandbox.assert.calledWith(this.postStub, sinon.match({
      body: sinon.match.string,
      headers: {
        Authorization: 'token test-token',
        'User-Agent': 'test-user',
      },
      method: 'POST',
      url: 'https://api.github.com/user/repos',
    }));
  });

  it('calls a post request correctly for creating a github repo under an org', () => {
    const props = {
      githubUser: 'test-user',
      githubToken: 'test-token',
      githubOrgName: 'test-org',
      githubRepoName: 'test-repo',
    };

    expect.assertions(1);
    expect(createGithubRepo(props)).toBe(promise);
    sandbox.assert.calledOnce(this.postStub);
    sandbox.assert.calledWith(this.postStub, sinon.match({
      body: sinon.match.string,
      headers: {
        Authorization: 'token test-token',
        'User-Agent': 'test-user',
      },
      method: 'POST',
      url: 'https://api.github.com/orgs/test-org/repos',
    }));
  });
});
