interface Raw {
  cookies: {
    sid?: string;
  };
}

interface ISessionStorage extends Foxx.SessionStorage {
  prune: () => void;
  save: (session?: Foxx.Session) => void;
  clear: (session: Foxx.Session) => void;
}

export interface IUser {
  _id?: string;
  _key?: string;
  authData?: any;
  username?: string;
  followers?: ArangoDB.Document<IUser>[];
  followings?: ArangoDB.Document<IUser>[];
}

export interface ISession {
  data?: any;
  uid?: string;
  created?: string;
  expires?: string;
}

export interface IFollows {
  createdAt?: string;
}

export interface IRequest extends Foxx.Request {
  _raw: Raw;
  user: ArangoDB.Document<IUser>;
  sessionStorage: ISessionStorage;
}
