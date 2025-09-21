export interface User {
  _id: string;
  userName: string;
  role: {
    name: string;
  };
  avatar: {
    secure_url: string;
  };
}
