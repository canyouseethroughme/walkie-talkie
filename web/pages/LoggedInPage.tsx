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

type ChatMessage = { user: string; message: string };

export const LoggedInPage = ({ userName }: Props) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedPeerConnection, setSelectedPeerConnection] =
    useState<Connection | null>(null);
  const [typedMessage, setTypedMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatNotification, setChatNotification] = useState<string>("");
  const [urlStream, setUrlStream] = useState<string | undefined>(undefined);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaStream = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
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
            setChatNotification(() => {
              const no = newMessages.filter(
                (message) => message.user !== userName
              ).length;
              if (no == 0) return "";
              return `// ${no} new msg${no > 1 ? "s " : " "}`;
            });
            return newMessages;
          });
        }

        if (jsonData.voiceMessage) {
          setUrlStream(jsonData.voiceMessage);
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

    return () => {
      socketRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.start();
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder.current && mediaStream.current) {
      mediaRecorder.current.stop();
      const audioChunks: [] = [];
      mediaStream.current.getTracks().forEach((track) => {
        track.stop();
      });

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.push(event.data as never);
      };
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setIsRecording(false);
        socketRef.current?.send(
          JSON.stringify({
            voiceMessage: url,
            peerUuid: selectedPeerConnection?.uuid,
          })
        );
      };
    }
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
                    {!selectedPeerConnection ? chatNotification : ""}
                    {!selectedPeerConnection && urlStream
                      ? "// aaaaAAAAaaa"
                      : ""}
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
                onClick={() => {
                  setUrlStream(undefined);
                  setChatNotification("");
                  setSelectedPeerConnection(null);
                }}
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
                <div className="flex p-4 border-b">
                  <h2 className="text-lg font-semibold">Walkie talkie</h2>
                </div>
                <div className="p-4 flex justify-center items-center flex-grow overflow-auto">
                  <audio autoPlay src={urlStream} />
                  <button
                    className={`rounded-full border-2 p-4 w-32 h-32 ${
                      isRecording ? "bg-red-500" : "bg-green-500"
                    }`}
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                  >
                    Press, hold and talk
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="m-8">
            <h1 className="text-lime-600">Welcome {userName}!</h1>

            <h2 className="mt-8 mb-8">
              Start a conversation through chat or walkie talkie by selecting a
              user.
            </h2>

            <code className="text-rose-700">
              GOOD TO KNOW:
              <br />
              - the app offers same functionality as a walkie talkie, with only
              2 users engaged in a conversation (no group chat)
              <br />
              - to send a voice message, press and hold the button
              <br />
            </code>
          </div>
        )}
      </WiredCard>
    </div>
  );
};
