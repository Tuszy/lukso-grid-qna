import { PropsWithChildren, ReactNode, useState } from "react";
import { BsSendFill } from "react-icons/bs";

function MessageInput({
  placeholder,
  onConfirm,
  maxLength = 200,
  children,
  disabled,
  iconElement = <BsSendFill color="white" size={28} />,
  onInputChange,
}: PropsWithChildren<{
  placeholder: string;
  maxLength?: number;
  onConfirm: (content: string) => void;
  disabled?: boolean;
  iconElement?: ReactNode;
  onInputChange?: (text: string) => void;
}>) {
  const [message, setMessage] = useState<string>("");

  const trimmedMessage = message.trim();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (trimmedMessage.length === 0) {
      return;
    }
    onConfirm(trimmedMessage);
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onInputChange) onInputChange(e.target.value);
    setMessage(e.target.value);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full flex-col flex-shrink-0 bg-black border-t-2 border-gray-300 overflow-hidden transition-all"
    >
      {children}
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="relative w-full">
          <div className="w-full overflow-hidden rounded-lg">
            <textarea
              disabled={disabled}
              rows={3}
              maxLength={maxLength}
              className="block p-2.5 w-full resize-none text-sm rounded-lg border overflow-y-scroll placeholder:select-none bg-white placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              placeholder={placeholder + "..."}
              value={message}
              onChange={onChange}
            />
          </div>

          <div className="absolute bottom-0 max-auto right-4 flex flex-row items-center justify-center pointer-events-none text-gray-400 bg-white text-xs text-right select-none border-l border-t rounded-tl-lg border-gray-400 pl-0.5">
            {message.length}/{maxLength}
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex justify-center p-2 rounded-full cursor-pointer hover:opacity-80 active:opacity-90 disabled:opacity-50 disabled:cursor-default"
          disabled={trimmedMessage.length === 0 || disabled}
        >
          {iconElement}
        </button>
      </div>
    </form>
  );
}

export default MessageInput;
