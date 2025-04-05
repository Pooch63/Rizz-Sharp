import React, { useState, useCallback, useRef, useEffect } from "react";
import { run, type Overloads } from "rizz-sharp";

function CodeArea({ onChange }: { onChange: (code: string) => void }) {
  return (
    <div className="code-area">
      <textarea
        onChange={(e) => {
          onChange(e.target.value);
        }}
      >
        alpha 2;
      </textarea>
    </div>
  );
}
function Banner({ onClick }: { onClick: () => void }) {
  return (
    <div className="banner">
      <button onClick={onClick}>Run</button>
    </div>
  );
}
function Console({ messages }: { messages: string[] }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log("si el ritmo te lleva a mover la cabeza, ya empezamos comoe s");
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages]); // triggers when messages change (and thus re-render)

  return (
    <div className="console" ref={ref}>
      {messages.map((msg: string, idx: number) => (
        <div className="console-message" key={idx}>
          {msg}
        </div>
      ))}
    </div>
  );
}

export function Playground() {
  const [messages, setMessages] = useState<string[]>([]);
  function add_message(msg: string) {
    setMessages((messages) => [...messages, msg]);
  }
  const overloads = {
    print: (stdout: string) => {
      add_message(stdout);
      return { error: null };
    },
  };

  const [prog, setProg] = React.useState<string>("alpha 2;");

  return (
    <div className="playground">
      <CodeArea onChange={setProg} />
      <Banner
        onClick={useCallback(() => {
          let result = run(prog, false, overloads);
          if (result.error != null) {
            console.log(result.error);
          }
          // setMessages([]);
          // setTimeout(() => run(prog, overloads), 300);
        }, [prog])}
      />
      <Console messages={messages} />
    </div>
  );
}
