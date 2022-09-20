const formatMessage = (username: string, text: string) => ({
  username,
  text,
  time: new Date(),
});

export default formatMessage;
