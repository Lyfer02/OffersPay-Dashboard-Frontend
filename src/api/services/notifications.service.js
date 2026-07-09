// src/services/NotificationService.js
import API from "../axios";               // Same axios instance used in authService
import { endpoints } from "../endpoints";

export const NotificationService ={
  /**
   * Send notification (admin only)
   * @param {Object} payload
   * @param {string} payload.title
   * @param {string} payload.body
   * @param {File} [payload.image] - optional image file
   * @param {Object} [payload.data] - extra data (offerId, etc.)
   * @param {string[]} [payload.userIds] - array of user _id (null = broadcast)
   */
    send:({ title, body, image, data = {}, userIds = null })=> {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    if (image) formData.append("image", image);
    if (data && Object.keys(data).length) {
      formData.append("data", JSON.stringify(data));
    }
    if (userIds && Array.isArray(userIds) && userIds.length) {
      userIds.forEach(id => formData.append("userIds[]", id));
    }

    return API.post(endpoints.notifications.send, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Get in-app notifications for current user
   * @param {number} [page=1]
   * @param {number} [limit=20]
   */
  getList :(page = 1, limit = 20) =>{
    return API.get(endpoints.notifications.list, {
      params: { page, limit },
    });
  },

  /**
   * Mark notification as seen
   * @param {string} notificationId
   */
  markAsSeen: (notificationId) =>{
    return API.post(endpoints.notifications.seen(notificationId));
  }
}

