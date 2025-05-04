"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Footer from "@/components/footer";
import Sidebar from "@/components/sidebar";
import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageCircle, Send, X, Trash2, UserPlus } from "lucide-react";

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

  // Selected conversation IDs for bulk actions
  const [selectedConversationIds, setSelectedConversationIds] = useState<
    string[]
  >([]);

  // Local state for conversation modal and new message
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isModalOpen, setModalOpen] = useState(false); // Messages modal
  const [isCreateModalOpen, setCreateModalOpen] = useState(false); // Create message modal
  const [newMsgText, setNewMsgText] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");

  // Helper to update the selectedConversationIds state
  const handleCheckboxChange = (
    id: string,
    checked: boolean,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent opening modal when clicking checkbox

    if (checked) {
      setSelectedConversationIds((prev) => [...prev, id]);
    } else {
      setSelectedConversationIds((prev) => prev.filter((item) => item !== id));
    }
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
    onSuccess: () => {
      console.log("Notification sent successfully");
    },
    onError: (err) => {
      console.error("Notification mutation failed:", err);
    },
  });

  const handleNotify = async (id: string) => {
    try {
      await sendNotifyMutation.mutateAsync({
        id,
        title: `You have one new message`,
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

  // Auto-scroll when messages modal opens
  useEffect(() => {
    if (isModalOpen && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isModalOpen]);

  // Mutation for sending a new message
  const sendMessageMutation = useMutation<
    any,
    Error,
    { text: string; targetParentId: string }
  >({
    mutationFn: ({ text, targetParentId }) => createMsg(text, targetParentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      if (selectedConversation) {
        queryClient.invalidateQueries({
          queryKey: ["messages", selectedConversation.id],
        });
      }
      setNewMsgText("");

      // Close create modal if we're sending from there
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

    let targetParentId;

    if (selectedConversation) {
      // Find the parent ID that matches the selected conversation title
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

      targetParentId = targetParent.id;
    } else {
      // Use the explicitly selected parent ID from the dropdown
      targetParentId = selectedParentId;
    }

    // Log the action for debugging
    console.log(`Sending message to parent ID: ${targetParentId}`);

    // Execute the mutation
    sendMessageMutation.mutate({
      text: newMsgText,
      targetParentId: targetParentId,
    });

    // Send notification
    handleNotify(targetParentId);
  };

  // Handle key press (Enter to send message)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Reset message state when closing modals
  const handleCloseModal = () => {
    setModalOpen(false);
    setNewMsgText("");
    refetchConversations();
    refetchUnreadCount();
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setNewMsgText("");
  };

  return (
    <div className="grid grid-cols-[250px_1fr] grid-rows-[1fr_auto] min-h-screen bg-[#f4faff]">
      {/* Sidebar */}
      <Sidebar unreadCount={unreadCountMsg?.unreadCount} />

      {/* Main content */}
      <main className="p-6 sm:p-10 font-[family-name:var(--font-geist-sans)] flex flex-col gap-6">
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <MessageCircle className="mr-2 text-[#8993ff]" size={24} />
            Messages
          </h1>
          <div className="flex gap-3">
            <button
              className="bg-[#dbedff] text-gray-800 px-4 py-2 rounded-md flex items-center hover:bg-[#accbff] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => deleteMutation.mutate(selectedConversationIds)}
              disabled={
                selectedConversationIds.length === 0 || deleteMutation.isLoading
              }
            >
              <Trash2 size={18} className="mr-2" />
              {deleteMutation.isLoading ? "Deleting..." : "Delete Selected"}
            </button>
            <button
              className="bg-[#8993ff] text-white px-4 py-2 rounded-md flex items-center hover:bg-[#93acff] transition duration-200"
              onClick={() => setCreateModalOpen(true)}
            >
              <UserPlus size={18} className="mr-2" />
              New Message
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {conversationsData?.data?.conversations &&
          conversationsData.data.conversations.length > 0 ? (
            conversationsData.data.conversations.map((conv: any) => (
              <div
                key={conv.id}
                className="bg-white p-5 rounded-lg shadow-sm border border-[#dbedff] hover:border-[#accbff] transition duration-200 cursor-pointer"
                onClick={() => {
                  setSelectedConversation(conv);
                  setModalOpen(true);
                  setNewMsgText(""); // Reset message text when opening conversation
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedConversationIds.includes(conv.id)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          conv.id,
                          checked as boolean,
                          event as React.MouseEvent
                        )
                      }
                      className="border-[#accbff]"
                    />
                    <span className="text-lg font-medium text-gray-800">
                      {conv.title}
                    </span>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="inline-block bg-[#8993ff] text-white rounded-full px-2 py-1 text-xs font-medium">
                      {conv.unreadCount} new
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  Click to view conversation history
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-3 bg-white p-8 rounded-lg text-center text-gray-700">
              <p>No conversations found.</p>
              <button
                className="mt-4 bg-[#8993ff] text-white px-4 py-2 rounded-md flex items-center mx-auto hover:bg-[#93acff] transition duration-200"
                onClick={() => setCreateModalOpen(true)}
              >
                <UserPlus size={18} className="mr-2" />
                Start a New Conversation
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Messages Modal */}
      {isModalOpen && selectedConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl h-[80vh] flex flex-col shadow-lg">
            {/* Header */}
            <div className="border-b border-[#dbedff] pb-3 mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <MessageCircle className="mr-2 text-[#8993ff]" size={20} />
                Conversation with {selectedConversation.title}
              </h2>
              <button
                className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-[#f4faff] transition"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Message List */}
            <div className="flex-grow overflow-y-auto p-2 mb-4 bg-[#f4faff] rounded-lg">
              <div className="space-y-4">
                {messages?.data?.messages?.length > 0 ? (
                  messages.data.messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender.role === "Parent"
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`px-4 py-3 rounded-lg max-w-[80%] shadow-sm ${
                          msg.sender.role === "Parent"
                            ? "bg-white text-gray-800 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl"
                            : "bg-[#93acff] text-gray-800 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <div
                          className={`text-xs mt-1 ${
                            msg.sender.role === "Parent"
                              ? "text-gray-500"
                              : "text-gray-700"
                          }`}
                        >
                          {msg.sender.role}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No messages in this conversation yet.
                  </div>
                )}
                {/* Dummy div to auto-scroll */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Bottom Input Area */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                className="flex-1 border border-[#dbedff] rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#accbff] text-gray-800 placeholder-gray-500"
                placeholder="Type your message..."
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button
                className="bg-[#8993ff] text-white px-4 py-2 rounded-md disabled:opacity-50 hover:bg-[#93acff] transition duration-200 flex items-center"
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isLoading || !newMsgText.trim()}
              >
                {sendMessageMutation.isLoading ? (
                  "Sending..."
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Message Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center mb-4 border-b border-[#dbedff] pb-3">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <UserPlus className="mr-2 text-[#8993ff]" size={20} />
                Send a New Message
              </h2>
              <button
                className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-[#f4faff] transition"
                onClick={handleCloseCreateModal}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="parentSelect"
                  className="font-medium text-gray-700"
                >
                  Select Recipient:
                </label>
                <select
                  id="parentSelect"
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  className="border border-[#dbedff] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#accbff] text-gray-800"
                >
                  {parents?.data?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.fullname}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="messageText"
                  className="font-medium text-gray-700"
                >
                  Message:
                </label>
                <textarea
                  id="messageText"
                  rows={4}
                  className="border border-[#dbedff] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#accbff] text-gray-800 resize-none"
                  placeholder="Type your message..."
                  value={newMsgText}
                  onChange={(e) => setNewMsgText(e.target.value)}
                ></textarea>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  className="flex-1 bg-[#f4faff] text-gray-700 px-4 py-2 rounded-md hover:bg-[#dbedff] transition duration-200"
                  onClick={handleCloseCreateModal}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-[#8993ff] text-white px-4 py-2 rounded-md flex items-center justify-center disabled:opacity-50 hover:bg-[#93acff] transition duration-200"
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isLoading || !newMsgText.trim()}
                >
                  {sendMessageMutation.isLoading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
