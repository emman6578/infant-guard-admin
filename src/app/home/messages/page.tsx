// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import Footer from "@/components/footer";
// import Sidebar from "@/components/sidebar";
// import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";

// const Messages = () => {
//   const {
//     loadConversation,
//     readMsg,
//     createMsg,
//     parentsList,
//     unreadCount,
//     pushTokenMessage,
//   } = useProtectedRoutesApi();
//   const queryClient = useQueryClient();

//   // Mutation for sending notification
//   const sendNotifyMutation = useMutation({
//     mutationFn: async ({
//       id,
//       title,
//       body,
//       data,
//     }: {
//       id: string;
//       title: string;
//       body: string;
//       data: string;
//     }) => {
//       return pushTokenMessage(id, title, body, data);
//     },
//     onSuccess: () => {},
//     onError: (err) => {
//       console.error("Notification mutation failed:", err);
//     },
//   });

//   const handleNotify = async (id: string) => {
//     try {
//       await sendNotifyMutation.mutateAsync({
//         id,
//         title: `You have one new message from`,
//         body: `Ligao City Health Center`,
//         data: "Vaccine Reminder",
//       });
//     } catch (error) {
//       console.error("handleNotify: Error sending notification:", error);
//     }
//   };

//   // Fetch conversations and parents list
//   const { data: conversationsData, refetch: refetchConversations } = useQuery({
//     queryKey: ["conversations"],
//     queryFn: loadConversation,
//   });

//   const { data: parents } = useQuery({
//     queryKey: ["parents"],
//     queryFn: parentsList,
//   });

//   const { data: unreadCountMsg, refetch: refetchUnreadCount } = useQuery({
//     queryKey: ["unreadCount"],
//     queryFn: unreadCount,
//   });

//   // Local state
//   const [selectedConversation, setSelectedConversation] = useState<any>(null);
//   const [isModalOpen, setModalOpen] = useState(false); // Messages modal
//   const [isCreateModalOpen, setCreateModalOpen] = useState(false); // Create message modal
//   const [newMsgText, setNewMsgText] = useState("");
//   const [selectedParentId, setSelectedParentId] = useState("");

//   // Set a default selected parent if available
//   useEffect(() => {
//     if (parents?.data && parents.data.length > 0 && !selectedParentId) {
//       setSelectedParentId(parents.data[0].id);
//     }
//   }, [parents?.data, selectedParentId]);

//   // Query for messages (only runs when messages modal is open and a conversation is selected)
//   const { data: messages } = useQuery({
//     queryKey: ["messages", selectedConversation?.id],
//     queryFn: () => readMsg(selectedConversation.id),
//     enabled: isModalOpen && !!selectedConversation,
//     refetchInterval: isModalOpen ? 500 : false,
//   });

//   // Ref for auto-scrolling messages container
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Auto-scroll when messages update
//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   // Also auto-scroll when messages modal opens
//   useEffect(() => {
//     if (isModalOpen && messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [isModalOpen]);

//   // Mutation for sending a new message
//   const mutation = useMutation<
//     any,
//     Error,
//     { text: string; targetParentId: string }
//   >({
//     mutationFn: ({ text, targetParentId }) =>
//       (
//         createMsg as unknown as (
//           text: string,
//           targetParentId: string
//         ) => Promise<any>
//       )(text, targetParentId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["conversations"] });
//       queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
//       setNewMsgText("");
//       // If no conversation is selected (i.e. in the create modal), close the modal.
//       if (!selectedConversation) {
//         setCreateModalOpen(false);
//       }
//     },
//     onError: (error) => {
//       console.error("Error sending message:", error);
//     },
//   });

//   // Handler for sending a message
//   const handleSendMessage = () => {
//     if (!newMsgText.trim()) return;

//     // If a conversation is selected, use that conversation's parent's id;
//     // otherwise, use the selected parent from the drop-down.
//     if (selectedConversation) {
//       const targetParent = parents?.data.find(
//         (p: any) => p.fullname === selectedConversation.title
//       );
//       if (!targetParent) {
//         console.error(
//           "Target parent not found for conversation:",
//           selectedConversation
//         );
//         return;
//       }
//       mutation.mutate({ text: newMsgText, targetParentId: targetParent.id });
//       handleNotify(targetParent.id);
//     } else {
//       mutation.mutate({ text: newMsgText, targetParentId: selectedParentId });
//     }
//   };

