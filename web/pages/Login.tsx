import dynamic from "next/dynamic";

const WiredCard = dynamic(
  () => import("react-wired-elements").then((mod) => mod.WiredCard),
  { ssr: false }
);
const WiredInput = dynamic(
  () => import("react-wired-elements").then((mod) => mod.WiredInput),
  { ssr: false }
);
const WiredButton = dynamic(
  () => import("react-wired-elements").then((mod) => mod.WiredButton),
  { ssr: false }
);

type Props = {
  onSubmit: (e: string) => void;
  setUserName: (e: string) => void;
  userName: string;
};

export const Login = ({ onSubmit, setUserName, userName }: Props) => {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <WiredCard elevation={3} className="w-64">
        <h1 className="flex flex-col items-center mb-2 mt-2">
          <b>JOIN THE CHAT</b>
        </h1>

        <WiredInput
          placeholder="Username"
          className="w-full"
          onChange={(e) => setUserName(e.target.value)}
          value={userName}
        />

        <WiredButton
          className="flex flex-col items-center mt-2 mb-2"
          onClick={() => onSubmit(userName)}
        >
          Connect
        </WiredButton>
      </WiredCard>
    </div>
  );
};
