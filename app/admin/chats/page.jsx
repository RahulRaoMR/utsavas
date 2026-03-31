"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../components/PanelChat.module.css";
import {
  clearAdminSession,
  getAdminAuthHeaders,
  getAdminToken,
} from "../../../lib/panelAuth";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

const EMPTY_ANALYTICS = {
  totalLeads: 0,
  newLeads: 0,
  contactedLeads: 0,
  bookedLeads: 0,
  closedLeads: 0,
  totalMessages: 0,
  averageFirstResponseMinutes: null,
  hallBreakdown: [],
};

const getStatusClassName = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "booked") return styles.statusBooked;
  if (normalizedStatus === "contacted") return styles.statusContacted;
  if (normalizedStatus === "closed") return styles.statusClosed;
  return styles.statusNew;
};

const formatDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function AdminChatsPage() {
  const router = useRouter();
  const bottomRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingReply, setSavingReply] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [errorText, setErrorText] = useState("");

  const fetchConversationList = useCallback(
    async (options = {}) => {
      try {
        const adminToken = getAdminToken();

        if (!adminToken) {
          clearAdminSession();
          router.replace("/admin/login");
          return [];
        }

        if (!options.silent) {
          setLoading(true);
        }

        const query = new URLSearchParams({
          status: statusFilter,
          q: searchQuery,
        });

        const response = await fetch(
          `${API}/api/chat/admin/conversations?${query.toString()}`,
          {
            headers: getAdminAuthHeaders(),
            cache: "no-store",
          }
        );

        if (response.status === 401 || response.status === 403) {
          clearAdminSession();
          router.replace("/admin/login");
          return [];
        }

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load admin chats");
        }

        const nextConversations = Array.isArray(payload?.conversations)
          ? payload.conversations
          : [];

        setErrorText("");
        setConversations(nextConversations);
        setAnalytics(payload?.analytics || EMPTY_ANALYTICS);
        setSelectedConversationId((currentValue) => {
          if (
            currentValue &&
            nextConversations.some(
              (conversation) => String(conversation._id) === String(currentValue)
            )
          ) {
            return currentValue;
          }

          return nextConversations[0]?._id || "";
        });

        return nextConversations;
      } catch (error) {
        console.error("Admin chat list error", error);
        setErrorText(error.message || "Unable to load admin conversations.");
        return [];
      } finally {
        if (!options.silent) {
          setLoading(false);
        }
      }
    },
    [router, searchQuery, statusFilter]
  );

  const fetchConversationDetail = useCallback(async () => {
    if (!selectedConversationId) {
      setSelectedConversation(null);
      return;
    }

    try {
      setDetailLoading(true);
      const response = await fetch(
        `${API}/api/chat/admin/conversations/${selectedConversationId}`,
        {
          headers: getAdminAuthHeaders(),
          cache: "no-store",
        }
      );

      if (response.status === 401 || response.status === 403) {
        clearAdminSession();
        router.replace("/admin/login");
        return;
      }

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load conversation");
      }

      setSelectedConversation(payload?.conversation || null);
      setErrorText("");
    } catch (error) {
      console.error("Admin chat detail error", error);
      setErrorText(error.message || "Unable to load the selected conversation.");
    } finally {
      setDetailLoading(false);
    }
  }, [router, selectedConversationId]);

  useEffect(() => {
    fetchConversationList();
  }, [fetchConversationList]);

  useEffect(() => {
    fetchConversationDetail();
  }, [fetchConversationDetail]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchConversationList({ silent: true });
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchConversationList]);

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    const intervalId = window.setInterval(() => {
      fetchConversationDetail();
    }, 8000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchConversationDetail, selectedConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [selectedConversation?.messages?.length]);

  const averageResponseLabel =
    analytics.averageFirstResponseMinutes === null
      ? "Waiting for first vendor reply"
      : `${analytics.averageFirstResponseMinutes} min`;

  const updateLeadStatus = async (status) => {
    if (!selectedConversationId) {
      return;
    }

    try {
      setSavingStatus(true);
      const response = await fetch(
        `${API}/api/chat/admin/conversations/${selectedConversationId}/status`,
        {
          method: "PATCH",
          headers: getAdminAuthHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ status }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        clearAdminSession();
        router.replace("/admin/login");
        return;
      }

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to update lead status");
      }

      setSelectedConversation(payload?.conversation || null);
      setErrorText("");
      await fetchConversationList({ silent: true });
    } catch (error) {
      console.error("Admin status update error", error);
      setErrorText(error.message || "Unable to update the lead status.");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleReply = async () => {
    if (!selectedConversationId || !replyDraft.trim()) {
      return;
    }

    try {
      setSavingReply(true);
      const response = await fetch(
        `${API}/api/chat/admin/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",
          headers: getAdminAuthHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            text: replyDraft,
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        clearAdminSession();
        router.replace("/admin/login");
        return;
      }

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to send admin reply");
      }

      setSelectedConversation(payload?.conversation || null);
      setReplyDraft("");
      setErrorText("");
      await fetchConversationList({ silent: true });
    } catch (error) {
      console.error("Admin reply error", error);
      setErrorText(error.message || "Unable to send the admin reply.");
    } finally {
      setSavingReply(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Admin CRM</p>
            <h1 className={styles.title}>Platform venue chats</h1>
            <p className={styles.copy}>
              Review all venue-owner conversations, assist customers directly,
              and track chat-to-booking movement across the platform.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => router.push("/admin/dashboard")}
            >
              Back to dashboard
            </button>
          </div>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span>Total leads</span>
            <strong>{analytics.totalLeads}</strong>
          </div>

          <div className={styles.summaryCard}>
            <span>New leads</span>
            <strong>{analytics.newLeads}</strong>
          </div>

          <div className={styles.summaryCard}>
            <span>Contacted</span>
            <strong>{analytics.contactedLeads}</strong>
          </div>

          <div className={styles.summaryCard}>
            <span>Booked</span>
            <strong>{analytics.bookedLeads}</strong>
          </div>

          <div className={styles.summaryCard}>
            <span>Avg first vendor response</span>
            <strong>{averageResponseLabel}</strong>
            <small>
              Platform-wide response timing based on the first vendor reply per
              conversation.
            </small>
          </div>
        </div>

        <section className={styles.analyticsCard}>
          <h3>Top lead-generating halls</h3>
          <p>
            Admin can see which halls are generating the most customer
            conversations and which ones are converting better.
          </p>

          {analytics.hallBreakdown?.length ? (
            <div className={styles.analyticsList}>
              {analytics.hallBreakdown.slice(0, 5).map((hall) => (
                <div key={hall.hallId} className={styles.analyticsRow}>
                  <strong>
                    {hall.hallName} • {hall.vendorName}
                  </strong>
                  <span>
                    {hall.totalLeads} leads • {hall.bookedLeads} booked •{" "}
                    {hall.totalMessages} messages
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>
              No hall chat analytics have been recorded yet.
            </p>
          )}
        </section>

        <div className={styles.filterBar}>
          <label className={styles.filterField}>
            Search
            <input
              type="text"
              placeholder="Customer, hall, vendor, or message"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>

          <label className={styles.filterField}>
            Lead status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All leads</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="booked">Booked</option>
              <option value="closed">Closed</option>
            </select>
          </label>

          <div className={styles.filterField}>
            <span>Messages tracked</span>
            <input
              type="text"
              value={String(analytics.totalMessages || 0)}
              readOnly
              className={styles.textInput}
            />
          </div>
        </div>

        <div className={styles.workspace}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3>All customer conversations</h3>
                <p>{loading ? "Loading..." : `${conversations.length} leads found`}</p>
              </div>
            </div>

            <div className={styles.panelBody}>
              {conversations.length === 0 ? (
                <p className={styles.emptyState}>
                  No customer chats yet. New hall conversations will appear
                  here.
                </p>
              ) : (
                <div className={styles.list}>
                  {conversations.map((conversation) => (
                    <button
                      key={conversation._id}
                      type="button"
                      className={`${styles.conversationCard} ${
                        String(conversation._id) === String(selectedConversationId)
                          ? styles.conversationCardActive
                          : ""
                      }`}
                      onClick={() => setSelectedConversationId(conversation._id)}
                    >
                      <div className={styles.conversationTop}>
                        <div>
                          <strong>{conversation.customerName}</strong>
                          <span>
                            {conversation.hallName} • {conversation.vendorName}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`${styles.statusBadge} ${getStatusClassName(
                              conversation.status
                            )}`}
                          >
                            {conversation.status}
                          </span>
                          {conversation.unreadByAdmin > 0 ? (
                            <span className={styles.unreadBadge}>
                              {conversation.unreadByAdmin}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <p className={styles.conversationPreview}>
                        {conversation.lastMessageText || "No messages yet."}
                      </p>

                      <span className={styles.conversationTime}>
                        {formatDateTime(conversation.lastMessageAt)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3>Conversation detail</h3>
                <p>
                  {selectedConversation
                    ? `Admin assistance for ${selectedConversation.customer?.name}`
                    : "Select a lead from the left to reply as admin"}
                </p>
              </div>
            </div>

            <div className={styles.panelBody}>
              {detailLoading ? (
                <p className={styles.emptyState}>Loading conversation...</p>
              ) : !selectedConversation ? (
                <p className={styles.emptyState}>
                  Select a lead to read the full conversation and reply as admin.
                </p>
              ) : (
                <>
                  <div className={styles.detailMetaGrid}>
                    <div className={styles.detailMetaCard}>
                      <span>Customer</span>
                      <strong>{selectedConversation.customer?.name || "-"}</strong>
                    </div>

                    <div className={styles.detailMetaCard}>
                      <span>Phone</span>
                      <strong>{selectedConversation.customer?.phone || "-"}</strong>
                    </div>

                    <div className={styles.detailMetaCard}>
                      <span>Hall</span>
                      <strong>{selectedConversation.hall?.hallName || "-"}</strong>
                    </div>

                    <div className={styles.detailMetaCard}>
                      <span>Vendor</span>
                      <strong>{selectedConversation.vendor?.businessName || "-"}</strong>
                    </div>
                  </div>

                  <div className={styles.statusRow}>
                    {["new", "contacted", "booked", "closed"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={savingStatus}
                        className={`${styles.statusButton} ${
                          String(selectedConversation.status) === status
                            ? styles.statusButtonActive
                            : ""
                        }`}
                        onClick={() => updateLeadStatus(status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <div className={styles.messages}>
                    {selectedConversation.messages?.map((message) => (
                      <div
                        key={message.id}
                        className={`${styles.bubble} ${
                          message.senderType === "user"
                            ? styles.bubbleUser
                            : message.senderType === "bot"
                            ? styles.bubbleBot
                            : message.senderType === "admin"
                            ? styles.bubbleAdmin
                            : styles.bubbleVendor
                        }`}
                      >
                        <div className={styles.bubbleMeta}>
                          <strong>{message.senderName || message.senderType}</strong>
                          <span>{formatDateTime(message.createdAt)}</span>
                        </div>
                        <p>{message.text}</p>
                      </div>
                    ))}

                    <div ref={bottomRef} />
                  </div>

                  <div className={styles.composer}>
                    <textarea
                      value={replyDraft}
                      onChange={(event) => setReplyDraft(event.target.value)}
                      placeholder="Reply to the customer as UTSAVAS Admin"
                    />

                    <div className={styles.composerActions}>
                      {errorText ? (
                        <p className={styles.errorText}>{errorText}</p>
                      ) : (
                        <p className={styles.hint}>
                          Admin replies help when the vendor is offline or needs
                          escalation support.
                        </p>
                      )}

                      <button
                        type="button"
                        className={styles.primaryButton}
                        disabled={savingReply || !replyDraft.trim()}
                        onClick={handleReply}
                      >
                        {savingReply ? "Sending..." : "Send admin reply"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