//   // Inline component for the create conversation form used in the Create Message Parent modal
//   const CreateConversationForm = () => (
//     <div className="flex flex-col gap-2 mt-2">
//       <label htmlFor="parentSelect" className="font-medium">
//         Select Parent:
//       </label>
//       <select
//         id="parentSelect"
//         value={selectedParentId}
//         onChange={(e) => setSelectedParentId(e.target.value)}
//         className="border rounded px-3 py-2"
//       >
//         {parents?.data?.map((p: any) => (
//           <option key={p.id} value={p.id}>
//             {p.fullname}
//           </option>
//         ))}
//       </select>
//       <input
//         type="text"
//         autoFocus
//         className="border rounded px-3 py-2"
//         placeholder="Type your message..."
//         value={newMsgText}
//         onChange={(e) => setNewMsgText(e.target.value)}
//       />
//       <button
//         className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
//         onClick={handleSendMessage}
//         disabled={mutation.isLoading}
//       >
//         {mutation.isLoading ? "Sending..." : "Send"}
//       </button>
//     </div>
//   );

//   return (
//     <div className="grid grid-cols-[250px_1fr] grid-rows-[1fr_auto] min-h-screen">
//       {/* Sidebar */}
//       <Sidebar unreadCount={unreadCountMsg?.unreadCount} />

//       {/* Main content */}
//       <main className="p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] flex flex-col gap-8">
//         <div className="flex items-center justify-between mb-4">
//           <h1 className="text-2xl font-bold">Conversations</h1>
//           <button
//             className="bg-green-500 text-white px-4 py-2 rounded"
//             onClick={() => setCreateModalOpen(true)}
//           >
//             Add Message Parent
//           </button>
//         </div>
//         <div className="flex flex-col gap-2">
//           {conversationsData?.data?.conversations &&
//           conversationsData.data.conversations.length > 0 ? (
//             conversationsData.data.conversations.map((conv: any) => (
//               <div
//                 key={conv.id}
//                 className="cursor-pointer p-4 border rounded hover:bg-gray-100 flex items-center justify-between"
//                 onClick={() => {
//                   setSelectedConversation(conv);
//                   setModalOpen(true);
//                 }}
//               >
//                 <span>{conv.title}</span>
//                 {conv.unreadCount > 0 && (
//                   <span className="ml-2 inline-block bg-red-500 text-white rounded-full px-2 text-xs">
//                     {conv.unreadCount}
//                   </span>
//                 )}
//               </div>
//             ))
//           ) : (
//             <p>No conversation found.</p>
//           )}
//         </div>
//       </main>

//       {/* Footer */}
//       <Footer />

//       {/* Messages Modal */}
//       {isModalOpen && selectedConversation && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg w-1/2 max-h-[80vh] overflow-y-auto">
//             {/* Header */}
//             <div className="mb-4">
//               <h2 className="text-xl font-semibold">
//                 Conversation with {selectedConversation.title}
//               </h2>
//             </div>
//             {/* Message List */}
//             <div className="mb-4 space-y-2">
//               {messages?.data?.messages?.map((msg: any) => (
//                 <div
//                   key={msg.id}
//                   className={`flex ${
//                     msg.sender.role === "Parent"
//                       ? "justify-start"
//                       : "justify-end"
//                   }`}
//                 >
//                   <span
//                     className={`px-4 py-2 rounded-lg ${
//                       msg.sender.role === "Parent"
//                         ? "bg-gray-200"
//                         : "bg-blue-200"
//                     }`}
//                   >
//                     {msg.text}
//                   </span>
//                 </div>
//               ))}
//               {/* Dummy div to auto-scroll */}
//               <div ref={messagesEndRef} />
//             </div>
//             {/* Bottom Input Area */}
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 className="flex-1 border rounded px-3 py-2"
//                 placeholder="Type your message..."
//                 value={newMsgText}
//                 onChange={(e) => setNewMsgText(e.target.value)}
//               />
//               <button
//                 className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
//                 onClick={handleSendMessage}
//                 disabled={mutation.isLoading}
//               >
//                 {mutation.isLoading ? "Sending..." : "Send"}
//               </button>
//               <button
//                 className="bg-red-500 text-white px-4 py-2 rounded"
//                 onClick={() => {
//                   setModalOpen(false);
//                   refetchConversations();
//                   refetchUnreadCount();
//                 }}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Create Message Parent Modal */}
//       {isCreateModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg w-1/2">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold">Send a New Message</h2>
//               <button
//                 className="bg-red-500 text-white px-4 py-2 rounded"
//                 onClick={() => setCreateModalOpen(false)}
//               >
//                 Close
//               </button>
//             </div>
//             <CreateConversationForm />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Messages;

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Footer from "@/components/footer";
import Sidebar from "@/components/sidebar";
import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";
// Import the Checkbox component from shadcn (adjust the import path as needed)
import { Checkbox } from "@/components/ui/checkbox";

