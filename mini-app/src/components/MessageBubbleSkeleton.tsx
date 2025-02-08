function MessageBubbleSkeleton() {
  return (
    <div className="flex flex-col w-full animate-pulse">
      <div className="w-full h-24 py-1 px-2 overflow-hidden flex flex-row gap-2">
        <div className="h-12 w-12 bg-gray-500 rounded-full flex-shrink-0"></div>
        <div className="w-full h-full bg-gray-500 rounded-lg flex-grow"></div>
      </div>
      <div className="w-full h-24 py-1 px-2 overflow-hidden flex flex-row gap-2">
        <div className="w-full h-full bg-gray-500 rounded-lg flex-grow"></div>
        <div className="h-12 w-12 bg-gray-500 rounded-full flex-shrink-0"></div>
      </div>
    </div>
  );
}

export default MessageBubbleSkeleton;
