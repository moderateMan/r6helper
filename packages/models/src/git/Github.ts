import GithubRequest from './GithubRequest'

import GitServer from './GitServer'

class Github extends GitServer {
  request:GithubRequest|null=null
  constructor() {
    super('github');
    this.request = null;
  }

  getUser() {
    return this.request!.get('/user');
  }

  getOrg() {
    return this.request!.get(`/user/orgs`, {
      page: 1,
      per_page: 100,
    });
  }

  getRepo(login:string, name:string) {
    return this.request!
      .get(`/repos/${login}/${name}`)
      .then(response => {
        return this.handleResponse(response);
      });
  }

  createRepo(name:string) {
    return this.request!.post('/user/repos', {
      name,
    }, {
      Accept: 'application/vnd.github.v3+json',
    });
  }

  createOrgRepo(name:string, login:string) {
    return this.request!.post(`/orgs/${login}/repos`, {
      name,
    }, {
      Accept: 'application/vnd.github.v3+json',
    });
  }

  setToken(token:string) {
    super.setToken(token);
    this.request = new GithubRequest(token);
  }

  getTokenUrl() {
    return 'https://github.com/settings/tokens';
  }

  getTokenHelpUrl() {
    return 'https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh';
  }

  getRemote(login:string, name:string) {
    return `git@github.com:${login}/${name}.git`;
  }
}

export default Github;
