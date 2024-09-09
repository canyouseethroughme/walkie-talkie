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
    <div className="flex flex-col justify-center items-center w-full h-full z-10 relative">
      <WiredCard elevation={5} className="w-[25rem] bg-white">
        <h1 className="flex flex-col items-center mb-8 mt-2 text-lime-600">
          <b>JOIN THE FUN</b>
        </h1>
        <h1 className="flex flex-col items-center mb-8 mt-2">
          <b>Walkie Talkie App</b>
        </h1>

        <WiredInput
          placeholder="Username"
          className="w-full"
          onChange={(e) => setUserName(e.target.value)}
          value={userName}
        />

        <WiredButton
          elevation={2}
          className="flex flex-col items-center mt-6 mb-4"
          onClick={() => onSubmit(userName)}
        >
          Connect
        </WiredButton>
      </WiredCard>
    </div>
  );
};
