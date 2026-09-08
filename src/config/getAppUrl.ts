export const getAppUrl = () => {
  return process.env.APP_URL || `http://localhost:${process.env.PORT}/api`;
};