const Messages = () => {
  const {
    loadConversation,
    readMsg,
    createMsg,
    parentsList,
    unreadCount,
    pushTokenMessage,
    deleteMsg,
  } = useProtectedRoutesApi();
  const queryClient = useQueryClient();

  // New state for storing checked conversation IDs
  const [selectedConversationIds, setSelectedConversationIds] = useState<
    string[]
  >([]);

  // Helper to update the selectedConversationIds state
  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedConversationIds((prev) => [...prev, id]);
    } else {
      setSelectedConversationIds((prev) => prev.filter((item) => item !== id));
    }
    console.log(selectedConversationIds);
  };

  // Mutation for sending notification
  const sendNotifyMutation = useMutation({
    mutationFn: async ({
      id,
      title,
      body,
      data,
    }: {
      id: string;
      title: string;
      body: string;
      data: string;
    }) => {
      return pushTokenMessage(id, title, body, data);
    },
    onSuccess: () => {},
    onError: (err) => {
      console.error("Notification mutation failed:", err);
    },
  });

  const handleNotify = async (id: string) => {
    try {
      await sendNotifyMutation.mutateAsync({
        id,
        title: `You have one new message from`,
        body: `Ligao City Health Center`,
        data: "Vaccine Reminder",
      });
    } catch (error) {
      console.error("handleNotify: Error sending notification:", error);
    }
  };

  // Mutation for deleting conversations
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return deleteMsg(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      // Clear selected IDs after successful deletion
      setSelectedConversationIds([]);
    },
    onError: (error) => {
      console.error("Error deleting conversations:", error);
    },
  });

  // Fetch conversations and parents list
  const { data: conversationsData, refetch: refetchConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: loadConversation,
  });

  const { data: parents } = useQuery({
    queryKey: ["parents"],
    queryFn: parentsList,
  });

  const { data: unreadCountMsg, refetch: refetchUnreadCount } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: unreadCount,
  });

  // Local state for conversation modal and new message
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isModalOpen, setModalOpen] = useState(false); // Messages modal
  const [isCreateModalOpen, setCreateModalOpen] = useState(false); // Create message modal
  const [newMsgText, setNewMsgText] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");

  // Set a default selected parent if available
  useEffect(() => {
    if (parents?.data && parents.data.length > 0 && !selectedParentId) {
      setSelectedParentId(parents.data[0].id);
    }
  }, [parents?.data, selectedParentId]);

  // Query for messages (only runs when messages modal is open and a conversation is selected)
  const { data: messages } = useQuery({
    queryKey: ["messages", selectedConversation?.id],
    queryFn: () => readMsg(selectedConversation.id),
    enabled: isModalOpen && !!selectedConversation,
    refetchInterval: isModalOpen ? 500 : false,
  });

  // Ref for auto-scrolling messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Also auto-scroll when messages modal opens
  useEffect(() => {
    if (isModalOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isModalOpen]);

  // Mutation for sending a new message
  const mutation = useMutation<
    any,
    Error,
    { text: string; targetParentId: string }
  >({
    mutationFn: ({ text, targetParentId }) =>
      (
        createMsg as unknown as (
          text: string,
          targetParentId: string
        ) => Promise<any>
      )(text, targetParentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      setNewMsgText("");
      // If no conversation is selected (i.e. in the create modal), close the modal.
      if (!selectedConversation) {
        setCreateModalOpen(false);
      }
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  // Handler for sending a message
  const handleSendMessage = () => {
    if (!newMsgText.trim()) return;

    // If a conversation is selected, use that conversation's parent's id;
    // otherwise, use the selected parent from the drop-down.
    if (selectedConversation) {
      const targetParent = parents?.data.find(
        (p: any) => p.fullname === selectedConversation.title
      );
      if (!targetParent) {
        console.error(
          "Target parent not found for conversation:",
          selectedConversation
        );
        return;
      }
      mutation.mutate({ text: newMsgText, targetParentId: targetParent.id });
      handleNotify(targetParent.id);
    } else {
      mutation.mutate({ text: newMsgText, targetParentId: selectedParentId });
    }
  };

  // Inline component for the create conversation form used in the Create Message Parent modal
  const CreateConversationForm = () => (
    <div className="flex flex-col gap-2 mt-2">
      <label htmlFor="parentSelect" className="font-medium">
        Select Parent:
      </label>
      <select
        id="parentSelect"
        value={selectedParentId}
        onChange={(e) => setSelectedParentId(e.target.value)}
        className="border rounded px-3 py-2"
      >
        {parents?.data?.map((p: any) => (
          <option key={p.id} value={p.id}>
            {p.fullname}
          </option>
        ))}
      </select>
      <input
        type="text"
        autoFocus
        className="border rounded px-3 py-2"
        placeholder="Type your message..."
        value={newMsgText}
        onChange={(e) => setNewMsgText(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleSendMessage}
        disabled={mutation.isLoading}
      >
        {mutation.isLoading ? "Sending..." : "Send"}
      </button>
    </div>
  );

  return (
    <div className="grid grid-cols-[250px_1fr] grid-rows-[1fr_auto] min-h-screen">
      {/* Sidebar */}
      <Sidebar unreadCount={unreadCountMsg?.unreadCount} />

      {/* Main content */}
      <main className="p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] flex flex-col gap-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Conversations</h1>
          <div className="flex gap-2">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={() => deleteMutation.mutate(selectedConversationIds)}
              disabled={
                selectedConversationIds.length === 0 || deleteMutation.isLoading
              }
            >
              {deleteMutation.isLoading ? "Deleting..." : "Delete Conversation"}
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => setCreateModalOpen(true)}
            >
              Add Message Parent
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {conversationsData?.data?.conversations &&
          conversationsData.data.conversations.length > 0 ? (
            conversationsData.data.conversations.map((conv: any) => (
              <div
                key={conv.id}
                className="cursor-pointer p-4 border rounded hover:bg-gray-100 flex items-center justify-between"
                onClick={() => {
                  setSelectedConversation(conv);
                  setModalOpen(true);
                }}
              >
                <div className="flex items-center gap-2">
                  {/* Checkbox from shadcn */}
                  <Checkbox
                    checked={selectedConversationIds.includes(conv.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(conv.id, checked as boolean)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>{conv.title}</span>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="ml-2 inline-block bg-red-500 text-white rounded-full px-2 text-xs">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p>No conversation found.</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Messages Modal */}
      {isModalOpen && selectedConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-1/2 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                Conversation with {selectedConversation.title}
              </h2>
            </div>
            {/* Message List */}
            <div className="mb-4 space-y-2">
              {messages?.data?.messages?.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender.role === "Parent"
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <span
                    className={`px-4 py-2 rounded-lg ${
                      msg.sender.role === "Parent"
                        ? "bg-gray-200"
                        : "bg-blue-200"
                    }`}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
              {/* Dummy div to auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
            {/* Bottom Input Area */}
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border rounded px-3 py-2"
                placeholder="Type your message..."
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={mutation.isLoading}
              >
                {mutation.isLoading ? "Sending..." : "Send"}
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  setModalOpen(false);
                  refetchConversations();
                  refetchUnreadCount();
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Message Parent Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Send a New Message</h2>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => setCreateModalOpen(false)}
              >
                Close
              </button>
            </div>
            <CreateConversationForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
