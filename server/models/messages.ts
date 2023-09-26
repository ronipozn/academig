export { Message, ChannelUser };

interface Message {
  _id: string;
  type: number,
  userId: string;
  text: string;
  file: string,
  date: Date;
  // academicEmoji: boolean,
  // typing: boolean,
  // changed: boolean,
  // deleted: boolean[],
  // recieved: number [v,vv,vvv]
  // replies: Message[],
}

interface ChannelUser {
  _id: string;
  unread: number;
  first: number;
  type: number;
}
