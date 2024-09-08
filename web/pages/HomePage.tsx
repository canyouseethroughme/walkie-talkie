type Props = {
  userName: string;
};

export const HomePage = ({ userName }: Props) => {
  return <h1>Hello {userName}</h1>;
};
