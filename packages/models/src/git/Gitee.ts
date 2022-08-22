import GitServer from './GitServer'
import GiteeRequest from './GiteeRequest'
class Gitee extends GitServer {
  request:GiteeRequest|null = null
  constructor() {
    super('gitee');
  }

  setToken(token:string) {
    super.setToken(token);
    this.request = new GiteeRequest(token);
  }

  getUser() {
    return this.request!.get('/user');
  }

  getOrg(username:string) {
    return this.request!.get(`/users/${username}/orgs`, {
      page: 1,
      per_page: 100,
    });
  }

  getRepo(login:string, name:string) {
    return this.request!
      .get(`/repos/${login}/${name}`)
      .then((response:any) => {
        return this.handleResponse(response);
      });
  }

  createRepo(name:string) {
    return this.request!.post('/user/repos', {
      name,
    });
  }

  createOrgRepo(name:string, login:string) {
    return this.request!.post(`/orgs/${login}/repos`, {
      name,
    });
  }

  getTokenUrl() {
    return 'https://gitee.com/personal_access_tokens';
  }

  getTokenHelpUrl() {
    return 'https://gitee.com/help/articles/4191';
  }

  getRemote(login:string, name:string) {
    return `git@gitee.com:${login}/${name}.git`;
  }
}

export default Gitee;
