function error(methodName:string) {
  throw new Error(`${methodName} must be implemented!`);
}

class GitServer {
  type:string=""
  token:string=""
  constructor(type:string, token:string="") {
    this.type = type;
    this.token = token;
  }

  setToken(token:string) {
    this.token = token;
  }

  createRepo(name:string) {
    error('createRepo'+name);
  }

  createOrgRepo(name:string, login:string) {
    error('createOrgRepo'+name+login);
  }

  getRemote(login:string, name:string) {
    error('getRemote'+login+name);
  }

  getUser() {
    error('getUser');
  }

  getOrg(username:string) {
    error('getOrg'+username);
  }

  getRepo(login:string, name:string) {
    error('getRepo'+login+name);
  }

  getTokenUrl() {
    error('getTokenUrl');
  }

  getTokenHelpUrl() {
    error('getTokenHelpUrl');
  }

  isHttpResponse = (response:any) => {
    return response && response.status;
  };

  handleResponse = (response:any) => {
    if (this.isHttpResponse(response) && response !== 200) {
      return null;
    } else {
      return response;
    }
  };
  
}

export default GitServer;
