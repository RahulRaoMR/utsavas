"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../components/PanelChat.module.css";
import {
  clearVendorSession,
  getVendorAuthHeaders,
  getVendorSession,
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

const syncStoredVendor = (updates) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const currentVendor = JSON.parse(localStorage.getItem("vendor") || "null");

    if (!currentVendor) {
      return;
    }

    localStorage.setItem(
      "vendor",
      JSON.stringify({
        ...currentVendor,
        ...updates,
      })
    );
  } catch {
    // Ignore local storage sync issues for non-blocking UI state.
  }
};

export default function VendorChatsPage() {
  const router = useRouter();
  const bottomRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
  const [availableHalls, setAvailableHalls] = useState([]);
  const [vendorSettings, setVendorSettings] = useState({
    businessName: "",
    ownerName: "",
    isOnline: false,
    autoReplyEnabled: true,
  });
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hallFilter, setHallFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingReply, setSavingReply] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [errorText, setErrorText] = useState("");

  const fetchConversationList = useCallback(
    async (options = {}) => {
      try {
        const session = getVendorSession();

        if (!session.vendor || !session.vendorId || !session.token) {
          clearVendorSession();
          router.replace("/vendor/vendor-login");
          return [];
        }

        if (!options.silent) {
          setLoading(true);
        }

        const query = new URLSearchParams({
          status: statusFilter,
          q: searchQuery,
        });

        if (hallFilter) {
          query.set("hallId", hallFilter);
        }

        const response = await fetch(
          `${API}/api/chat/vendor/conversations?${query.toString()}`,
          {
            headers: getVendorAuthHeaders(),
            cache: "no-store",
          }
        );

        if (response.status === 401 || response.status === 403) {
          clearVendorSession();
          router.replace("/vendor/vendor-login");
          return [];
        }

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load vendor chats");
        }

        const nextConversations = Array.isArray(payload?.conversations)
          ? payload.conversations
          : [];

        setErrorText("");
        setConversations(nextConversations);
        setAnalytics(payload?.analytics || EMPTY_ANALYTICS);
        setAvailableHalls(
          Array.isArray(payload?.availableHalls) ? payload.availableHalls : []
        );
        setVendorSettings(
          payload?.vendor || {
            businessName: "",
            ownerName: "",
            isOnline: false,
            autoReplyEnabled: true,
          }
        );

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
        console.error("Vendor chat list error", error);
        setErrorText(error.message || "Unable to load vendor chats right now.");
        return [];
      } finally {
        if (!options.silent) {
          setLoading(false);
        }
      }
    },
    [hallFilter, router, searchQuery, statusFilter]
  );

  const fetchConversationDetail = useCallback(async () => {
    if (!selectedConversationId) {
      setSelectedConversation(null);
      return;
    }

    try {
      setDetailLoading(true);
      const response = await fetch(
        `${API}/api/chat/vendor/conversations/${selectedConversationId}`,
        {
          headers: getVendorAuthHeaders(),
          cache: "no-store",
        }
      );

      if (response.status === 401 || response.status === 403) {
        clearVendorSession();
        router.replace("/vendor/vendor-login");
        return;
      }

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to load conversation");
      }

      setSelectedConversation(payload?.conversation || null);
      setErrorText("");
    } catch (error) {
      console.error("Vendor chat detail error", error);
      setErrorText(error.message || "Unable to load the selected lead.");
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

  const selectedConversationStatus = selectedConversation?.status || "new";

  const averageResponseLabel =
    analytics.averageFirstResponseMinutes === null
      ? "Waiting for first vendor reply"
      : `${analytics.averageFirstResponseMinutes} min`;

  const hallBreakdown = useMemo(
    () => (Array.isArray(analytics?.hallBreakdown) ? analytics.hallBreakdown : []),
    [analytics]
  );

  const updateVendorSettings = async (nextUpdates) => {
    try {
      setSavingSettings(true);
      const response = await fetch(`${API}/api/chat/vendor/settings`, {
        method: "PATCH",
        headers: getVendorAuthHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(nextUpdates),
      });

      if (response.status === 401 || response.status === 403) {
        clearVendorSession();
        router.replace("/vendor/vendor-login");
        return;
      }

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to update chat settings");
      }

      setVendorSettings(payload?.vendor || vendorSettings);
      syncStoredVendor(payload?.vendor || {});
      setErrorText("");
    } catch (error) {
      console.error("Vendor settings update error", error);
      setErrorText(error.message || "Unable to update chat settings right now.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleReply = async () => {
    if (!selectedConversationId || !replyDraft.trim()) {
      return;
    }

    try {
      setSavingReply(true);
      const response = await fetch(
        `${API}/api/chat/vendor/conversations/${selectedConversationId}/messages`,
        {
          method: "POST",
          headers: getVendorAuthHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            text: replyDraft,
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        clearVendorSession();
        router.replace("/vendor/vendor-login");
        return;
      }

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Failed to send reply");
      }

      setSelectedConversation(payload?.conversation || null);
      setReplyDraft("");
      setErrorText("");
      await fetchConversationList({ silent: true });
    } catch (error) {
      console.error("Vendor reply error", error);
      setErrorText(error.message || "Unable to send the vendor reply.");
    } finally {
      setSavingReply(false);
    }
  };

  const updateLeadStatus = async (status) => {
    if (!selectedConversationId) {
      return;
    }

    try {
      setSavingStatus(true);
      const response = await fetch(
        `${API}/api/chat/vendor/conversations/${selectedConversationId}/status`,
        {
          method: "PATCH",
          headers: getVendorAuthHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ status }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        clearVendorSession();
        router.replace("/vendor/vendor-login");
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
      console.error("Vendor status update error", error);
      setErrorText(error.message || "Unable to update the lead status.");
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Vendor CRM</p>
            <h1 className={styles.title}>Lead inbox and venue chat</h1>
            <p className={styles.copy}>
              Manage venue-owner conversations, reply to customers, toggle your
              online status, and track conversion from chat to booking.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => router.push("/vendor/dashboard")}
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
            <span>Avg first response</span>
            <strong>{averageResponseLabel}</strong>
            <small>
              Based on the first vendor reply across responded customer leads.
            </small>
          </div>
        </div>

        <div className={styles.settingsGrid}>
          <section className={styles.toggleCard}>
            <h3>Owner availability</h3>
            <p>
              When you are offline, the assistant will auto-reply if that mode
              is enabled.
            </p>

            <div className={styles.toggleRow}>
              <button
                type="button"
                className={`${styles.toggleButton} ${
                  vendorSettings.isOnline ? styles.toggleButtonActive : ""
                }`}
                disabled={savingSettings}
                onClick={() =>
                  updateVendorSettings({ isOnline: !vendorSettings.isOnline })
                }
              >
                {vendorSettings.isOnline ? "Online now" : "Set online"}
              </button>

              <button
                type="button"
                className={`${styles.toggleButton} ${
                  vendorSettings.autoReplyEnabled
                    ? styles.toggleButtonActive
                    : ""
                }`}
                disabled={savingSettings}
                onClick={() =>
                  updateVendorSettings({
                    autoReplyEnabled: !vendorSettings.autoReplyEnabled,
                  })
                }
              >
                {vendorSettings.autoReplyEnabled
                  ? "Auto reply on"
                  : "Auto reply off"}
              </button>
            </div>
          </section>

          <section className={styles.analyticsCard}>
            <h3>Hall-wise lead performance</h3>
            <p>
              See which halls are converting more conversations into real
              bookings.
            </p>

            {hallBreakdown.length === 0 ? (
              <p className={styles.emptyState}>
                No lead data has been tracked yet for your halls.
              </p>
            ) : (
              <div className={styles.analyticsList}>
                {hallBreakdown.slice(0, 4).map((hall) => (
                  <div key={hall.hallId} className={styles.analyticsRow}>
                    <strong>{hall.hallName}</strong>
                    <span>
                      {hall.totalLeads} leads • {hall.bookedLeads} booked •{" "}
                      {hall.totalMessages} messages
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className={styles.filterBar}>
          <label className={styles.filterField}>
            Search
            <input
              type="text"
              placeholder="Customer, hall, phone, or message"
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

          <label className={styles.filterField}>
            Hall
            <select
              value={hallFilter}
              onChange={(event) => setHallFilter(event.target.value)}
            >
              <option value="">All halls</option>
              {availableHalls.map((hall) => (
                <option key={hall.hallId} value={hall.hallId}>
                  {hall.hallName}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.workspace}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3>Customer leads</h3>
                <p>{loading ? "Loading..." : `${conversations.length} leads found`}</p>
              </div>
            </div>

            <div className={styles.panelBody}>
              {conversations.length === 0 ? (
                <p className={styles.emptyState}>
                  No customer leads yet. New venue chats will appear here.
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
                          <span>{conversation.hallName}</span>
                        </div>

                        <div>
                          <span
                            className={`${styles.statusBadge} ${getStatusClassName(
                              conversation.status
                            )}`}
                          >
                            {conversation.status}
                          </span>
                          {conversation.unreadByVendor > 0 ? (
                            <span className={styles.unreadBadge}>
                              {conversation.unreadByVendor}
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
                    ? `Lead for ${selectedConversation.hall?.hallName || selectedConversation.hallName}`
                    : "Select a lead from the left to reply"}
                </p>
              </div>
            </div>

            <div className={styles.panelBody}>
              {detailLoading ? (
                <p className={styles.emptyState}>Loading conversation...</p>
              ) : !selectedConversation ? (
                <p className={styles.emptyState}>
                  Select a customer lead to open the chat thread and CRM details.
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
                      <span>Status</span>
                      <strong>{selectedConversation.status}</strong>
                    </div>
                  </div>

                  <div className={styles.statusRow}>
                    {["new", "contacted", "booked", "closed"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={savingStatus}
                        className={`${styles.statusButton} ${
                          selectedConversationStatus === status
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
                      placeholder="Reply to the customer here"
                    />

                    <div className={styles.composerActions}>
                      {errorText ? (
                        <p className={styles.errorText}>{errorText}</p>
                      ) : (
                        <p className={styles.hint}>
                          Replies go to the customer chat instantly and keep the
                          lead updated.
                        </p>
                      )}

                      <button
                        type="button"
                        className={styles.primaryButton}
                        disabled={savingReply || !replyDraft.trim()}
                        onClick={handleReply}
                      >
                        {savingReply ? "Sending..." : "Send reply"}
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
