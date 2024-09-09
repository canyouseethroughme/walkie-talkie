import { Fragment, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
const WiredCard = dynamic(
  () => import("react-wired-elements").then((mod) => mod.WiredCard),
  { ssr: false }
);
const WiredButton = dynamic(
  () => import("react-wired-elements").then((mod) => mod.WiredButton),
  { ssr: false }
);
const WiredInput = dynamic(
  () => import("react-wired-elements").then((mod) => mod.WiredInput),
  { ssr: false }
);

type Props = {
  userName: string;
};

type Connection = { uuid: string; username: string };

export const LoggedInPage = ({ userName }: Props) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedPeerConnection, setSelectedPeerConnection] =
    useState<Connection | null>(null);
  const [typedMessage, setTypedMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<
    { user: string; message: string }[]
  >([]);
  const socketRef = useRef<WebSocket | null>(null);
  const WS_URL = "ws://127.0.0.1:8000?username=" + userName;

  useEffect(() => {
    socketRef.current = new WebSocket(WS_URL);

    socketRef.current.addEventListener("open", () => {
      console.log("Connected to server");
    });

    socketRef.current.addEventListener("close", () => {
      console.log("Disconnected from server");
    });

    socketRef.current.addEventListener("message", async (event) => {
      const blob = new Blob([event.data]);
      blob.text().then((text) => {
        const jsonData = JSON.parse(text);
        if (jsonData.chat) {
          setChatMessages((prev) => {
            const newMessages = [
              ...prev,
              { user: jsonData.username, message: jsonData.chat },
            ];
            return newMessages;
          });
        }

        if (jsonData.newConnections) {
          setConnections(() => {
            const newConnections = [...jsonData.newConnections].filter(
              (connection) => connection.username !== userName
            );
            return newConnections;
          });
        }

        if (jsonData.disconnected) {
          setConnections((prev) => {
            const newConnections = prev.filter(
              (connection) => connection.uuid !== jsonData.disconnected.uuid
            );
            return newConnections;
          });
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const newMessageNo = () => {
    const no = chatMessages.filter(
      (message) => message.user !== userName
    ).length;
    if (no == 0) return "";
    return `${no} msg${no > 1 ? "s" : ""}`;
  };

  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen z-10 relative">
      <WiredCard elevation={5} className="w-5/6 h-fit bg-white mb-2">
        <div className="flex flex-row flex-wrap mb-4 mt-4">
          {connections.length > 0 ? (
            connections.map((connection, i) => (
              <Fragment key={i}>
                <WiredButton
                  className="ml-2 bg-lime-300"
                  onClick={() => {
                    setSelectedPeerConnection(connection);
                  }}
                >
                  <b>
                    {connection.username}{" "}
                    {!selectedPeerConnection ? newMessageNo() : ""}
                  </b>
                </WiredButton>
              </Fragment>
            ))
          ) : (
            <WiredButton className="bg-rose-300">
              <b>Nobody online</b>
            </WiredButton>
          )}
        </div>
      </WiredCard>

      <WiredCard className="w-5/6 h-3/5 bg-white" elevation={5}>
        {selectedPeerConnection ? (
          <>
            <div className="flex justify-end">
              <WiredButton
                className=""
                onClick={() => setSelectedPeerConnection(null)}
              >
                X
              </WiredButton>
            </div>
            <div className="flex border-b">
              <div className="w-[80%] h-[50vh] border-r flex flex-col">
                <div className="flex items-center p-4 border-b">
                  <h2 className="text-lg font-semibold">
                    Chat with {selectedPeerConnection?.username}
                  </h2>
                </div>
                <div className="h-full overflow-hidden p-4">
                  {chatMessages.map((message, i) => (
                    <p
                      className={`${
                        message.user === userName
                          ? "text-gray-500 justify-end flex "
                          : "text-black-500"
                      }`}
                      key={i}
                    >
                      {message.user === userName ? "me" : message.user}:{" "}
                      {message.message}
                    </p>
                  ))}
                </div>
                <div className="p-4 border-t">
                  <div className="flex">
                    <WiredInput
                      className="flex-grow h-12 mr-2"
                      placeholder="Type message"
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                    />
                    <WiredButton
                      className="h-12 px-4"
                      onClick={() => {
                        socketRef.current?.send(
                          JSON.stringify({
                            username: userName,
                            chat: typedMessage,
                            peerUuid: selectedPeerConnection.uuid,
                          })
                        );
                        setTypedMessage("");
                      }}
                    >
                      Send
                    </WiredButton>
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-[20%] h-[50vh]">
                <div className="flex items-center p-4 border-b">
                  <h2 className="text-lg font-semibold">Walkie talkie</h2>
                </div>
                <div className="p-4 flex-grow overflow-auto">
                  <p className="text-gray-500">
                    Additional information or controls can go here.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="m-8">
            <h1>Welcome {userName}!</h1>
            <h2>
              Start a conversation through chat or walkie talkie by selecting a
              user.
            </h2>

            <code className="text-rose-700">
              IN ORDER TO USE THE CHAT, BOTH USERS NEED TO HAVE THE CONNECTION
              ACTIVE
            </code>
          </div>
        )}
      </WiredCard>
    </div>
  );
};
