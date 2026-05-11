export type ObjectIdString = string;

export type MongoCollections = {
  users: "users";
  articles: "articles";
  loans: "loans";
  notifications: "notifications";
};

export const mongoCollections: MongoCollections = {
  users: "users",
  articles: "articles",
  loans: "loans",
  notifications: "notifications",
};
